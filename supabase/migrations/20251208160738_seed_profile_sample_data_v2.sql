/*
  # Seed Profile Sample Data
  
  1. Sample Data
    - Updates the first user's student profile with sample data
    - Creates sample achievements with icons and descriptions
    - Adds subject progress data for common subjects
  
  2. Notes
    - This migration will populate data for the first user in the profiles table
    - Icon names correspond to Lucide React icon names
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO students (
      id,
      student_id,
      class_name,
      institution,
      academic_year,
      current_gpa,
      main_badge_type,
      additional_badges,
      knowledge_points,
      study_hours_this_week,
      subjects_mastered,
      profile_image
    ) VALUES (
      v_user_id,
      'ST-2024-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'),
      'Class 11-A',
      'Colegiul National',
      '2024-2025',
      9.37,
      'top-10',
      ARRAY['hard-worker', 'consistent-learner'],
      1247,
      42,
      8,
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    )
    ON CONFLICT (id) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      class_name = EXCLUDED.class_name,
      institution = EXCLUDED.institution,
      academic_year = EXCLUDED.academic_year,
      main_badge_type = EXCLUDED.main_badge_type,
      additional_badges = EXCLUDED.additional_badges,
      knowledge_points = EXCLUDED.knowledge_points,
      study_hours_this_week = EXCLUDED.study_hours_this_week,
      subjects_mastered = EXCLUDED.subjects_mastered;

    INSERT INTO achievements (user_id, name, icon, color, earned, description, how_to_get, earned_at)
    VALUES
      (
        v_user_id,
        'Erou al Concentrării',
        'Target',
        'blue',
        true,
        'Ai câștigat această insignă prin menținerea concentrării în 50+ sesiuni de studiu.',
        'Continuă să dedici timp concentrat studiilor fără distrații.',
        now() - interval '30 days'
      ),
      (
        v_user_id,
        'Expert Matematic',
        'Trophy',
        'yellow',
        true,
        'Ai câștigat această insignă pentru performanță constantă ridicată la Matematică.',
        'Menține media ta la Matematică peste 9.0 pentru a păstra această realizare.',
        now() - interval '15 days'
      ),
      (
        v_user_id,
        'Săptămână Perfectă',
        'Award',
        'green',
        true,
        'Ai completat toate temele și ai participat la toate clasele săptămâna aceasta.',
        'Menține prezența perfectă și completează toate sarcinile fiecare săptămână.',
        now() - interval '5 days'
      ),
      (
        v_user_id,
        'Elev Rapid',
        'Zap',
        'purple',
        false,
        'Stăpânește o temă nouă în mai puțin de 3 sesiuni de studiu.',
        'Învață eficient concepte noi într-un interval scurt de timp.',
        NULL
      )
    ON CONFLICT (user_id, name) DO UPDATE SET
      earned = EXCLUDED.earned,
      description = EXCLUDED.description,
      how_to_get = EXCLUDED.how_to_get;

    INSERT INTO subject_progress (user_id, subject_name, score)
    VALUES
      (v_user_id, 'Mathematics', 95),
      (v_user_id, 'Physics', 92),
      (v_user_id, 'Literature', 88),
      (v_user_id, 'Chemistry', 75),
      (v_user_id, 'Biology', 72)
    ON CONFLICT (user_id, subject_name) DO UPDATE SET
      score = EXCLUDED.score;
  END IF;
END $$;
