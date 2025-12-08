/*
  # Dashboard Support Tables and Columns

  This migration adds tables and columns needed for the dashboard functionality.

  1. New Tables
    - `ai_sessions` - Tracks AI tutor usage and study sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `session_type` (text) - Type of AI interaction
      - `duration_minutes` (integer) - Length of session
      - `session_date` (date) - When the session occurred
      - `created_at` (timestamptz)

    - `dashboard_stats` - Cached dashboard statistics for performance
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles, unique)
      - `active_subjects_total` (integer)
      - `active_subjects_needing_attention` (integer)
      - `ai_sessions_this_week` (integer)
      - `ai_sessions_avg_per_day` (numeric)
      - `homework_completed` (integer)
      - `homework_total` (integer)
      - `homework_due_tomorrow` (integer)
      - `homework_overdue` (integer)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Updates to Existing Tables
    - `students` table
      - Add `gpa_status` (text) - Status like "Top 10%"

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read/write their own data
*/

-- Add gpa_status to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'gpa_status'
  ) THEN
    ALTER TABLE students ADD COLUMN gpa_status text DEFAULT 'Good Standing';
  END IF;
END $$;

-- Create ai_sessions table
CREATE TABLE IF NOT EXISTS ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'general',
  duration_minutes integer DEFAULT 0,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI sessions"
  ON ai_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI sessions"
  ON ai_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI sessions"
  ON ai_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI sessions"
  ON ai_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create dashboard_stats table
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  active_subjects_total integer DEFAULT 0,
  active_subjects_needing_attention integer DEFAULT 0,
  ai_sessions_this_week integer DEFAULT 0,
  ai_sessions_avg_per_day numeric(5,2) DEFAULT 0.00,
  homework_completed integer DEFAULT 0,
  homework_total integer DEFAULT 0,
  homework_due_tomorrow integer DEFAULT 0,
  homework_overdue integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard stats"
  ON dashboard_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard stats"
  ON dashboard_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard stats"
  ON dashboard_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dashboard stats"
  ON dashboard_stats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_session_date ON ai_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user_id ON dashboard_stats(user_id);
