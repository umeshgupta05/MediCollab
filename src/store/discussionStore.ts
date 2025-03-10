import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Discussion } from '../lib/types';

interface DiscussionState {
  discussions: Discussion[];
  loading: boolean;
  error: string | null;
  fetchDiscussions: () => Promise<void>;
  fetchDiscussionsByAuthor: (authorId: string) => Promise<void>;
  fetchDiscussionsByCategory: (category: string) => Promise<void>;
  createDiscussion: (discussion: Partial<Discussion>) => Promise<void>;
  voteDiscussion: (discussionId: string, voteType: 'up' | 'down') => Promise<void>;
  addComment: (discussionId: string, content: string) => Promise<void>;
}

export const useDiscussionStore = create<DiscussionState>((set, get) => ({
  discussions: [],
  loading: false,
  error: null,
  fetchDiscussions: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles (full_name),
          comments (
            id,
            content,
            created_at,
            profiles (full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If user is logged in, get their votes
      let discussionsWithVotes = data || [];
      
      if (user) {
        const { data: votes } = await supabase
          .from('votes')
          .select('discussion_id, vote_type')
          .eq('user_id', user.id);
        
        if (votes) {
          const votesMap = new Map(votes.map(v => [v.discussion_id, v.vote_type]));
          
          discussionsWithVotes = discussionsWithVotes.map(discussion => ({
            ...discussion,
            userVote: votesMap.get(discussion.id) || null
          }));
        }
      }
      
      set({ discussions: discussionsWithVotes });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  fetchDiscussionsByAuthor: async (authorId) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles (full_name),
          comments (
            id,
            content,
            created_at,
            profiles (full_name)
          )
        `)
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If user is logged in, get their votes
      let discussionsWithVotes = data || [];
      
      if (user) {
        const { data: votes } = await supabase
          .from('votes')
          .select('discussion_id, vote_type')
          .eq('user_id', user.id);
        
        if (votes) {
          const votesMap = new Map(votes.map(v => [v.discussion_id, v.vote_type]));
          
          discussionsWithVotes = discussionsWithVotes.map(discussion => ({
            ...discussion,
            userVote: votesMap.get(discussion.id) || null
          }));
        }
      }
      
      set({ discussions: discussionsWithVotes });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  fetchDiscussionsByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles (full_name),
          comments (
            id,
            content,
            created_at,
            profiles (full_name)
          )
        `)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If user is logged in, get their votes
      let discussionsWithVotes = data || [];
      
      if (user) {
        const { data: votes } = await supabase
          .from('votes')
          .select('discussion_id, vote_type')
          .eq('user_id', user.id);
        
        if (votes) {
          const votesMap = new Map(votes.map(v => [v.discussion_id, v.vote_type]));
          
          discussionsWithVotes = discussionsWithVotes.map(discussion => ({
            ...discussion,
            userVote: votesMap.get(discussion.id) || null
          }));
        }
      }
      
      set({ discussions: discussionsWithVotes });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  createDiscussion: async (discussion) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert([discussion])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ discussions: [data, ...state.discussions] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  voteDiscussion: async (discussionId, voteType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingVote } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('discussion_id', discussionId)
        .maybeSingle();

      if (existingVote?.vote_type === voteType) {
        // Remove vote if clicking the same button
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('discussion_id', discussionId);
          
        // Update discussion votes count
        if (voteType === 'up') {
          await supabase.rpc('decrement_votes', { disc_id: discussionId });
        } else {
          await supabase.rpc('increment_votes', { disc_id: discussionId });
        }
      } else if (existingVote) {
        // Change vote type
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('user_id', user.id)
          .eq('discussion_id', discussionId);
          
        // Update discussion votes count (double effect since changing from up to down or vice versa)
        if (voteType === 'up') {
          await supabase.rpc('increment_votes', { disc_id: discussionId });
          await supabase.rpc('increment_votes', { disc_id: discussionId });
        } else {
          await supabase.rpc('decrement_votes', { disc_id: discussionId });
          await supabase.rpc('decrement_votes', { disc_id: discussionId });
        }
      } else {
        // New vote
        await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            discussion_id: discussionId,
            vote_type: voteType
          });
          
        // Update discussion votes count
        if (voteType === 'up') {
          await supabase.rpc('increment_votes', { disc_id: discussionId });
        } else {
          await supabase.rpc('decrement_votes', { disc_id: discussionId });
        }
      }

      // Refresh discussions
      const currentMethod = get().discussions.length > 0 && get().discussions[0].author_id 
        ? () => get().fetchDiscussionsByAuthor(get().discussions[0].author_id)
        : get().fetchDiscussions;
      
      await currentMethod();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },
  addComment: async (discussionId, content) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          discussion_id: discussionId,
          author_id: user.id,
          content,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refresh discussions
      const currentMethod = get().discussions.length > 0 && get().discussions[0].author_id 
        ? () => get().fetchDiscussionsByAuthor(get().discussions[0].author_id)
        : get().fetchDiscussions;
      
      await currentMethod();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  }
}));