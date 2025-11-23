/*
  # Complete AgendAI Database Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key, maps to auth.uid())
      - `full_name` (text)
      - `student_id_number` (text, unique)
      - `class_name` (text)
      - `institution` (text)
      - `avatar_url` (text, optional)
      - `current_gpa` (decimal)
      - `total_study_time` (int) - in minutes
      - `badges` (text array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `schedule_events`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `title` (text) - Class/event name
      - `day_of_week` (int) - 0=Monday, 4=Friday
      - `start_time` (time) - Class start time
      - `end_time` (time) - Class end time
      - `location` (text) - Room number
      - `teacher_name` (text)
      - `color` (text) - UI color theme
      - `description` (text, optional)
      - `notes` (text, optional) - Student's personal notes
      - `created_at` (timestamptz)
      
    - `user_preferences`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students, unique)
      - `schedule_view_mode` (text) - 'week' or 'day'
      - `selected_week_offset` (int) - Weeks from current week
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `ai_schedule_tips`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `tip_type` (text) - 'focus', 'break', 'recap', 'test_prep'
      - `content` (text) - Tip message
      - `action_label` (text, optional) - Button text
      - `shown_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  student_id_number text UNIQUE NOT NULL,
  class_name text NOT NULL,
  institution text NOT NULL,
  avatar_url text,
  current_gpa decimal(4,2) NOT NULL DEFAULT 0.00,
  total_study_time int NOT NULL DEFAULT 0,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own student profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own student profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create schedule_events table
CREATE TABLE IF NOT EXISTS schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 4),
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL,
  teacher_name text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  description text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedule events"
  ON schedule_events FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own schedule events"
  ON schedule_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own schedule events"
  ON schedule_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can delete own schedule events"
  ON schedule_events FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE UNIQUE NOT NULL,
  schedule_view_mode text NOT NULL DEFAULT 'week' CHECK (schedule_view_mode IN ('week', 'day')),
  selected_week_offset int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create ai_schedule_tips table
CREATE TABLE IF NOT EXISTS ai_schedule_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  tip_type text NOT NULL CHECK (tip_type IN ('focus', 'break', 'recap', 'test_prep', 'other')),
  content text NOT NULL,
  action_label text,
  shown_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_schedule_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tips"
  ON ai_schedule_tips FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own tips"
  ON ai_schedule_tips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_student_day 
  ON schedule_events(student_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_user_preferences_student 
  ON user_preferences(student_id);

CREATE INDEX IF NOT EXISTS idx_ai_tips_student 
  ON ai_schedule_tips(student_id, shown_at DESC);
