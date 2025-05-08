import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { RegistrationForm } from '../components/RegistrationForm';
import { useAuth } from '../contexts/AuthContext';

export default function StudentRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    // Track uploaded files for potential cleanup
    const uploadedFiles = [];
    
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            type: 'student',
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
            // Simplify the file path
            const fileName = `${authData.user.id}/${key}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            console.log("Uploading file:", fileName);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('student-documents')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true  // Changed to true to avoid conflicts
              });

            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw uploadError;
            }
            
            // Get the public URL for the file
            const { data: urlData } = supabase.storage
              .from('student-documents')
              .getPublicUrl(fileName);
              
            documentUrls[key] = urlData.publicUrl;
            uploadedFiles.push(fileName);
            
          } catch (uploadErr) {
            console.error(`Error uploading ${key}:`, uploadErr);
            // Continue with other files instead of breaking the whole registration
            documentUrls[key] = null;
          }
        }
      }

      // Prepare selected subjects if available
      const selectedSubjects = formData.subjects ? 
        formData.subjects.map(subject => ({ 
          name: subject,
          level: formData.level || 'standard'
        })) : null;

      // Update the profile with additional student information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          gender: formData.gender,
          address: formData.address,
          current_class: formData.grade,
          board: formData.board,
          school: formData.school,
          medium: formData.medium,
          selected_subjects: selectedSubjects,
          blood_group: formData.bloodGroup,
          nationality: formData.nationality,
          religion: formData.religion,
          category: formData.category,
          aadhaar: formData.aadhaar,
          parent_info: {
            father_name: formData.fatherName,
            father_phone: formData.fatherPhone,
            father_occupation: formData.fatherOccupation,
            mother_name: formData.motherName,
            mother_phone: formData.motherPhone,
            mother_occupation: formData.motherOccupation
          },
          emergency_contact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relation: formData.emergencyContactRelation
          },
          document_urls: documentUrls,
          updated_at: new Date()
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      navigate('/student-login', { 
        state: { message: 'Registration successful! Please check your email to verify your account.' }
      });
    } catch (err) {
      setError(err.message);
      
      // Clean up any uploaded files if profile creation fails
      if (uploadedFiles.length > 0) {
        try {
          await supabase.storage
            .from('student-documents')
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
      type="student"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
}