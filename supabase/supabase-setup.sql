-- ============================================================================
-- GeoCetak Database Setup Script
-- Generated from datastructures.json
-- ============================================================================

-- Table: assignment_submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id uuid NOT NULL PRIMARY KEY,
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    submission_text text,
    submission_files json,
    submitted_at timestamp without time zone,
    status character varying(255) NOT NULL DEFAULT 'draft'::character varying,
    score numeric,
    ai_feedback json,
    teacher_feedback text,
    teacher_override_score numeric,
    graded_at timestamp without time zone,
    graded_by uuid,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.assignment_submissions FOR SELECT TO authenticated USING (true);


-- Table: assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id uuid NOT NULL PRIMARY KEY,
    classroom_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    module_id uuid,
    lesson_id uuid,
    assignment_type character varying(255) NOT NULL DEFAULT 'essay'::character varying,
    due_date timestamp without time zone,
    max_score integer NOT NULL DEFAULT 100,
    rubric json,
    is_published boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.assignments FOR SELECT TO authenticated USING (true);


-- Table: classroom_members
CREATE TABLE IF NOT EXISTS public.classroom_members (
    classroom_id uuid NOT NULL,
    student_id uuid NOT NULL,
    joined_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.classroom_members FOR SELECT TO authenticated USING (true);


-- Table: classrooms
CREATE TABLE IF NOT EXISTS public.classrooms (
    id uuid NOT NULL PRIMARY KEY,
    teacher_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    class_code character varying(255) NOT NULL,
    school_name character varying(255),
    grade_level character varying(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.classrooms FOR SELECT TO authenticated USING (true);


-- Table: gamification
CREATE TABLE IF NOT EXISTS public.gamification (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    total_xp integer NOT NULL DEFAULT 0,
    level integer NOT NULL DEFAULT 1,
    current_streak_days integer NOT NULL DEFAULT 0,
    longest_streak_days integer NOT NULL DEFAULT 0,
    last_activity_date date,
    badges_earned ARRAY DEFAULT ARRAY[]::text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.gamification FOR SELECT TO authenticated USING (true);


-- Table: lessons
CREATE TABLE IF NOT EXISTS public.lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    lesson_type text,
    order_index integer NOT NULL,
    content_markdown text,
    video_url text,
    scene_config jsonb,
    estimated_duration_minutes integer,
    xp_reward integer DEFAULT 50,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.lessons FOR SELECT TO authenticated USING (true);


-- Table: lkpd_submissions
CREATE TABLE IF NOT EXISTS public.lkpd_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL,
    title character varying(255) NOT NULL DEFAULT 'LKPD Pembelajaran'::character varying,
    project_type character varying(50) NOT NULL DEFAULT 'cylinder'::character varying,
    project_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    current_stage integer NOT NULL DEFAULT 1,
    completed_stages ARRAY DEFAULT ARRAY[]::integer[],
    is_completed boolean NOT NULL DEFAULT false,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    completed_at timestamp with time zone,
    submitted_at timestamp with time zone,
    last_auto_save timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lkpd_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.lkpd_submissions FOR SELECT TO authenticated USING (true);


-- Table: migrations
CREATE TABLE IF NOT EXISTS public.migrations (
    id integer NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);

ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY;


-- Table: modules
CREATE TABLE IF NOT EXISTS public.modules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    icon_url text,
    order_index integer NOT NULL,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.modules FOR SELECT TO authenticated USING (true);


-- Table: password_reset_tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp without time zone
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;


-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    avatar_url character varying(255),
    role character varying(255) NOT NULL DEFAULT 'student'::character varying,
    school_name character varying(255),
    grade_level character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);


-- Table: quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    lesson_id uuid NOT NULL,
    answers jsonb NOT NULL,
    score integer,
    max_score integer,
    time_spent_seconds integer,
    started_at timestamp with time zone NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.quiz_attempts FOR SELECT TO authenticated USING (true);


-- Table: quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type text DEFAULT 'multiple_choice'::text,
    options jsonb,
    correct_answer text NOT NULL,
    explanation text,
    difficulty text DEFAULT 'medium'::text,
    points integer DEFAULT 10,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.quiz_questions FOR SELECT TO authenticated USING (true);


-- Table: quiz_questions_backup
CREATE TABLE IF NOT EXISTS public.quiz_questions_backup (
    id uuid,
    lesson_id uuid,
    question_text text,
    options jsonb,
    correct_answer text,
    explanation text,
    difficulty text,
    points integer,
    order_index integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

ALTER TABLE public.quiz_questions_backup ENABLE ROW LEVEL SECURITY;


-- Table: student_progress
CREATE TABLE IF NOT EXISTS public.student_progress (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    status character varying(255) NOT NULL DEFAULT 'not_started'::character varying,
    completion_percentage numeric NOT NULL DEFAULT '0'::numeric,
    quiz_score numeric,
    time_spent_seconds integer NOT NULL DEFAULT 0,
    completed_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.student_progress FOR SELECT TO authenticated USING (true);


-- Table: teacher
CREATE TABLE IF NOT EXISTS public.teacher (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid,
    employee_id character varying(255),
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp without time zone,
    password character varying(255) NOT NULL,
    phone character varying(255),
    school_name character varying(255),
    department character varying(255),
    subject_specialization character varying(255),
    bio text,
    avatar_url character varying(255),
    is_active boolean NOT NULL DEFAULT true,
    remember_token character varying(100),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

ALTER TABLE public.teacher ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.teacher FOR SELECT TO authenticated USING (true);
