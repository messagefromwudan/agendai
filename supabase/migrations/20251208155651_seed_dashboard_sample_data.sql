/*
  # Seed Sample Dashboard Data

  This migration adds sample data for testing the dashboard functionality.
  It includes:
  - Sample subjects
  - Sample homework assignments
  - Sample schedule events
  - Sample AI sessions
  - Sample student profile with GPA
  - Dashboard stats

  NOTE: This data is inserted conditionally - only if no data exists for the user.
  The data uses the authenticated user's ID from auth.uid().
*/

-- Function to seed sample data for a user
CREATE OR REPLACE FUNCTION seed_sample_dashboard_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  subject_math_id uuid;
  subject_physics_id uuid;
  subject_literature_id uuid;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;

  -- Check if user already has data
  IF EXISTS (SELECT 1 FROM subjects WHERE user_id = current_user_id LIMIT 1) THEN
    RETURN;
  END IF;

  -- Insert student profile data
  INSERT INTO students (id, student_id, class_name, institution, academic_year, current_gpa, gpa_status, total_study_time)
  VALUES (
    current_user_id,
    'ST-2024-' || substr(md5(random()::text), 1, 4),
    'Class 11-A',
    'Colegiul National',
    '2024-2025',
    9.37,
    'Top 10%',
    252
  )
  ON CONFLICT (id) DO UPDATE SET
    current_gpa = 9.37,
    gpa_status = 'Top 10%',
    total_study_time = 252;

  -- Generate UUIDs for subjects
  subject_math_id := gen_random_uuid();
  subject_physics_id := gen_random_uuid();
  subject_literature_id := gen_random_uuid();

  -- Insert sample subjects
  INSERT INTO subjects (id, user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type)
  VALUES 
    (subject_math_id, current_user_id, 'Mathematics', 'Ms. Johnson', 9.5, 9.4, 'up', 'blue', 'Profil Real'),
    (subject_physics_id, current_user_id, 'Physics', 'Dr. Smith', 9.2, 9.0, 'up', 'green', 'Filieră Științe'),
    (subject_literature_id, current_user_id, 'Literature', 'Mr. Anderson', 8.8, 8.9, 'stable', 'purple', 'Filieră Umană');

  -- Insert sample homework
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, type, color, ai_suggestion)
  VALUES
    (current_user_id, subject_math_id, 'Quadratic Equations Problem Set', 'Complete exercises 15-30 from Chapter 5', 3, NOW() + INTERVAL '2 days', false, 'Homework', 'blue', 'Revizuiește notițele despre formula de gradul doi din săptămâna trecută înainte de a începe.'),
    (current_user_id, subject_physics_id, 'Lab Report: Newton''s Laws', 'Write comprehensive lab report on Newton''s three laws', 4, NOW() + INTERVAL '3 days', false, 'Lab Report', 'green', 'Structurează raportul cu ipoteză, metodă, rezultate și concluzie.'),
    (current_user_id, subject_literature_id, 'Essay: Romantic Poetry Analysis', 'Analyze two romantic poems', 2, NOW() - INTERVAL '2 days', true, 'Project', 'purple', 'Excelent! Analiza ta a fost completă și bine structurată.');

  -- Insert sample schedule events (recurring Monday-Friday classes)
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color, description)
  VALUES
    -- Monday
    (current_user_id, subject_math_id, 'Mathematics', 'class', '08:00', '09:30', 0, 'Room 204', 'Ms. Johnson', 'blue', 'Advanced Calculus - Derivatives and integrals'),
    (current_user_id, subject_physics_id, 'Physics', 'class', '10:00', '11:00', 0, 'Lab 3', 'Dr. Smith', 'green', 'Newton''s Laws - Practical applications'),
    (current_user_id, subject_literature_id, 'Literature', 'class', '13:00', '14:00', 0, 'Room 101', 'Mr. Anderson', 'purple', 'Romantic Poetry Analysis'),
    
    -- Friday (today for demo purposes - index 4)
    (current_user_id, subject_math_id, 'Mathematics', 'class', '09:00', '09:45', 4, 'Room 204', 'Ms. Johnson', '#164B2E', 'Quiz on derivatives'),
    (current_user_id, subject_physics_id, 'Physics Lab', 'class', '11:00', '13:00', 4, 'Lab 3', 'Dr. Smith', '#2563eb', 'Final lab project presentation'),
    (current_user_id, subject_literature_id, 'Literature', 'class', '14:00', '15:00', 4, 'Room 101', 'Mr. Anderson', '#9333ea', 'Group discussion on assigned reading');

  -- Insert upcoming test event
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color)
  VALUES
    (current_user_id, subject_physics_id, 'Physics Test', 'test', '10:00', '12:00', 1, 'Lab 3', 'Dr. Smith', 'green');

  -- Insert sample AI sessions (last 7 days)
  INSERT INTO ai_sessions (user_id, session_type, duration_minutes, session_date)
  SELECT 
    current_user_id,
    CASE (random() * 3)::int
      WHEN 0 THEN 'explain'
      WHEN 1 THEN 'quiz'
      ELSE 'homework'
    END,
    (15 + random() * 45)::int,
    CURRENT_DATE - (random() * 7)::int
  FROM generate_series(1, 23);

  -- Insert dashboard stats
  INSERT INTO dashboard_stats (
    user_id,
    active_subjects_total,
    active_subjects_needing_attention,
    ai_sessions_this_week,
    ai_sessions_avg_per_day,
    homework_completed,
    homework_total,
    homework_due_tomorrow,
    homework_overdue,
    last_updated
  )
  VALUES (
    current_user_id,
    8,
    0,
    23,
    3.29,
    5,
    8,
    2,
    0,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active_subjects_total = 8,
    active_subjects_needing_attention = 0,
    ai_sessions_this_week = 23,
    ai_sessions_avg_per_day = 3.29,
    homework_completed = 5,
    homework_total = 8,
    homework_due_tomorrow = 2,
    homework_overdue = 0,
    last_updated = NOW();

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION seed_sample_dashboard_data() TO authenticated;
