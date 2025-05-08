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

  // Clear all auth state
  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    // Clear any cached auth data in localStorage for added security
    localStorage.removeItem('supabase.auth.token');
    console.log('Auth state cleared');
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
        } else {
          // Ensure state is cleared if no session exists
          clearAuthState();
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setError(err.message);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'User present' : 'No user');
      
      if (event === 'SIGNED_OUT') {
        clearAuthState();
        console.log('User signed out, auth state cleared');
      } else if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        console.log('User session updated');
      } else {
        clearAuthState();
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, options }) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      setLoading(true);
      
      // First clear local state
      clearAuthState();
      
      // Then tell Supabase to sign out (server-side)
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Sign out successful');
      
      // Force clear any lingering auth state
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Force refresh to ensure clean state
      window.location.href = '/';
      
      return { error: null };
    } catch (err) {
      console.error('Error signing out:', err);
      // Still clear state even if there's an error
      clearAuthState();
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error resetting password:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      setUser(data.user);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating user:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
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
      if (!user) {
        throw new Error('No authenticated user found. Please sign in first.');
      }
      
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const profile = await fetchProfile(user.id);
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      return null;
    }
  };

  // Check if a user is confirmed (email verified)
  const isUserConfirmed = () => {
    return user?.confirmed_at || user?.email_confirmed_at;
  };

  // Helper method for debugging auth issues
  const getAuthStatus = async () => {
    const session = await supabase.auth.getSession();
    const sessionStr = JSON.stringify(session);
    console.log('Current auth status:', {
      hasUser: !!user,
      hasProfile: !!profile,
      hasSession: !!session.data.session,
      sessionDetails: sessionStr.substring(0, 100) + '...'
    });
    return {
      hasUser: !!user,
      hasProfile: !!profile,
      hasSession: !!session.data.session
    };
  };

  // Hard reset function for debugging purposes
  const forceSignOut = async () => {
    await supabase.auth.signOut();
    clearAuthState();
    localStorage.clear(); // Clear all localStorage
    window.location.href = '/login'; // Hard redirect to login page
  };

  const value = {
    user,
    profile,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    forceSignOut, // Added for debugging
    getAuthStatus, // Added for debugging
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