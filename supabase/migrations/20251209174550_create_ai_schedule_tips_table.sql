/*
  # Create AI Schedule Tips Table

  1. New Tables
    - `ai_schedule_tips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tip_type` (text) - Type of tip: 'focus', 'break', 'recap', 'test_prep'
      - `title` (text) - Title of the tip
      - `content` (text) - Main content/description
      - `action` (text) - Action button text
      - `icon_name` (text) - Lucide icon name
      - `color` (text) - Color scheme: 'blue', 'orange', 'purple', 'green'
      - `is_active` (boolean) - Whether the tip is currently active
      - `priority` (integer) - Priority for display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `ai_schedule_tips` table
    - Add policies for authenticated users to manage their own tips
*/

CREATE TABLE IF NOT EXISTS ai_schedule_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tip_type text NOT NULL CHECK (tip_type IN ('focus', 'break', 'recap', 'test_prep')),
  title text NOT NULL,
  content text NOT NULL,
  action text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Brain',
  color text NOT NULL DEFAULT 'blue',
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_schedule_tips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own schedule tips"
  ON ai_schedule_tips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedule tips"
  ON ai_schedule_tips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule tips"
  ON ai_schedule_tips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedule tips"
  ON ai_schedule_tips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_schedule_tips_user_id ON ai_schedule_tips(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_schedule_tips_active ON ai_schedule_tips(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_schedule_tips_priority ON ai_schedule_tips(user_id, priority DESC);