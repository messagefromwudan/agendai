/*
  # Seed homework data from mock data migration

  1. Sample Data
    - Migrate all mock homework data from the React component
    - Include all properties: title, subject, difficulty, due dates, completion status
    - Add proper user associations and timestamps

  2. Data Includes
    - 5 homework items with various subjects and completion states
    - Different types: Homework, Lab Report, Project
    - Various difficulty levels and due dates
    - AI suggestions for each item
*/

-- Insert sample homework data (this will be associated with the authenticated user)
-- Note: This uses a placeholder user_id that should be replaced with actual user IDs in production

-- First, let's create some sample subjects if they don't exist
INSERT INTO subjects (user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type, grade_type, average_type)
SELECT 
  auth.uid(),
  'Mathematics',
  'Ms. Johnson',
  9.5,
  9.3,
  'up',
  'blue',
  'Advanced',
  'Current Grade',
  'Semester Average'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO subjects (user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type, grade_type, average_type)
SELECT 
  auth.uid(),
  'Physics',
  'Dr. Smith',
  9.2,
  9.0,
  'up',
  'green',
  'Science',
  'Current Grade',
  'Semester Average'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO subjects (user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type, grade_type, average_type)
SELECT 
  auth.uid(),
  'Literature',
  'Mr. Anderson',
  8.8,
  8.9,
  'stable',
  'purple',
  'Humanities',
  'Current Grade',
  'Semester Average'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO subjects (user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type, grade_type, average_type)
SELECT 
  auth.uid(),
  'Chemistry',
  'Dr. Brown',
  8.5,
  8.7,
  'down',
  'orange',
  'Science',
  'Current Grade',
  'Semester Average'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO subjects (user_id, name, teacher_name, current_grade, semester_average, trend, color, profile_type, grade_type, average_type)
SELECT 
  auth.uid(),
  'History',
  'Mrs. Davis',
  9.1,
  8.8,
  'up',
  'red',
  'Social Studies',
  'Current Grade',
  'Semester Average'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

-- Now insert homework data
INSERT INTO homework (
  user_id,
  subject_id,
  title,
  description,
  difficulty,
  due_date,
  completed,
  completed_at,
  ai_suggestion,
  type,
  important,
  color
)
SELECT 
  auth.uid(),
  s.id,
  'Quadratic Equations Problem Set',
  'Complete exercises 15-30 from Chapter 5. Focus on applying the quadratic formula and factoring methods.',
  3,
  '2024-11-03T14:00:00Z',
  false,
  NULL,
  'Revizuiește notițele despre formula de gradul doi din săptămâna trecută înainte de a începe.',
  'Homework',
  false,
  'blue'
FROM subjects s
WHERE s.user_id = auth.uid() AND s.name = 'Mathematics'
AND auth.uid() IS NOT NULL;

INSERT INTO homework (
  user_id,
  subject_id,
  title,
  description,
  difficulty,
  due_date,
  completed,
  completed_at,
  ai_suggestion,
  type,
  important,
  color
)
SELECT 
  auth.uid(),
  s.id,
  'Lab Report: Newton''s Laws',
  NULL,
  4,
  '2024-11-04T16:00:00Z',
  false,
  NULL,
  'Structurează raportul cu ipoteză, metodă, rezultate și concluzie.',
  'Lab Report',
  true,
  'green'
FROM subjects s
WHERE s.user_id = auth.uid() AND s.name = 'Physics'
AND auth.uid() IS NOT NULL;

INSERT INTO homework (
  user_id,
  subject_id,
  title,
  description,
  difficulty,
  due_date,
  completed,
  completed_at,
  ai_suggestion,
  type,
  important,
  color
)
SELECT 
  auth.uid(),
  s.id,
  'Essay: Romantic Poetry Analysis',
  NULL,
  2,
  '2024-11-05T12:00:00Z',
  true,
  '2024-11-01T10:30:00Z',
  'Excelent! Analiza ta a fost completă și bine structurată.',
  'Project',
  false,
  'purple'
FROM subjects s
WHERE s.user_id = auth.uid() AND s.name = 'Literature'
AND auth.uid() IS NOT NULL;

INSERT INTO homework (
  user_id,
  subject_id,
  title,
  description,
  difficulty,
  due_date,
  completed,
  completed_at,
  ai_suggestion,
  type,
  important,
  color
)
SELECT 
  auth.uid(),
  s.id,
  'Chemical Reactions Worksheet',
  NULL,
  1,
  '2024-10-30T09:00:00Z',
  false,
  NULL,
  'Începe prin a identifica reactanții și produșii în fiecare ecuație.',
  'Homework',
  false,
  'orange'
FROM subjects s
WHERE s.user_id = auth.uid() AND s.name = 'Chemistry'
AND auth.uid() IS NOT NULL;

INSERT INTO homework (
  user_id,
  subject_id,
  title,
  description,
  difficulty,
  due_date,
  completed,
  completed_at,
  ai_suggestion,
  type,
  important,
  color
)
SELECT 
  auth.uid(),
  s.id,
  'History Chapter Summary',
  NULL,
  2,
  '2024-11-02T15:00:00Z',
  true,
  '2024-11-01T14:20:00Z',
  'Înțelegere excelentă a contextului istoric!',
  'Homework',
  false,
  'red'
FROM subjects s
WHERE s.user_id = auth.uid() AND s.name = 'History'
AND auth.uid() IS NOT NULL;