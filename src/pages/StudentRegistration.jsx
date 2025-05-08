import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { RegistrationForm } from '../components/RegistrationForm';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useDialog } from '../contexts/DialogContext';
import { CheckCircle, Error } from '@mui/icons-material';

export default function StudentRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [shouldLogout, setShouldLogout] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState('');
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

  // Handle redirect after successful registration
  useEffect(() => {
    let redirectTimer;
    if (registrationStatus === 'success') {
      redirectTimer = setTimeout(() => {
        navigate('/student-login');
      }, 5000); // Longer timeout to let user read the success message
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [registrationStatus, navigate]);

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
    setRegistrationStatus(null);
    
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
      
      // Wait for profile creation
      console.log('Waiting for profile creation...');
      
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

      // Handle passport photo upload (the only required document)
      const documentUrls = {};
      const passportPhoto = formData.documents?.photo;
      
      if (passportPhoto) {
        try {
          // Simplify the file path
          const fileName = `${authData.user.id}/photo-${passportPhoto.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          console.log("Uploading passport photo:", fileName);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('student-documents')
            .upload(fileName, passportPhoto, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error("Photo upload error:", uploadError);
            throw uploadError;
          }
          
          // Get the public URL for the file
          const { data: urlData } = supabase.storage
            .from('student-documents')
            .getPublicUrl(fileName);
            
          documentUrls.photo = urlData.publicUrl;
          uploadedFiles.push(fileName);
          
        } catch (uploadErr) {
          console.error(`Error uploading passport photo:`, uploadErr);
          documentUrls.photo = null;
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
          photo: documentUrls.photo, // Set photo URL directly in profile
          document_urls: documentUrls,
          updated_at: new Date()
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Sign out after successful registration to avoid conflicts
      await signOut();

      // Set success status
      setRegistrationStatus('success');
      setStatusMessage('Registration successful! Please check your email to verify your account before logging in.');
      
      // Also show the snackbar for immediate feedback
      showSnackbar({
        message: 'Registration successful! Please check your email.',
        severity: 'success'
      });

    } catch (err) {
      console.error('Registration error:', err);
      
      // Set error status
      setRegistrationStatus('error');
      setStatusMessage(err.message || 'Registration failed. Please try again.');
      
      // Show error in snackbar
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
    } finally {
      setLoading(false);
    }
  };

  // Show status screen after registration attempt
  const renderStatusScreen = () => {
    if (registrationStatus === 'success') {
      return (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>Registration Successful!</Typography>
          <Typography variant="body1" paragraph>
            {statusMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to login page in 5 seconds...
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            onClick={() => navigate('/student-login')}
          >
            Go to Login
          </Button>
        </Paper>
      );
    } else if (registrationStatus === 'error') {
      return (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>Registration Failed</Typography>
          <Typography variant="body1" paragraph>
            {statusMessage}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            onClick={() => {
              setRegistrationStatus(null);
              setError(null);
            }}
          >
            Try Again
          </Button>
        </Paper>
      );
    }
    
    return null;
  };

  if (checkingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Checking authentication status...
        </Typography>
      </Box>
    );
  }

  // If registration is complete (success or error), show the status screen
  if (registrationStatus) {
    return renderStatusScreen();
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
            // This indicates to the form component that only passport photo is required
            requiredDocuments={['photo']} 
          />
        </>
      )}
    </>
  );
}