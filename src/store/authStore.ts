import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email, password) => {
    // First sign up the user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;
    
    if (user) {
      try {
        // Create user settings first (now directly linked to auth.users)
        const { error: settingsError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            email_notifications: true,
            theme: 'light',
            notification_preferences: {
              mentions: true,
              research_updates: true,
              collaboration_requests: true,
            },
            privacy: {
              profile_visible: true,
              show_online_status: true,
              allow_research_contact: true,
            },
            quick_links: [],
            updated_at: new Date().toISOString(),
          });

        if (settingsError) throw settingsError;
        
        // Create profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: email.split('@')[0], // Default name from email
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (profileError) throw profileError;
      } catch (error) {
        console.error("Error during user setup:", error);
        // If profile/settings creation fails, we should ideally delete the auth user
        // but we'll continue since the user can still log in
      }
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
    
    // Reset theme to light on logout
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('light');
  },
  setUser: (user) => set({ user, loading: false }),
  refreshSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ user: session?.user ?? null, loading: false });
    } catch (error) {
      console.error('Error refreshing session:', error);
      set({ user: null, loading: false });
    }
  },
}));