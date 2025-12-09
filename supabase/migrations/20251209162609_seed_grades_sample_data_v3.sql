/*
  # Seed Grades Sample Data
  
  1. Sample Data
    - Creates sample subjects with grades, trends, and metadata for the first user
    - Creates sample grade entries for each subject with valid grade types
  
  2. Notes
    - Valid grade types: test, quiz, homework, project
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO subjects (user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type, grade_type, average_type)
    VALUES
      (v_user_id, 'Matematică', 'Dna. Johnson', 9.5, 9.4, 'up', 'blue', 'Profil Real', 'Medie semestrială', 'Medie pe clasă'),
      (v_user_id, 'Fizică', 'Dr. Smith', 9.2, 9.0, 'up', 'green', 'Filieră Științe', 'Medie semestrială', 'Medie pe clasă'),
      (v_user_id, 'Literatură', 'Dl. Anderson', 8.8, 8.9, 'down', 'purple', 'Filieră Umană', 'Medie semestrială', 'Media ta de anul trecut'),
      (v_user_id, 'Chimie', 'Dr. Brown', 9.0, 9.0, 'stable', 'orange', 'Filieră Științe', 'Medie semestrială', 'Medie pe clasă'),
      (v_user_id, 'Istorie', 'Dna. Davis', 9.3, 9.1, 'up', 'red', 'Uman', 'Ultima notă', 'Medie pe clasă'),
      (v_user_id, 'Engleză', 'Dna. Wilson', 8.7, 8.8, 'stable', 'teal', 'Profil Real', 'Medie semestrială', 'Medie pe clasă');

    INSERT INTO grades (user_id, subject_id, grade_value, grade_type, description, date_received, teacher_notes)
    SELECT v_user_id, s.id, grade_val, grade_type_val, desc_val, date_val, notes_val
    FROM subjects s
    CROSS JOIN (
      VALUES
        ('Matematică', 9.5, 'test', 'Test de algebră', now() - interval '5 days', 'Excelent!'),
        ('Matematică', 9.0, 'homework', 'Temă algebră', now() - interval '10 days', 'Bine executat.'),
        ('Fizică', 9.2, 'test', 'Test mecanică', now() - interval '6 days', 'Rezultat bun.'),
        ('Fizică', 8.8, 'project', 'Proiect laborator', now() - interval '12 days', 'Metodologie corectă.'),
        ('Literatură', 8.8, 'test', 'Analiză text', now() - interval '7 days', 'Analiză bună.'),
        ('Literatură', 8.5, 'homework', 'Temă eseu', now() - interval '14 days', 'Bine scris.'),
        ('Chimie', 9.0, 'test', 'Test ecuații', now() - interval '8 days', 'Corect.'),
        ('Chimie', 8.8, 'project', 'Experiment', now() - interval '13 days', 'Observații precise.'),
        ('Istorie', 9.3, 'test', 'Test Renaștere', now() - interval '4 days', 'Cunoaștere cuprinzătoare.'),
        ('Istorie', 9.0, 'project', 'Proiect istoric', now() - interval '11 days', 'Bună analiză.'),
        ('Engleză', 8.7, 'test', 'Teste vocabular', now() - interval '9 days', 'Bun progres.'),
        ('Engleză', 8.5, 'homework', 'Traducere', now() - interval '16 days', 'Rezonabil.')
    ) AS grades_data(subject_name, grade_val, grade_type_val, desc_val, date_val, notes_val)
    WHERE s.user_id = v_user_id AND s.name = subject_name;
  END IF;
END $$;
