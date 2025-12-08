/*
  # Add Unique Constraint to Achievements
  
  1. Changes
    - Add unique constraint on (user_id, name) for achievements table
    - This prevents duplicate achievements for the same user
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'achievements_user_id_name_key'
  ) THEN
    ALTER TABLE achievements ADD CONSTRAINT achievements_user_id_name_key UNIQUE (user_id, name);
  END IF;
END $$;
