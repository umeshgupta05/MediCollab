import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type QuickLink = { id: string; title: string; url: string; icon: string };

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  addQuickLink: (link: Omit<QuickLink, 'id'>) => Promise<void>;
  removeQuickLink: (id: string) => Promise<void>;
  updateQuickLink: (link: QuickLink) => Promise<void>;
}

const DEFAULT_SETTINGS = {
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
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      // Get the current session instead of just the user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.user) {
        set({ settings: null, error: null, loading: false });
        return;
      }

      // Check if settings exist
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (!settings) {
        // Create default settings if they don't exist
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({
            user_id: session.user.id,
            ...DEFAULT_SETTINGS,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        
        // Apply theme immediately
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newSettings.theme);
        
        set({ settings: newSettings, error: null });
        return;
      }

      // Apply theme immediately
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.theme);

      set({ settings, error: null });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
        settings: null,
      });
    } finally {
      set({ loading: false });
    }
  },
  updateSettings: async (newSettings) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('No authenticated user');

      const { error: updateError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          ...newSettings,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Apply theme change immediately if it was updated
      if (newSettings.theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newSettings.theme);
      }
      
      // Refresh settings after update
      await get().fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update settings' 
      });
      throw error;
    }
  },
  addQuickLink: async (link) => {
    const { settings } = get();
    if (!settings) return;

    const quickLinks = (settings.quick_links as QuickLink[]) || [];
    const newLink = { ...link, id: crypto.randomUUID() };
    
    await get().updateSettings({
      quick_links: [...quickLinks, newLink],
    });
  },
  removeQuickLink: async (id) => {
    const { settings } = get();
    if (!settings) return;

    const quickLinks = (settings.quick_links as QuickLink[]) || [];
    await get().updateSettings({
      quick_links: quickLinks.filter(link => link.id !== id),
    });
  },
  updateQuickLink: async (updatedLink) => {
    const { settings } = get();
    if (!settings) return;

    const quickLinks = (settings.quick_links as QuickLink[]) || [];
    await get().updateSettings({
      quick_links: quickLinks.map(link => 
        link.id === updatedLink.id ? updatedLink : link
      ),
    });
  },
}));