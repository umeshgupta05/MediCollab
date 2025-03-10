/*
  # Enable realtime functionality and update triggers
  
  1. Changes
    - Safely enable realtime for content tables if not already enabled
    - Create or replace updated_at trigger function
    - Safely add triggers for automatic timestamp updates
    
  2. Safety Checks
    - Check if tables exist in publication before adding
    - Drop existing triggers before creating new ones
    - Use IF NOT EXISTS where applicable
*/

-- Function to check if a table is in the publication
CREATE OR REPLACE FUNCTION is_table_in_publication(publication_name text, table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = publication_name
    AND schemaname = 'public'
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Safely add tables to realtime publication
DO $$
BEGIN
  -- Add blog_posts if not already in publication
  IF NOT is_table_in_publication('supabase_realtime', 'blog_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
  END IF;

  -- Add discussions if not already in publication
  IF NOT is_table_in_publication('supabase_realtime', 'discussions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE discussions;
  END IF;

  -- Add research_papers if not already in publication
  IF NOT is_table_in_publication('supabase_realtime', 'research_papers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE research_papers;
  END IF;

  -- Add comments if not already in publication
  IF NOT is_table_in_publication('supabase_realtime', 'comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
  END IF;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safely recreate triggers
DO $$
BEGIN
  -- blog_posts trigger
  DROP TRIGGER IF EXISTS set_updated_at_blog_posts ON blog_posts;
  CREATE TRIGGER set_updated_at_blog_posts
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

  -- discussions trigger
  DROP TRIGGER IF EXISTS set_updated_at_discussions ON discussions;
  CREATE TRIGGER set_updated_at_discussions
    BEFORE UPDATE ON discussions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

  -- research_papers trigger
  DROP TRIGGER IF EXISTS set_updated_at_research_papers ON research_papers;
  CREATE TRIGGER set_updated_at_research_papers
    BEFORE UPDATE ON research_papers
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

  -- comments trigger
  DROP TRIGGER IF EXISTS set_updated_at_comments ON comments;
  CREATE TRIGGER set_updated_at_comments
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
END $$;

-- Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS is_table_in_publication;