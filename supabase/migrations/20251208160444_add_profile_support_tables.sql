/*
  # Add Profile Support Tables and Columns
  
  1. New Tables
    - `subject_progress` - Tracks subject mastery scores for profile strengths
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `subject_name` (text)
      - `score` (integer, 0-100)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Columns Added to Existing Tables
    - `students.knowledge_points` (integer) - Total knowledge points earned
    - `students.study_hours_this_week` (integer) - Study hours this week
    - `students.subjects_mastered` (integer) - Number of subjects mastered
  
  3. Security
    - Enable RLS on `subject_progress` table
    - Add policies for authenticated users to read/update their own data
*/

-- Create subject_progress table
CREATE TABLE IF NOT EXISTS subject_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_name text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject_name)
);

-- Add new columns to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'knowledge_points'
  ) THEN
    ALTER TABLE students ADD COLUMN knowledge_points integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'study_hours_this_week'
  ) THEN
    ALTER TABLE students ADD COLUMN study_hours_this_week integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'subjects_mastered'
  ) THEN
    ALTER TABLE students ADD COLUMN subjects_mastered integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on subject_progress
ALTER TABLE subject_progress ENABLE ROW LEVEL SECURITY;

-- Policies for subject_progress
CREATE POLICY "Users can view own subject progress"
  ON subject_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subject progress"
  ON subject_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subject progress"
  ON subject_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subject progress"
  ON subject_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger for subject_progress
CREATE OR REPLACE FUNCTION update_subject_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subject_progress_updated_at
  BEFORE UPDATE ON subject_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_subject_progress_updated_at();
