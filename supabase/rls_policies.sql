-- ============================================================
-- AgendAI — Complete RLS Policy Setup  (v2 — no recursion)
--
-- Root cause of the 500 errors: the v1 policies had circular
-- dependencies through direct cross-table EXISTS subqueries.
-- PostgreSQL detects the infinite loop and crashes with an
-- "infinite recursion detected in policy" error.
--
-- Fix: wrap every cross-table lookup in a SECURITY DEFINER
-- function. Those functions run as the postgres superuser and
-- bypass RLS entirely, so there is no evaluation loop.
--
-- Run this entire file in the Supabase SQL Editor.
-- It is safe to re-run — it drops everything before re-creating.
-- ============================================================


-- ── STEP 1: Drop ALL existing policies on every relevant table ──
-- (catches old policies from previous commits with different names)

DO $$
DECLARE rec record;
BEGIN
  FOR rec IN
    SELECT tablename, policyname
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename IN (
        'profiles','classes','class_enrollments','class_subjects',
        'subjects','assignments','assignment_submissions','grades',
        'schedule','school_years','schools'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      rec.policyname, rec.tablename
    );
  END LOOP;
END $$;


-- ── STEP 2: Security-definer helper functions ────────────────
-- Each function bypasses RLS (runs as function owner = postgres).
-- Policies reference ONLY these functions — never raw cross-table
-- subqueries — which is what breaks the recursion cycle.

-- Current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Current user's school_id
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Classes the current STUDENT is enrolled in
CREATE OR REPLACE FUNCTION public.get_my_class_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(class_id), ARRAY[]::uuid[])
  FROM   public.class_enrollments
  WHERE  student_id = auth.uid();
$$;

-- Classes the current PROFESSOR teaches (via class_subjects)
CREATE OR REPLACE FUNCTION public.get_my_teaching_class_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(DISTINCT class_id), ARRAY[]::uuid[])
  FROM   public.class_subjects
  WHERE  professor_id = auth.uid();
$$;

-- All class IDs that belong to the ADMIN's school
CREATE OR REPLACE FUNCTION public.get_school_class_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::uuid[])
  FROM   public.classes
  WHERE  school_id = (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  );
$$;

-- Student IDs enrolled in any class the current PROFESSOR teaches
CREATE OR REPLACE FUNCTION public.get_my_student_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(DISTINCT ce.student_id), ARRAY[]::uuid[])
  FROM   public.class_enrollments ce
  JOIN   public.class_subjects    cs ON cs.class_id = ce.class_id
  WHERE  cs.professor_id = auth.uid();
$$;

-- Published assignment IDs that belong to the current STUDENT's classes
CREATE OR REPLACE FUNCTION public.get_my_published_assignment_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(DISTINCT a.id), ARRAY[]::uuid[])
  FROM   public.assignments       a
  JOIN   public.class_enrollments ce ON ce.class_id = a.class_id
  WHERE  ce.student_id  = auth.uid()
    AND  a.is_published = true;
$$;

-- Assignment IDs in classes the current PROFESSOR teaches
CREATE OR REPLACE FUNCTION public.get_my_teaching_assignment_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(DISTINCT a.id), ARRAY[]::uuid[])
  FROM   public.assignments    a
  JOIN   public.class_subjects cs ON cs.class_id = a.class_id
  WHERE  cs.professor_id = auth.uid();
$$;

-- All assignment IDs in the ADMIN's school
CREATE OR REPLACE FUNCTION public.get_school_assignment_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(DISTINCT a.id), ARRAY[]::uuid[])
  FROM   public.assignments a
  JOIN   public.classes     c ON c.id = a.class_id
  WHERE  c.school_id = (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  );
$$;


-- ── STEP 3: Enable RLS ───────────────────────────────────────

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_years           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools                ENABLE ROW LEVEL SECURITY;


-- ── STEP 4: profiles ─────────────────────────────────────────

CREATE POLICY "profiles: own read"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles: admin school read"
ON public.profiles FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND school_id = public.get_my_school_id()
);

CREATE POLICY "profiles: professor read students"
ON public.profiles FOR SELECT
USING (id = ANY(public.get_my_student_ids()));

CREATE POLICY "profiles: own update"
ON public.profiles FOR UPDATE
USING     (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ── STEP 5: classes ──────────────────────────────────────────

CREATE POLICY "classes: student enrolled read"
ON public.classes FOR SELECT
USING (id = ANY(public.get_my_class_ids()));

CREATE POLICY "classes: professor teaching read"
ON public.classes FOR SELECT
USING (id = ANY(public.get_my_teaching_class_ids()));

CREATE POLICY "classes: admin school read"
ON public.classes FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND school_id = public.get_my_school_id()
);

