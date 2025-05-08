import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { RegistrationForm } from '../components/RegistrationForm';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';

export default function TeacherRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showSnackbar } = useDialog();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    const uploadedFiles = [];
    
    try {
      const { data: authData, error: authError } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            type: 'teacher',
            username: formData.email.split('@')[0],
            name: formData.name
          }
        }
      });

      if (authError) throw authError;
      
      // Wait briefly for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify profile was created
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
        
      if (profileCheckError || !profileData) {
        throw new Error('Profile creation failed. Please try again.');
      }

      // Upload documents to Supabase Storage
      const documentUrls = {};
      if (formData.documents) {
        for (const [key, file] of Object.entries(formData.documents)) {
          if (!file) continue;
          
          try {
            const fileName = `${authData.user.id}/${key}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('teacher-documents')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
              });

            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage
              .from('teacher-documents')
              .getPublicUrl(fileName);
              
            documentUrls[key] = urlData.publicUrl;
            uploadedFiles.push(fileName);
          } catch (uploadErr) {
            console.error(`Error uploading ${key}:`, uploadErr);
            documentUrls[key] = null;
          }
        }
      }

      const subjects = typeof formData.subjects === 'string' ? 
        formData.subjects
          .split(',')
          .map(subject => subject.trim())
          .filter(subject => subject.length > 0)
        : formData.subjects || [];

      const experience = [
        {
          institution: formData.institution || '',
          position: formData.position || '',
          years: formData.experienceYears || '',
          description: formData.experienceDesc || ''
        }
      ];

      const qualifications = [
        {
          degree: formData.qualification || '',
          institution: formData.qualificationInstitute || '',
          year: formData.qualificationYear || '',
          specialization: formData.specialization || ''
        }
      ];

      // Update the profile with teacher information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          gender: formData.gender,
          address: formData.address,
          subjects: subjects,
          employment_type: formData.employmentType || 'part-time',
          available_hours: formData.availableHours || '',
          qualifications: qualifications,
          experience: experience,
          teaching_approach: formData.teachingApproach || '',
          expected_salary: formData.expectedSalary || null,
          certifications: formData.certifications ? 
            formData.certifications.map(cert => ({ name: cert })) : [],
          document_urls: documentUrls,
          updated_at: new Date()
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Show success message
      showSnackbar({
        message: 'Registration successful! Please check your email to verify your account.',
        severity: 'success'
      });
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/teacher-login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      showSnackbar({
        message: err.message || 'Registration failed. Please try again.',
        severity: 'error'
      });
      setError(err.message);
      
      // Clean up any uploaded files if profile creation fails
      if (uploadedFiles.length > 0) {
        try {
          await supabase.storage
            .from('teacher-documents')
            .remove(uploadedFiles);
        } catch (cleanupErr) {
          console.error('Failed to clean up uploaded files:', cleanupErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationForm
      type="teacher"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
}