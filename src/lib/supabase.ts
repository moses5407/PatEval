import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Feature flag: Check if multi-user mode is enabled
export async function isMultiUserMode(): Promise<boolean> {
  try {
    // Simple check: if we have Supabase config, enable multi-user mode
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('No Supabase config found, using single-user mode');
      return false;
    }
    
    console.log('Supabase config detected:', { 
      url: supabaseUrl.substring(0, 20) + '...', 
      hasKey: !!supabaseAnonKey 
    });
    
    // If we have config, assume multi-user mode is enabled
    return true;
  } catch (error) {
    console.warn('Multi-user check failed, defaulting to single-user mode:', error);
    return false;
  }
}

// Get current user profile (multi-user mode)
export async function getCurrentUserProfile() {
  try {
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }
    
    if (!session || !session.user) {
      console.warn('No valid session found');
      return null;
    }
    
    const user = session.user;
    
    // Query user profile with a more robust approach
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        clinic_id,
        full_name,
        role,
        is_admin,
        clinics(name)
      `)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Profile query error:', error);
      return null;
    }
    
    if (!data) {
      console.warn('No profile found for user:', user.id);
      return null;
    }
    
    return {
      profile_id: data.id,
      clinic_id: data.clinic_id,
      full_name: data.full_name,
      role: data.role,
      is_admin: data.is_admin,
      clinic_name: 'Unknown Clinic'
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

// Check if current user is clinic admin
export async function isClinicAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_clinic_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

// Types for multi-user data
export interface UserProfile {
  profile_id: string;
  clinic_id: string;
  full_name: string;
  role: string;
  is_admin: boolean;
  clinic_name?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Patient {
  id: string;
  clinic_id?: string;
  primary_therapist_id?: string;
  created_by?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  // ... other patient fields
}

export interface Evaluation {
  id: string;
  patient_id: string;
  clinic_id?: string;
  created_by?: string;
  last_modified_by?: string;
  evaluation_data: any;
  evaluation_date: string;
  status?: string;
}