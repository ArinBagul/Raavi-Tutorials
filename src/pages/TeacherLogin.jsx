import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export default function TeacherLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, profile } = useAuth();

  // Handle location state message
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  // Check if user is already logged in
  useEffect(() => {
    if (user && profile) {
      // If already logged in as a teacher, redirect to dashboard
      if (profile.type === 'teacher') {
        navigate('/teacher-dashboard');
      } 
      // If logged in as another type, show error
      else if (profile.type === 'student') {
        setError('You are logged in as a student. Please use the student login page.');
      } else if (profile.type === 'admin') {
        setError('You are logged in as an admin. Please use the admin login page.');
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await signIn(credentials);
      if (authError) throw authError;

      // Verify user is a teacher by checking the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, type')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to retrieve user profile. Please try again.');
      }

      if (!profileData || profileData.type !== 'teacher') {
        // Sign out if not a teacher
        await supabase.auth.signOut();
        throw new Error('Access denied. This account is not registered as a teacher.');
      }

      // Redirect to teacher dashboard
      navigate('/teacher-dashboard');
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <LoginForm
        title="Teacher Login"
        onSubmit={handleSubmit}
        loading={loading}
        registerLink="/teacher-registration"
        forgotPasswordLink="/forgot-password"
      />
    </>
  );
}