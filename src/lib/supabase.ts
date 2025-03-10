import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { useEffect } from 'react';
import { useBlogStore } from '../store/blogStore';
import { useDiscussionStore } from '../store/discussionStore';
import { useResearchStore } from '../store/researchStore';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Please click the "Connect to Supabase" button in the top right to set up your database connection.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export function useRealtimeSubscriptions() {
  const { fetchPosts } = useBlogStore();
  const { fetchDiscussions } = useDiscussionStore();
  const { fetchPapers } = useResearchStore();

  useEffect(() => {
    // Subscribe to blog posts changes
    const blogSubscription = supabase
      .channel('blog_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    // Subscribe to discussions changes
    const discussionSubscription = supabase
      .channel('discussion_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussions'
        },
        () => {
          fetchDiscussions();
        }
      )
      .subscribe();

    // Subscribe to research papers changes
    const researchSubscription = supabase
      .channel('research_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_papers'
        },
        () => {
          fetchPapers();
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentSubscription = supabase
      .channel('comment_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        () => {
          fetchDiscussions();
        }
      )
      .subscribe();

    return () => {
      blogSubscription.unsubscribe();
      discussionSubscription.unsubscribe();
      researchSubscription.unsubscribe();
      commentSubscription.unsubscribe();
    };
  }, [fetchPosts, fetchDiscussions, fetchPapers]);
}