/*
  # Seed Comprehensive Homework Data
  
  1. Overview
    - Clears existing homework sample data
    - Seeds comprehensive homework items linked to actual subjects
    - Covers all homework types: Homework, Project, Test Prep, Lab Report
    - Includes various difficulty levels (1-5)
    - Mix of completed and pending items
    - Various due dates (overdue, due today, due soon, future)
    
  2. Data Structure
    - Links each homework item to appropriate subject
    - Includes AI suggestions for each item
    - Sets importance flags for critical items
    - Uses appropriate colors matching subjects
    - Includes descriptive titles and details
    
  3. Sample Data Breakdown
    - Mathematics: 3 items (problem sets, test prep)
    - Physics: 3 items (lab reports, homework)
    - Chemistry: 2 items (worksheets, lab report)
    - Literature: 2 items (essays, reading assignments)
    - History: 2 items (research, presentations)
    - English: 2 items (compositions, grammar exercises)
*/

-- Clear existing sample homework data
DELETE FROM homework WHERE user_id IN (SELECT id FROM profiles LIMIT 1);

-- Get the first user ID and subject IDs
DO $$
DECLARE
  v_user_id uuid;
  v_math_id uuid;
  v_physics_id uuid;
  v_chemistry_id uuid;
  v_literature_id uuid;
  v_history_id uuid;
  v_english_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM profiles ORDER BY created_at LIMIT 1;
  
  -- Get subject IDs
  SELECT id INTO v_math_id FROM subjects WHERE name = 'Matematică' AND user_id = v_user_id;
  SELECT id INTO v_physics_id FROM subjects WHERE name = 'Fizică' AND user_id = v_user_id;
  SELECT id INTO v_chemistry_id FROM subjects WHERE name = 'Chimie' AND user_id = v_user_id;
  SELECT id INTO v_literature_id FROM subjects WHERE name = 'Literatură' AND user_id = v_user_id;
  SELECT id INTO v_history_id FROM subjects WHERE name = 'Istorie' AND user_id = v_user_id;
  SELECT id INTO v_english_id FROM subjects WHERE name = 'Engleză' AND user_id = v_user_id;
  
  -- Mathematics homework items
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, completed_at, ai_suggestion, type, important, color, created_at, updated_at) VALUES
  (
    v_user_id,
    v_math_id,
    'Ecuații de Gradul Doi - Set de Probleme',
    'Completează exercițiile 15-30 din Capitolul 5. Concentrează-te pe aplicarea formulei ecuațiilor de gradul doi și metodele de factorizare.',
    3,
    NOW() + INTERVAL '2 days',
    false,
    NULL,
    'Revizuiește notițele despre formula de gradul doi din săptămâna trecută înainte de a începe. Începe cu problemele mai simple pentru a-ți construi încrederea.',
    'Homework',
    false,
    'blue',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    v_user_id,
    v_math_id,
    'Pregătire Test - Funcții și Grafice',
    'Revizuiește Capitolele 3-5 și lucrează la setul de probleme de practică. Concentrează-te pe funcții liniare, pătratice și exponențiale.',
    4,
    NOW() + INTERVAL '1 day',
    false,
    NULL,
    'Folosește AI Tutorele pentru o sesiune de test de 15 minute. Concentrează-te pe interpretarea graficelor și găsirea punctelor de intersecție.',
    'Test Prep',
    true,
    'blue',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    v_user_id,
    v_math_id,
    'Probleme de Geometrie',
    'Rezolvă problemele 1-20 din secțiunea de geometrie. Include teoremele triunghiurilor și teorema lui Pitagora.',
    2,
    NOW() + INTERVAL '5 days',
    false,
    NULL,
    'Desenează diagrame pentru fiecare problemă - vizualizarea ajută la înțelegere. Începe cu triunghiurile dreptunghice.',
    'Homework',
    false,
    'blue',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  );
  
  -- Physics homework items
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, completed_at, ai_suggestion, type, important, color, created_at, updated_at) VALUES
  (
    v_user_id,
    v_physics_id,
    'Raport Laborator: Legile lui Newton',
    'Scrie un raport complet de laborator pentru experimentul cu legile mișcării. Include ipoteza, metoda, rezultatele și concluziile.',
    4,
    NOW() + INTERVAL '3 days',
    false,
    NULL,
    'Structurează raportul cu secțiuni clare. Asigură-te că explici cum rezultatele tale susțin sau infirmă ipoteza inițială.',
    'Lab Report',
    true,
    'green',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    v_user_id,
    v_physics_id,
    'Probleme de Cinematică',
    'Rezolvă setul de probleme despre viteza, accelerația și mișcarea uniformă. Include grafice distanță-timp.',
    3,
    NOW() + INTERVAL '4 days',
    false,
    NULL,
    'Amintește-ți ecuațiile de bază: v = d/t și a = Δv/Δt. Desenează graficele pentru a vizualiza mișcarea.',
    'Homework',
    false,
    'green',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    v_user_id,
    v_physics_id,
    'Set de Probleme - Energie și Lucru',
    'Completează problemele despre energia cinetică, energia potențială și conservarea energiei.',
    3,
    NOW() - INTERVAL '1 day',
    true,
    NOW() - INTERVAL '2 hours',
    'Excelent! Ai înțeles bine conceptele de conservare a energiei. Continuă munca bună!',
    'Homework',
    false,
    'green',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 hours'
  );
  
  -- Chemistry homework items
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, completed_at, ai_suggestion, type, important, color, created_at, updated_at) VALUES
  (
    v_user_id,
    v_chemistry_id,
    'Fișă de Lucru - Reacții Chimice',
    'Echilibrează ecuațiile chimice de la pagina 45-48. Identifică tipurile de reacții (sinteză, descompunere, substituție).',
    2,
    NOW() + INTERVAL '6 days',
    false,
    NULL,
    'Începe prin a identifica reactanții și produșii în fiecare ecuație. Asigură-te că numărul de atomi este egal pe ambele părți.',
    'Homework',
    false,
    'orange',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    v_user_id,
    v_chemistry_id,
    'Raport Lab - Titrări Acido-Bazice',
    'Finalizează raportul pentru experimentul de titrare. Include calculele și analiza erorilor.',
    5,
    NOW() + INTERVAL '2 days',
    false,
    NULL,
    'Verifică calculele de molaritate de două ori. Explică orice devieri de la rezultatele așteptate în secțiunea de analiză a erorilor.',
    'Lab Report',
    true,
    'orange',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  );
  
  -- Literature homework items
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, completed_at, ai_suggestion, type, important, color, created_at, updated_at) VALUES
  (
    v_user_id,
    v_literature_id,
    'Eseu: Analiza Poeziei Romantice',
    'Scrie un eseu de 1000 de cuvinte analizând temele și tehnicile literare în poezia romantică. Folosește cel puțin 3 exemple.',
    3,
    NOW() - INTERVAL '2 days',
    true,
    NOW() - INTERVAL '3 days',
    'Excelent! Analiza ta a fost completă și bine structurată. Ai identificat temele majore și ai folosit citate eficient.',
    'Project',
    false,
    'purple',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    v_user_id,
    v_literature_id,
    'Întrebări de Analiză - Capitolul 8',
    'Răspunde la întrebările de analiză pentru Capitolul 8. Concentrează-te pe dezvoltarea personajelor și simbolism.',
    2,
    NOW() + INTERVAL '7 days',
    false,
    NULL,
    'Reține-te la capitolul dacă este necesar. Folosește citate din text pentru a-ți susține răspunsurile.',
    'Homework',
    false,
    'purple',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );
  
  -- History homework items
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, completed_at, ai_suggestion, type, important, color, created_at, updated_at) VALUES
  (
    v_user_id,
    v_history_id,
    'Proiect de Cercetare - Al Doilea Război Mondial',
    'Cercetează și prezintă evenimente cheie din Al Doilea Război Mondial. Include cauzele, evenimentele majore și consecințele.',
    4,
    NOW() + INTERVAL '8 days',
    false,
    NULL,
    'Începe cu o linie de timp pentru a organiza evenimentele. Folosește surse primare și secundare pentru cercetarea ta.',
    'Project',
    true,
    'red',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
  ),
  (
    v_user_id,
    v_history_id,
    'Rezumat Capitol - Revoluția Industrială',
    'Scrie un rezumat de o pagină despre Revoluția Industrială. Acoperă inovațiile tehnologice și impactul social.',
    1,
    NOW() + INTERVAL '3 days',
    true,
    NOW() - INTERVAL '1 day',
    'Înțelegere excelentă a contextului istoric! Ai acoperit punctele cheie foarte bine.',
    'Homework',
    false,
    'red',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  );
  
  -- English homework items
  INSERT INTO homework (user_id, subject_id, title, description, difficulty, due_date, completed, completed_at, ai_suggestion, type, important, color, created_at, updated_at) VALUES
  (
    v_user_id,
    v_english_id,
    'Compunere: Eseu Argumentativ',
    'Scrie un eseu argumentativ de 800 de cuvinte pe o temă socială actuală. Include o teză clară și argumente de susținere.',
    3,
    NOW() + INTERVAL '5 days',
    false,
    NULL,
    'Începe cu un plan detaliat. Asigură-te că fiecare paragraf susține teza ta principală. Folosește tranziții puternice.',
    'Homework',
    false,
    'teal',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    v_user_id,
    v_english_id,
    'Exerciții de Vocabular și Gramatică',
    'Completează exercițiile de vocabular din Unit 4 și exercițiile de gramatică despre timpuri verbale.',
    1,
    NOW() + INTERVAL '4 days',
    false,
    NULL,
    'Revizuiește regulile timpurilor verbale înainte de a începe. Practică cu propozițiile tale pentru o înțelegere mai bună.',
    'Homework',
    false,
    'teal',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );
  
END $$;
