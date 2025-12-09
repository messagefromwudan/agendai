/*
  # Update homework table for complete migration

  1. Schema Updates
    - Add missing columns to homework table for complete property mapping
    - Ensure all mock data properties have corresponding database columns
    - Add proper constraints and defaults

  2. New Columns Added
    - `type` (text) - for homework type (Homework, Project, Test Prep, Lab Report)
    - `important` (boolean) - for flagged/important homework
    - `color` (text) - for UI color coding
    - `completed_at` (timestamptz) - when homework was completed

  3. Security
    - Maintain existing RLS policies
    - Ensure proper user isolation
*/

-- Add missing columns to homework table
DO $$
BEGIN
  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homework' AND column_name = 'type'
  ) THEN
    ALTER TABLE homework ADD COLUMN type text DEFAULT 'Homework'::text;
  END IF;

  -- Add important column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homework' AND column_name = 'important'
  ) THEN
    ALTER TABLE homework ADD COLUMN important boolean DEFAULT false;
  END IF;

  -- Add color column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homework' AND column_name = 'color'
  ) THEN
    ALTER TABLE homework ADD COLUMN color text DEFAULT 'blue'::text;
  END IF;

  -- Update completed_at column to be nullable (if it exists and is not nullable)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homework' AND column_name = 'completed_at' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE homework ALTER COLUMN completed_at DROP NOT NULL;
  END IF;
END $$;

-- Add check constraint for type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'homework' AND constraint_name = 'homework_type_check'
  ) THEN
    ALTER TABLE homework ADD CONSTRAINT homework_type_check 
    CHECK (type IN ('Homework', 'Project', 'Test Prep', 'Lab Report'));
  END IF;
END $$;

-- Add check constraint for color
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'homework' AND constraint_name = 'homework_color_check'
  ) THEN
    ALTER TABLE homework ADD CONSTRAINT homework_color_check 
    CHECK (color IN ('blue', 'green', 'purple', 'orange', 'red', 'teal'));
  END IF;
END $$;