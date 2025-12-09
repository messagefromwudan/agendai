/*
  # Seed Schedule Mock Data

  1. Data Migration
    - Seeds `schedule_events` table with mock class schedule data
    - Seeds `ai_schedule_tips` table with AI tip suggestions
    - Uses the first authenticated user for demo purposes

  2. Schedule Events
    - 13 class events across the week (Monday-Friday)
    - Various subjects: Mathematics, Physics, Literature, Chemistry, History, English
    - Different teachers and locations
    - Includes descriptions and homework completion status

  3. AI Tips
    - 4 different tip types: focus, break, recap, test_prep
    - Each with appropriate icons and colors
    - Actionable suggestions for students
*/

-- Insert schedule events for the week
DO $$
DECLARE
  v_user_id uuid;
  v_math_subject_id uuid;
  v_physics_subject_id uuid;
  v_literature_subject_id uuid;
  v_chemistry_subject_id uuid;
  v_history_subject_id uuid;
  v_english_subject_id uuid;
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found, skipping schedule seed';
    RETURN;
  END IF;

  -- Get or create subject IDs
  SELECT id INTO v_math_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'Mathematics';
  SELECT id INTO v_physics_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'Physics';
  SELECT id INTO v_literature_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'Literature';
  SELECT id INTO v_chemistry_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'Chemistry';
  SELECT id INTO v_history_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'History';
  SELECT id INTO v_english_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'English';

  -- Monday (day_of_week = 0)
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color, homework_completed, description)
  VALUES
    (v_user_id, v_math_subject_id, 'Mathematics', 'class', '08:00:00', '09:30:00', 0, 'Room 204', 'Ms. Johnson', 'blue', true, 'Advanced Calculus - Derivatives and integrals'),
    (v_user_id, v_physics_subject_id, 'Physics', 'class', '10:00:00', '11:00:00', 0, 'Lab 3', 'Dr. Smith', 'green', false, 'Newton''s Laws - Practical applications'),
    (v_user_id, v_literature_subject_id, 'Literature', 'class', '13:00:00', '14:00:00', 0, 'Room 101', 'Mr. Anderson', 'purple', true, 'Romantic Poetry Analysis');

  -- Tuesday (day_of_week = 1)
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color, homework_completed, description)
  VALUES
    (v_user_id, v_chemistry_subject_id, 'Chemistry', 'class', '09:00:00', '10:30:00', 1, 'Lab 2', 'Dr. Brown', 'orange', true, 'Chemical reactions and balancing equations'),
    (v_user_id, v_history_subject_id, 'History', 'class', '11:00:00', '12:00:00', 1, 'Room 305', 'Mrs. Davis', 'red', false, 'World War II - Key events and outcomes');

  -- Wednesday (day_of_week = 2)
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color, homework_completed, description)
  VALUES
    (v_user_id, v_english_subject_id, 'English', 'class', '08:00:00', '09:00:00', 2, 'Room 210', 'Ms. Wilson', 'teal', true, 'Grammar and composition'),
    (v_user_id, v_math_subject_id, 'Mathematics', 'class', '10:00:00', '11:30:00', 2, 'Room 204', 'Ms. Johnson', 'blue', true, 'Problem-solving session');

  -- Thursday (day_of_week = 3)
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color, homework_completed, description)
  VALUES
    (v_user_id, v_physics_subject_id, 'Physics Lab', 'class', '09:00:00', '11:00:00', 3, 'Lab 3', 'Dr. Smith', 'green', false, 'Hands-on experiments with motion and force'),
    (v_user_id, v_chemistry_subject_id, 'Chemistry', 'class', '13:00:00', '14:00:00', 3, 'Lab 2', 'Dr. Brown', 'orange', true, 'Lab report review session');

  -- Friday (day_of_week = 4)
  INSERT INTO schedule_events (user_id, subject_id, title, event_type, start_time, end_time, day_of_week, location, teacher, color, homework_completed, description)
  VALUES
    (v_user_id, v_math_subject_id, 'Mathematics', 'class', '08:00:00', '09:30:00', 4, 'Room 204', 'Ms. Johnson', 'blue', true, 'Quiz on derivatives'),
    (v_user_id, v_physics_subject_id, 'Physics Lab', 'class', '10:00:00', '12:00:00', 4, 'Lab 3', 'Dr. Smith', 'green', false, 'Final lab project presentation'),
    (v_user_id, v_literature_subject_id, 'Literature', 'class', '13:00:00', '14:00:00', 4, 'Room 101', 'Mr. Anderson', 'purple', true, 'Group discussion on assigned reading');

  RAISE NOTICE 'Schedule events seeded successfully for user %', v_user_id;

  -- Insert AI tips
  INSERT INTO ai_schedule_tips (user_id, tip_type, title, content, action, icon_name, color, priority)
  VALUES
    (v_user_id, 'focus', 'Recomandare Sesiune de Concentrare', 'Ai o pauză de 30 de minute înainte de sesiunea ta de studiu. Vrei să programezi o sesiune scurtă de concentrare pentru pregătirea testului la Fizică?', 'Programează acum', 'Brain', 'blue', 1),
    (v_user_id, 'break', 'Memento Pauză', 'Ai studiat 2 ore continuu. Ia o pauză de 15 minute pentru a te reîncărca și pentru a îmbunătăți retenția.', 'Setează cronometru pauză', 'Coffee', 'orange', 2),
    (v_user_id, 'recap', 'Sesiune de Recapitulare', 'Ora ta de Matematică s-a încheiat acum o oră. O recapitulare rapidă de 10 minute acum va îmbunătăți retenția pe termen lung cu 40%.', 'Începe recapitularea', 'BookOpen', 'purple', 3),
    (v_user_id, 'test_prep', 'Sfat Pregătire Test', 'Testul tău la Fizică este în 2 zile. Pe baza programului tău, cel mai bun moment pentru revizuire este mâine la ora 15:00. Vrei să blochez acel timp?', 'Blochează timpul', 'Target', 'green', 4);

  RAISE NOTICE 'AI schedule tips seeded successfully for user %', v_user_id;

END $$;