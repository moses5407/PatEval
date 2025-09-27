import { create } from 'zustand';
import { supabase, isMultiUserMode, getCurrentUserProfile } from '../supabase';

interface User {
  id: string;
  name: string;
  email?: string;
  // Multi-user fields
  isMultiUser?: boolean;
  clinicId?: string;
  clinicName?: string;
  role?: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signIn: async (email?: string, password?: string) => {
    try {
      const isMultiUser = await isMultiUserMode();
      
      if (isMultiUser && email && password) {
        // Multi-user authentication via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Get user profile
        const profile = await getCurrentUserProfile();
        
        if (profile) {
          set({
            user: {
              id: data.user.id,
              name: profile.full_name,
              email: data.user.email,
              isMultiUser: true,
              clinicId: profile.clinic_id,
              clinicName: profile.clinic_name,
              role: profile.role,
              isAdmin: profile.is_admin
            },
            loading: false
          });
        } else {
          throw new Error('User profile not found');
        }
      } else {
        // Single-user mode (legacy)
        set({
          user: {
            id: 'local-user',
            name: 'Local User',
            isMultiUser: false
          },
          loading: false
        });
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      // Fall back to single-user mode on error
      set({
        user: {
          id: 'local-user',
          name: 'Local User',
          isMultiUser: false
        },
        loading: false
      });
    }
  },

  signOut: async () => {
    const { user } = get();
    
    if (user?.isMultiUser) {
      await supabase.auth.signOut();
    }
    
    set({ user: null, loading: false });
  },

  initializeAuth: async () => {
    try {
      console.log('Initializing auth...');
      const isMultiUser = await isMultiUserMode();
      console.log('isMultiUserMode result:', isMultiUser);
      
      if (isMultiUser) {
        console.log('Multi-user mode detected, checking for session...');
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session found:', !!session);
        
        if (session) {
          console.log('Getting user profile...');
          const profile = await getCurrentUserProfile();
          console.log('Profile result:', profile);
          
          if (profile) {
            const userData = {
              id: session.user.id,
              name: profile.full_name,
              email: session.user.email,
              isMultiUser: true,
              clinicId: profile.clinic_id,
              clinicName: profile.clinic_name,
              role: profile.role,
              isAdmin: profile.is_admin
            };
            console.log('Setting user data:', userData);
            set({
              user: userData,
              loading: false
            });
            return;
          }
        }
        
        // No valid session in multi-user mode
        console.log('No valid session in multi-user mode');
        set({ user: null, loading: false });
      } else {
        console.log('Single-user mode detected, auto-signing in...');
        // Single-user mode - auto-sign in
        await get().signIn();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Fall back to single-user mode
      set({
        user: {
          id: 'local-user',
          name: 'Local User',
          isMultiUser: false
        },
        loading: false
      });
    }
  }
}));

// Listen for auth changes in multi-user mode
supabase.auth.onAuthStateChange(async (event, session) => {
  const { user } = useAuthStore.getState();
  
  if (user?.isMultiUser) {
    if (event === 'SIGNED_OUT' || !session) {
      useAuthStore.setState({ user: null });
    } else if (event === 'SIGNED_IN' && session) {
      const profile = await getCurrentUserProfile();
      
      if (profile) {
        useAuthStore.setState({
          user: {
            id: session.user.id,
            name: profile.full_name,
            email: session.user.email,
            isMultiUser: true,
            clinicId: profile.clinic_id,
            clinicName: profile.clinic_name,
            role: profile.role,
            isAdmin: profile.is_admin
          }
        });
      }
    }
  }
});