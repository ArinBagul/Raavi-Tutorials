import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types of users in the system
export const USER_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
}

// Helper function to get user type from Supabase user metadata
export const getUserType = (user) => {
  return user?.user_metadata?.type || null
}

// Helper function to check if user has specific role
export const hasRole = (user, role) => {
  return getUserType(user) === role
}