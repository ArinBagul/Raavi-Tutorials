import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { LoadingScreen } from './LoadingScreen';
import { useDialog } from '../contexts/DialogContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { showSnackbar } = useDialog();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        showSnackbar({
          message: 'Authentication error. Please try logging in again.',
          severity: 'error'
        });
        navigate('/login');
        return;
      }

      if (session?.user) {
        // Get the user's profile to determine their type
        const { data: profile } = await supabase
          .from('profiles')
          .select('type')
          .eq('id', session.user.id)
          .single();

        let redirectPath = '/';
        if (profile?.type === 'student') {
          redirectPath = '/student-login';
        } else if (profile?.type === 'teacher') {
          redirectPath = '/teacher-login';
        }

        showSnackbar({
          message: 'Email verified successfully! Please log in to continue.',
          severity: 'success'
        });
        
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, showSnackbar]);

  return <LoadingScreen message="Completing authentication..." />;
}