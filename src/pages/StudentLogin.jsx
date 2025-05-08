import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Box, Typography } from '@mui/material';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export default function StudentLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [shouldLogout, setShouldLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, forceSignOut, user, profile } = useAuth();

  // Handle location state message
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
    
    // Check if we were redirected here after logout
    if (location.state?.fromLogout) {
      setMessage('You have been successfully logged out.');
    }
  }, [location.state]);

  // Check for auth state on component mount
  useEffect(() => {
    const checkSession = async () => {
      // Check if there's a Supabase session but no React state
      // This helps catch orphaned sessions
      const { data } = await supabase.auth.getSession();
      if (data.session && !user) {
        console.log('Found orphaned session, cleaning up...');
        await forceSignOut();
        setMessage('Your session was reset. Please login again.');
      }
    };
    
    checkSession();
  }, [forceSignOut, user]);

  // Check if user is already logged in
  useEffect(() => {
    if (user && profile) {
      // If already logged in as a student, redirect to dashboard
      if (profile.type === 'student') {
        navigate('/student-dashboard');
      } 
      // If logged in as another type, show error and logout option
      else if (profile.type === 'teacher' || profile.type === 'admin') {
        const userType = profile.type === 'teacher' ? 'teacher' : 'admin';
        setError(`You are currently logged in as a ${userType}. Would you like to logout and continue as a student?`);
        setShouldLogout(true);
      }
    }
  }, [user, profile, navigate]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      // Clear the error and shouldLogout state
      setError(null);
      setShouldLogout(false);
      setMessage('Successfully logged out. You can now login as a student.');
    } catch (err) {
      console.error('Logout failed:', err);
      // If normal logout fails, use the force logout
      await forceSignOut();
      setMessage('Your session has been reset. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await signIn(credentials);
      if (authError) throw authError;

      // Verify user is a student by checking the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, type')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        // If profile check fails, log out and show error
        await signOut();
        throw new Error('Failed to retrieve user profile. Please try again.');
      }

      if (!profileData || profileData.type !== 'student') {
        // Sign out if not a student
        await signOut();
        throw new Error('Access denied. This account is not registered as a student.');
      }

      // Redirect to student dashboard
      navigate('/student-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide more user-friendly error messages
      if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email address before logging in.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      
      {error && shouldLogout ? (
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
            {loading ? 'Logging out...' : 'Logout and Continue'}
          </Button>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      
      <LoginForm
        title="Student Login"
        onSubmit={handleSubmit}
        loading={loading}
        registerLink="/student-registration"
        forgotPasswordLink="/forgot-password"
      />
      
      {/* Add debug button in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 3, p: 2, border: '1px dashed grey' }}>
          <Typography variant="caption" display="block" gutterBottom>
            Debug Tools (Development Only)
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            color="error" 
            onClick={forceSignOut}
            sx={{ mr: 1 }}
          >
            Force Logout
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              const currentState = { user, profile };
              console.log('Current auth state:', currentState);
              alert(`Logged in: ${!!user}\nUser type: ${profile?.type || 'none'}`);
            }}
          >
            Check Auth State
          </Button>
        </Box>
      )}
    </>
  );
}