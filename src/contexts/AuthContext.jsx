import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { LoadingScreen } from '../components/LoadingScreen';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile fetching function - extracted for reuse
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user || null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      return { data: null, error: err };
    }
  };

  const signInWithOAuth = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      return { data: null, error: err };
    }
  };

  const signUp = async ({ email, password, options }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error signing up:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (err) {
      console.error('Error signing out:', err);
      return { error: err };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error resetting password:', err);
      return { data: null, error: err };
    }
  };

  const updateUser = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      setUser(data.user);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating user:', err);
      return { data: null, error: err };
    }
  };

  const updatePassword = async (password) => {
    return updateUser({ password });
  };

  const updateEmail = async (email) => {
    return updateUser({ email });
  };

  const updateProfile = async (updates) => {
    try {
      // Add updated_at timestamp
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile((prev) => ({ ...prev, ...updatedData }));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { data: null, error: err };
    }
  };

  const refreshProfile = async () => {
    if (!user) return null;
    return await fetchProfile(user.id);
  };

  // Check if a user is confirmed (email verified)
  const isUserConfirmed = () => {
    return user?.confirmed_at || user?.email_confirmed_at;
  };

  const value = {
    user,
    profile,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    updatePassword,
    updateEmail,
    updateProfile,
    refreshProfile,
    isUserConfirmed,
    loading,
    error,
  };

  // Let's make the loading screen optional and configurable
  if (loading) {
    return <LoadingScreen message="Loading user data..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}