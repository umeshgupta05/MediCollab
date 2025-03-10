import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type ResearchPaper = Database['public']['Tables']['research_papers']['Row'];
export type Discussion = Database['public']['Tables']['discussions']['Row'];

export type Category =
  | 'All'
  | 'Neurology'
  | 'Cardiology'
  | 'Oncology'
  | 'Pediatrics'
  | 'Surgery'
  | 'Research'
  | 'Technology'
  | 'Education';

export const categories: Category[] = [
  'All',
  'Neurology',
  'Cardiology',
  'Oncology',
  'Pediatrics',
  'Surgery',
  'Research',
  'Technology',
  'Education',
];

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

export interface Vote {
  id: string;
  user_id: string;
  discussion_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}