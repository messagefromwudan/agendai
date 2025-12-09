/*
  # Seed AI Tutor Sample Data

  Seeds the database with sample AI tutor conversation data from the mock data in AITutor.tsx

  1. Sample Data
    - Default quick actions for all users
    - Sample session with quadratic equations topic
    - Sample conversation messages
*/

-- Insert default quick actions for existing users
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  FOR v_user_id IN SELECT id FROM auth.users LIMIT 1
  LOOP
    -- Insert default quick actions
    INSERT INTO ai_tutor_quick_actions (user_id, label, prompt, category, color_scheme, icon_name, order_index)
    VALUES 
      (v_user_id, 'Explică fotosinteza', 'Poți să-mi explici procesul de fotosinteză?', 'Biology', 'blue', 'Lightbulb', 1),
      (v_user_id, 'Testează-mă la algebră', 'Vreau să fac un test rapid la algebră', 'Mathematics', 'green', 'BookOpen', 2),
      (v_user_id, 'Ajutor cu structura eseului', 'Cum ar trebui să structurez un eseu literar?', 'Literature', 'purple', 'Calculator', 3)
    ON CONFLICT DO NOTHING;

    -- Create a sample AI tutor session
    INSERT INTO ai_tutor_sessions (
      id,
      user_id,
      mode,
      subject,
      topic,
      knowledge_points_earned,
      started_at,
      last_activity_at,
      is_active
    )
    VALUES (
      gen_random_uuid(),
      v_user_id,
      'explain',
      'Mathematics',
      'Ecuații pătratice',
      25,
      now() - interval '15 minutes',
      now(),
      true
    )
    ON CONFLICT DO NOTHING;

    -- Get the session ID
    DECLARE
      v_session_id uuid;
    BEGIN
      SELECT id INTO v_session_id 
      FROM ai_tutor_sessions 
      WHERE user_id = v_user_id 
        AND topic = 'Ecuații pătratice'
      LIMIT 1;

      IF v_session_id IS NOT NULL THEN
        -- Insert AI greeting message with quick actions
        INSERT INTO ai_tutor_messages (
          session_id,
          user_id,
          sender_type,
          content,
          quick_actions,
          message_type,
          created_at
        )
        VALUES (
          v_session_id,
          v_user_id,
          'ai',
          'Salut Bianca! Sunt asistentul tău de învățare AI. Sunt aici pentru a te ajuta să înțelegi conceptele, să te pregătești pentru teste și să-ți completezi temele. Ce ai vrea să explorezi astazi?',
          '[
            {"label": "Explică fotosinteza", "colorScheme": "blue"},
            {"label": "Testează-mă la algebră", "colorScheme": "green"},
            {"label": "Ajutor cu structura eseului", "colorScheme": "purple"}
          ]'::jsonb,
          'message',
          now() - interval '15 minutes'
        )
        ON CONFLICT DO NOTHING;

        -- Insert user message
        INSERT INTO ai_tutor_messages (
          session_id,
          user_id,
          sender_type,
          content,
          message_type,
          created_at
        )
        VALUES (
          v_session_id,
          v_user_id,
          'user',
          'Mă poți ajuta să înțeleg ecuațiile pătratice?',
          'message',
          now() - interval '14 minutes'
        )
        ON CONFLICT DO NOTHING;

        -- Insert AI response with formatted content
        INSERT INTO ai_tutor_messages (
          session_id,
          user_id,
          sender_type,
          content,
          formatted_content,
          message_type,
          created_at
        )
        VALUES (
          v_session_id,
          v_user_id,
          'ai',
          'Să explorăm ecuațiile pătratice împreună! O ecuație pătratică are forma: ax² + bx + c = 0',
          '{
            "sections": [
              {
                "type": "heading",
                "content": "Să explorăm ecuațiile pătratice împreună!"
              },
              {
                "type": "paragraph",
                "content": "O ecuație pătratică are forma:",
                "inline_code": "ax² + bx + c = 0"
              },
              {
                "type": "info_box",
                "title": "Componente principale:",
                "color": "blue",
                "items": [
                  "a, b și c sunt constante",
                  "x este variabila pe care o rezolvăm",
                  "Cea mai mare putere a lui x este 2 (asta o face pătratică)"
                ]
              },
              {
                "type": "paragraph",
                "content": "Vrei ca te arăt cum să o rezolvi cu un exemplu, sau preferi să încerci mai întâi o problemă de practică?"
              }
            ],
            "actions": [
              {
                "label": "Arată-mi un exemplu",
                "style": "primary"
              },
              {
                "label": "Dă-mi o problemă de practică",
                "style": "secondary"
              }
            ]
          }'::jsonb,
          'message',
          now() - interval '13 minutes'
        )
        ON CONFLICT DO NOTHING;

        -- Insert progress notification
        INSERT INTO ai_tutor_messages (
          session_id,
          user_id,
          sender_type,
          content,
          formatted_content,
          message_type,
          created_at
        )
        VALUES (
          v_session_id,
          v_user_id,
          'ai',
          'Progresul Lecției - Ai câștigat 25 Puncte de Cunoaștere în această sesiune!',
          '{
            "type": "progress",
            "title": "Progresul Lecției",
            "message": "Ai câștigat 25 Puncte de Cunoaștere în această sesiune!",
            "points": 25,
            "color": "green"
          }'::jsonb,
          'progress_notification',
          now() - interval '12 minutes'
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END;
  END LOOP;
END $$;
