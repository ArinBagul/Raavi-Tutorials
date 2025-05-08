import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { RegistrationForm } from '../components/RegistrationForm';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Box, Button } from '@mui/material';
import { useDialog } from '../contexts/DialogContext';

export default function StudentRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [shouldLogout, setShouldLogout] = useState(false);
  const navigate = useNavigate();
  const { signUp, signOut, forceSignOut, user, profile } = useAuth();
  const { showSnackbar } = useDialog();

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      setCheckingAuth(true);
      try {
        // Check if there's an existing session
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setShouldLogout(true);
          setError('You are currently logged in. Please log out before creating a new account.');
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkExistingAuth();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      setShouldLogout(false);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
      await forceSignOut();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    // Track uploaded files for potential cleanup
    const uploadedFiles = [];
    let newUserId = null;
    
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
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        // Provide more user-friendly error messages
        if (authError.message.includes('email already')) {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        } else {
          throw authError;
        }
      }

      if (!authData.user) {
        throw new Error('Registration failed. Please try again.');
      }

      newUserId = authData.user.id;
      
      // Wait briefly for the trigger to create the profile
      console.log('Waiting for profile creation...');
      
      // More sophisticated waiting logic
      let profileData = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!profileData && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();
          
        if (data && !profileCheckError) {
          profileData = data;
          break;
        }
        
        console.log(`Profile check attempt ${attempts}/${maxAttempts}...`);
      }
        
      if (!profileData) {
        throw new Error('Profile creation took too long. Please check your email and continue setup after verifying your account.');
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

      // Sign out after successful registration to avoid conflicts
      await signOut();

      // Show success message and navigate
      showSnackbar({
        message: 'Registration successful! Please check your email to verify your account.',
        severity: 'success'
      });
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/student-login');
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
            .from('student-documents')
            .remove(uploadedFiles);
        } catch (cleanupErr) {
          console.error('Failed to clean up uploaded files:', cleanupErr);
        }
      }
      
      // If user was created but later steps failed, we may want to clean up the user
      // This is commented out because it's generally better to let the user try again
      // rather than deleting their account, especially if they received a verification email
      /*
      if (newUserId) {
        try {
          // This would require admin privileges and is not typically available in client code
          // Consider using a serverless function for this cleanup
          console.log('User account was created but registration failed. Manual cleanup may be required.');
        } catch (deleteErr) {
          console.error('Failed to clean up user account:', deleteErr);
        }
      }
      */
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div>Checking authentication status...</div>;
  }

  return (
    <>
      {shouldLogout && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Logging out...' : 'Log Out and Continue'}
          </Button>
        </Box>
      )}
      
      {!shouldLogout && (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <RegistrationForm
            type="student"
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </>
      )}
    </>
  );
}