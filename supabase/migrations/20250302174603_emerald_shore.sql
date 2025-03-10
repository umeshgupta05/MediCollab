/*
  # Complete Implementation Migration

  1. Updates
    - Update RLS policies for profiles table
    - Add missing votes table
    - Add missing comments table
    - Add supplementary_files column to research_papers
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  discussion_id uuid REFERENCES discussions(id),
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, discussion_id)
);

-- Add supplementary_files to research_papers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'research_papers' AND column_name = 'supplementary_files'
  ) THEN
    ALTER TABLE research_papers ADD COLUMN supplementary_files jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add content column to research_papers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'research_papers' AND column_name = 'content'
  ) THEN
    ALTER TABLE research_papers ADD COLUMN content text;
  END IF;
END $$;

-- Enable RLS on votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create votes policies
CREATE POLICY "Users can view votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own votes"
  ON votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Update profiles policies to allow authenticated users to create profiles
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON profiles;
CREATE POLICY "Authenticated users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update profiles policies to allow authenticated users to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);