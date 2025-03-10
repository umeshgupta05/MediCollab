export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string
          email_notifications: boolean
          theme: string
          notification_preferences: {
            mentions: boolean
            research_updates: boolean
            collaboration_requests: boolean
          }
          privacy: {
            profile_visible: boolean
            show_online_status: boolean
            allow_research_contact: boolean
          }
          quick_links: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          email_notifications?: boolean
          theme?: string
          notification_preferences?: {
            mentions?: boolean
            research_updates?: boolean
            collaboration_requests?: boolean
          }
          privacy?: {
            profile_visible?: boolean
            show_online_status?: boolean
            allow_research_contact?: boolean
          }
          quick_links?: Json
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_notifications?: boolean
          theme?: string
          notification_preferences?: {
            mentions?: boolean
            research_updates?: boolean
            collaboration_requests?: boolean
          }
          privacy?: {
            profile_visible?: boolean
            show_online_status?: boolean
            allow_research_contact?: boolean
          }
          quick_links?: Json
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category: string | null
          tags: string[] | null
          likes: number
          image_url: string | null
          created_at: string
          updated_at: string
          profiles: {
            full_name: string | null
          } | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category?: string | null
          tags?: string[] | null
          likes?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category?: string | null
          tags?: string[] | null
          likes?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      research_papers: {
        Row: {
          id: string
          title: string
          abstract: string
          author_id: string
          category: string | null
          tags: string[] | null
          file_url: string | null
          citations: number
          impact_factor: number
          created_at: string
          updated_at: string
          profiles: {
            full_name: string | null
          } | null
        }
        Insert: {
          id?: string
          title: string
          abstract: string
          author_id: string
          category?: string | null
          tags?: string[] | null
          file_url?: string | null
          citations?: number
          impact_factor?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          abstract?: string
          author_id?: string
          category?: string | null
          tags?: string[] | null
          file_url?: string | null
          citations?: number
          impact_factor?: number
          created_at?: string
          updated_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category: string | null
          tags: string[] | null
          votes: number
          created_at: string
          updated_at: string
          profiles: {
            full_name: string | null
          } | null
          comments: {
            id: string
            content: string
            created_at: string
            profiles: {
              full_name: string | null
            } | null
          }[] | null
          userVote: 'up' | 'down' | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category?: string | null
          tags?: string[] | null
          votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category?: string | null
          tags?: string[] | null
          votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          specialty: string | null
          institution: string | null
          bio: string | null
          research_interests: string[] | null
          reputation: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          specialty?: string | null
          institution?: string | null
          bio?: string | null
          research_interests?: string[] | null
          reputation?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          specialty?: string | null
          institution?: string | null
          bio?: string | null
          research_interests?: string[] | null
          reputation?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}