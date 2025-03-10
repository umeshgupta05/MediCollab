/*
  # Initial Schema for MediCollab Platform

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
    - `research_projects`
      - Stores research project details
    - `collaborations`
      - Tracks user collaborations on research projects
    - `discussions`
      - Forum discussions and threads
    - `comments`
      - Comments on discussions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  specialty text,
  institution text,
  bio text,
  research_interests text[],
  reputation integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create research_projects table
CREATE TABLE IF NOT EXISTS research_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner_id uuid REFERENCES profiles(id),
  status text DEFAULT 'active',
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collaborations table
CREATE TABLE IF NOT EXISTS collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES research_projects(id),
  user_id uuid REFERENCES profiles(id),
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now()
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id),
  project_id uuid REFERENCES research_projects(id),
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id),
  discussion_id uuid REFERENCES discussions(id),
  parent_id uuid REFERENCES comments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Research projects policies
CREATE POLICY "Research projects are viewable by everyone"
  ON research_projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON research_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Project owners can update their projects"
  ON research_projects FOR UPDATE
  USING (auth.uid() = owner_id);

-- Collaborations policies
CREATE POLICY "Collaborations are viewable by project members"
  ON collaborations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborations c
      WHERE c.project_id = collaborations.project_id
      AND c.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM research_projects p
      WHERE p.id = collaborations.project_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage collaborations"
  ON collaborations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM research_projects p
      WHERE p.id = collaborations.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- Discussions policies
CREATE POLICY "Discussions are viewable by everyone"
  ON discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authors can update their discussions"
  ON discussions FOR UPDATE
  USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authors can update their comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);