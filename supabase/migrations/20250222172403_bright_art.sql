/*
  # Add blog and research tables

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, references profiles)
      - `category` (text)
      - `tags` (text[])
      - `likes` (integer)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `research_papers`
      - `id` (uuid, primary key)
      - `title` (text)
      - `abstract` (text)
      - `author_id` (uuid, references profiles)
      - `category` (text)
      - `tags` (text[])
      - `file_url` (text)
      - `citations` (integer)
      - `impact_factor` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid)
      - `post_type` (text)
      - `created_at` (timestamptz)

    - `bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid)
      - `post_type` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id),
  category text,
  tags text[],
  likes integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create research_papers table
CREATE TABLE IF NOT EXISTS research_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  abstract text NOT NULL,
  author_id uuid REFERENCES profiles(id),
  category text,
  tags text[],
  file_url text,
  citations integer DEFAULT 0,
  impact_factor numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  post_id uuid NOT NULL,
  post_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, post_type)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  post_id uuid NOT NULL,
  post_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, post_type)
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their blog posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Research papers policies
CREATE POLICY "Research papers are viewable by everyone"
  ON research_papers FOR SELECT
  USING (true);

CREATE POLICY "Users can create research papers"
  ON research_papers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their research papers"
  ON research_papers FOR UPDATE
  USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their bookmarks"
  ON bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);