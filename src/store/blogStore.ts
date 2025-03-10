import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';

interface BlogState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  fetchPostsByAuthor: (authorId: string) => Promise<void>;
  fetchPostsByCategory: (category: string) => Promise<void>;
  createPost: (post: Partial<BlogPost>) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  bookmarkPost: (postId: string) => Promise<void>;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ posts: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  fetchPostsByAuthor: async (authorId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(full_name)')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ posts: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  fetchPostsByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(full_name)')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ posts: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  createPost: async (post) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ posts: [data, ...state.posts] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  likePost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .match({ user_id: user.id, post_id: postId, post_type: 'blog' })
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, post_id: postId, post_type: 'blog' });
        
        // Update post likes count
        await supabase.rpc('decrement_likes', { post_id: postId, post_type: 'blog' });
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId, post_type: 'blog' });
        
        // Update post likes count
        await supabase.rpc('increment_likes', { post_id: postId, post_type: 'blog' });
      }

      // Refresh posts
      const currentMethod = get().posts.length > 0 && get().posts[0].author_id 
        ? () => get().fetchPostsByAuthor(get().posts[0].author_id)
        : get().fetchPosts;
      
      await currentMethod();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },
  bookmarkPost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select()
        .match({ user_id: user.id, post_id: postId, post_type: 'blog' })
        .maybeSingle();

      if (existingBookmark) {
        await supabase
          .from('bookmarks')
          .delete()
          .match({ user_id: user.id, post_id: postId, post_type: 'blog' });
      } else {
        await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, post_id: postId, post_type: 'blog' });
      }

      // Refresh posts
      const currentMethod = get().posts.length > 0 && get().posts[0].author_id 
        ? () => get().fetchPostsByAuthor(get().posts[0].author_id)
        : get().fetchPosts;
      
      await currentMethod();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  }
}));