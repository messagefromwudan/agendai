/*
  # AI Tutor System Tables

  1. New Tables
    - `ai_tutor_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `mode` (text, enum: explain, quiz, homework)
      - `subject` (text, optional - what subject is being discussed)
      - `topic` (text, optional - specific topic)
      - `knowledge_points_earned` (integer, default 0)
      - `started_at` (timestamptz)
      - `last_activity_at` (timestamptz)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ai_tutor_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to ai_tutor_sessions)
      - `user_id` (uuid, foreign key to auth.users)
      - `sender_type` (text, enum: ai, user)
      - `content` (text)
      - `formatted_content` (jsonb, optional - for rich formatting like code blocks, lists, etc)
      - `quick_actions` (jsonb, optional - array of button actions)
      - `message_type` (text, enum: message, progress_notification, suggestion)
      - `created_at` (timestamptz)

    - `ai_tutor_quick_actions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `label` (text)
      - `prompt` (text)
      - `category` (text)
      - `color_scheme` (text)
      - `icon_name` (text)
      - `order_index` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create ai_tutor_sessions table
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode text NOT NULL CHECK (mode IN ('explain', 'quiz', 'homework')),
  subject text,
  topic text,
  knowledge_points_earned integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI tutor sessions"
  ON ai_tutor_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI tutor sessions"
  ON ai_tutor_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI tutor sessions"
  ON ai_tutor_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI tutor sessions"
  ON ai_tutor_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ai_tutor_messages table
CREATE TABLE IF NOT EXISTS ai_tutor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_tutor_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('ai', 'user')),
  content text NOT NULL,
  formatted_content jsonb,
  quick_actions jsonb,
  message_type text DEFAULT 'message' CHECK (message_type IN ('message', 'progress_notification', 'suggestion')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_tutor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI tutor messages"
  ON ai_tutor_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI tutor messages"
  ON ai_tutor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI tutor messages"
  ON ai_tutor_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI tutor messages"
  ON ai_tutor_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ai_tutor_quick_actions table
CREATE TABLE IF NOT EXISTS ai_tutor_quick_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  prompt text NOT NULL,
  category text NOT NULL,
  color_scheme text DEFAULT 'blue',
  icon_name text DEFAULT 'Lightbulb',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_tutor_quick_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI tutor quick actions"
  ON ai_tutor_quick_actions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI tutor quick actions"
  ON ai_tutor_quick_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI tutor quick actions"
  ON ai_tutor_quick_actions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI tutor quick actions"
  ON ai_tutor_quick_actions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user_id ON ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_is_active ON ai_tutor_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_session_id ON ai_tutor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_user_id ON ai_tutor_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_quick_actions_user_id ON ai_tutor_quick_actions(user_id, is_active);
