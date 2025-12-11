/*
  # Enhance User Preferences Table for Settings

  1. Schema Updates
    - Add individual notification settings columns to replace the generic `notifications_enabled`
    - Add user_id reference to auth.users instead of student_id
    - Add unique constraint on user_id
    
  2. New Columns
    - `notify_homework` (boolean) - Homework reminder notifications
    - `notify_tests` (boolean) - Test reminder notifications  
    - `notify_streak` (boolean) - Daily streak notifications
    - `notify_messages` (boolean) - Message notifications
    - `notify_ai_tutor` (boolean) - AI tutor suggestion notifications
    
  3. Security
    - Enable RLS on user_preferences table
    - Add policies for users to manage their own preferences
    
  4. Data Migration
    - Preserve existing theme and language settings
    - Set all notification preferences to true by default (matching old notifications_enabled behavior)
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Copy student_id to user_id if student_id exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'student_id'
  ) THEN
    UPDATE user_preferences SET user_id = student_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Drop the old student_id column
ALTER TABLE user_preferences DROP COLUMN IF EXISTS student_id;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_preferences_user_id_key'
  ) THEN
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add individual notification columns
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS notify_homework boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_tests boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_streak boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_ai_tutor boolean DEFAULT true;

-- Drop the old notifications_enabled column
ALTER TABLE user_preferences DROP COLUMN IF EXISTS notifications_enabled;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);