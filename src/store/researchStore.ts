import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ResearchPaper } from '../lib/types';

interface ResearchState {
  papers: ResearchPaper[];
  loading: boolean;
  error: string | null;
  fetchPapers: () => Promise<void>;
  fetchPapersByAuthor: (authorId: string) => Promise<void>;
  fetchPapersByCategory: (category: string) => Promise<void>;
  createPaper: (paper: Partial<ResearchPaper>) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  citePaper: (paperId: string) => Promise<void>;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  papers: [],
  loading: false,
  error: null,
  fetchPapers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('research_papers')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ papers: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  fetchPapersByAuthor: async (authorId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('research_papers')
        .select('*, profiles(full_name)')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ papers: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  fetchPapersByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('research_papers')
        .select('*, profiles(full_name)')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ papers: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  createPaper: async (paper) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('research_papers')
        .insert([paper])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ papers: [data, ...state.papers] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  uploadFile: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('research-papers')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('research-papers')
      .getPublicUrl(filePath);

    return publicUrl;
  },
  citePaper: async (paperId) => {
    try {
      // Increment citation count
      await supabase.rpc('increment_citations', { paper_id: paperId });
      
      // Refresh papers
      const currentMethod = get().papers.length > 0 && get().papers[0].author_id 
        ? () => get().fetchPapersByAuthor(get().papers[0].author_id)
        : get().fetchPapers;
      
      await currentMethod();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  }
}));