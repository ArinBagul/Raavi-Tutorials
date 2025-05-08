import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const handleSubmit = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Admin authentication with additional security checks
      const { data: authData, error: authError } = await signIn(credentials);
      if (authError) throw authError;

      // Verify user is an admin with proper role
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, role, security_level')
        .eq('id', authData.user.id)
        .single();

      if (adminError || !adminData) {
        throw new Error('Access denied. Invalid administrative credentials.');
      }

      if (adminData.security_level < 2) {
        throw new Error('Insufficient security clearance for administrative access.');
      }

      // Log admin access attempt for security audit
      await supabase.from('admin_access_logs').insert([
        {
          admin_id: adminData.id,
          access_timestamp: new Date().toISOString(),
          ip_address: window.location.hostname,
        }
      ]);

      navigate('/admin-panel');
    } catch (err) {
      setError(err.message);
      // Log failed admin access attempts
      await supabase.from('admin_security_logs').insert([
        {
          attempted_email: credentials.email,
          timestamp: new Date().toISOString(),
          ip_address: window.location.hostname,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {location.state?.message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {location.state.message}
        </Alert>
      )}
      <LoginForm
        title="Administrative Login"
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        hideRegisterLink={true}
        requireSecurityKey={true}
      />
    </>
  );
}