CREATE POLICY "classes: admin insert"
ON public.classes FOR INSERT
WITH CHECK (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND school_id = public.get_my_school_id()
);


-- ── STEP 6: class_enrollments ────────────────────────────────

CREATE POLICY "class_enrollments: student own read"
ON public.class_enrollments FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "class_enrollments: professor class read"
ON public.class_enrollments FOR SELECT
USING (class_id = ANY(public.get_my_teaching_class_ids()));

CREATE POLICY "class_enrollments: admin school read"
ON public.class_enrollments FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);

CREATE POLICY "class_enrollments: admin insert"
ON public.class_enrollments FOR INSERT
WITH CHECK (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);

CREATE POLICY "class_enrollments: admin delete"
ON public.class_enrollments FOR DELETE
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);


-- ── STEP 7: class_subjects ───────────────────────────────────

CREATE POLICY "class_subjects: student class read"
ON public.class_subjects FOR SELECT
USING (class_id = ANY(public.get_my_class_ids()));

CREATE POLICY "class_subjects: professor own read"
ON public.class_subjects FOR SELECT
USING (professor_id = auth.uid());

CREATE POLICY "class_subjects: admin school read"
ON public.class_subjects FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);

CREATE POLICY "class_subjects: admin insert"
ON public.class_subjects FOR INSERT
WITH CHECK (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);

CREATE POLICY "class_subjects: admin delete"
ON public.class_subjects FOR DELETE
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);


-- ── STEP 8: subjects ─────────────────────────────────────────
-- Public curriculum data — all authenticated users can read.

CREATE POLICY "subjects: authenticated read"
ON public.subjects FOR SELECT
USING (auth.role() = 'authenticated');


-- ── STEP 9: assignments ──────────────────────────────────────

CREATE POLICY "assignments: student published read"
ON public.assignments FOR SELECT
USING (
  is_published = true
  AND class_id = ANY(public.get_my_class_ids())
);

CREATE POLICY "assignments: professor class read"
ON public.assignments FOR SELECT
USING (class_id = ANY(public.get_my_teaching_class_ids()));

CREATE POLICY "assignments: admin school read"
ON public.assignments FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);


-- ── STEP 10: assignment_submissions ──────────────────────────

CREATE POLICY "assignment_submissions: student own read"
ON public.assignment_submissions FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "assignment_submissions: student insert"
ON public.assignment_submissions FOR INSERT
WITH CHECK (
  student_id     = auth.uid()
  AND assignment_id = ANY(public.get_my_published_assignment_ids())
);

CREATE POLICY "assignment_submissions: professor class read"
ON public.assignment_submissions FOR SELECT
USING (assignment_id = ANY(public.get_my_teaching_assignment_ids()));

CREATE POLICY "assignment_submissions: admin school read"
ON public.assignment_submissions FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND assignment_id = ANY(public.get_school_assignment_ids())
);


-- ── STEP 11: grades ──────────────────────────────────────────

CREATE POLICY "grades: student own read"
ON public.grades FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "grades: professor class read"
ON public.grades FOR SELECT
USING (class_id = ANY(public.get_my_teaching_class_ids()));

-- Professors INSERT grades directly from the browser (professor/clasa page).
-- professor_id is set by the app to session.user.id before the insert.
CREATE POLICY "grades: professor insert"
ON public.grades FOR INSERT
WITH CHECK (professor_id = auth.uid());

CREATE POLICY "grades: admin school read"
ON public.grades FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);


-- ── STEP 12: schedule ────────────────────────────────────────

CREATE POLICY "schedule: student class read"
ON public.schedule FOR SELECT
USING (class_id = ANY(public.get_my_class_ids()));

CREATE POLICY "schedule: professor class read"
ON public.schedule FOR SELECT
USING (class_id = ANY(public.get_my_teaching_class_ids()));

CREATE POLICY "schedule: admin school read"
ON public.schedule FOR SELECT
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND class_id = ANY(public.get_school_class_ids())
);


-- ── STEP 13: school_years ────────────────────────────────────

CREATE POLICY "school_years: school member read"
ON public.school_years FOR SELECT
USING (school_id = public.get_my_school_id());

CREATE POLICY "school_years: admin insert"
ON public.school_years FOR INSERT
WITH CHECK (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND school_id = public.get_my_school_id()
);

CREATE POLICY "school_years: admin update"
ON public.school_years FOR UPDATE
USING (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND school_id = public.get_my_school_id()
)
WITH CHECK (
  public.get_my_role() IN ('admin','director','director_adjunct','secretary')
  AND school_id = public.get_my_school_id()
);


-- ── STEP 14: schools ─────────────────────────────────────────

CREATE POLICY "schools: member read"
ON public.schools FOR SELECT
USING (id = public.get_my_school_id());
