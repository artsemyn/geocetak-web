-- GeoCetak Database Setup Script (Updated for new schema)
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student',
    school_name TEXT,
    grade_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    lesson_type TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    content_markdown TEXT,
    video_url TEXT,
    scene_config JSONB,
    estimated_duration_minutes INTEGER,
    xp_reward INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create student_progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,
    quiz_score INTEGER,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lesson_id)
);

-- Create gamification table
CREATE TABLE IF NOT EXISTS public.gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    badges_earned JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium',
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INTEGER,
    max_score INTEGER,
    time_spent_seconds INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    class_code TEXT UNIQUE NOT NULL,
    school_name TEXT,
    grade_level TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create classroom_members table
CREATE TABLE IF NOT EXISTS public.classroom_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(classroom_id, student_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    module_id UUID REFERENCES public.modules(id),
    lesson_id UUID REFERENCES public.lessons(id),
    assignment_type TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    max_score INTEGER DEFAULT 100,
    rubric JSONB,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_files JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'draft',
    score INTEGER,
    ai_feedback JSONB,
    teacher_feedback TEXT,
    teacher_override_score INTEGER,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(assignment_id, student_id)
);

-- Create models_3d table
CREATE TABLE IF NOT EXISTS public.models_3d (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id),
    name TEXT NOT NULL,
    description TEXT,
    glb_file_path TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size_bytes BIGINT,
    is_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create export_jobs table
CREATE TABLE IF NOT EXISTS public.export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_model_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    stl_file_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert sample modules
INSERT INTO public.modules (slug, title, description, order_index, is_published) VALUES
    ('tabung', 'Tabung', 'Mempelajari bentuk geometri tabung, rumus volume, dan luas permukaan', 1, true),
    ('kerucut', 'Kerucut', 'Mempelajari bentuk geometri kerucut, garis pelukis, dan perhitungan volume', 2, true),
    ('bola', 'Bola', 'Mempelajari bentuk geometri bola, simetri, dan rumus-rumus terkait', 3, true)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    is_published = EXCLUDED.is_published,
    updated_at = timezone('utc'::text, now());

-- Insert sample lessons for each module
WITH module_ids AS (
    SELECT id, slug FROM public.modules WHERE slug IN ('tabung', 'kerucut', 'bola')
)
INSERT INTO public.lessons (module_id, slug, title, lesson_type, order_index, content_markdown, xp_reward, estimated_duration_minutes, is_published)
SELECT
    m.id,
    CASE
        WHEN m.slug = 'tabung' AND lesson_order = 1 THEN 'konsep-dasar-tabung'
        WHEN m.slug = 'tabung' AND lesson_order = 2 THEN 'rumus-tabung'
        WHEN m.slug = 'tabung' AND lesson_order = 3 THEN 'jaring-jaring-tabung'
        WHEN m.slug = 'kerucut' AND lesson_order = 1 THEN 'konsep-dasar-kerucut'
        WHEN m.slug = 'kerucut' AND lesson_order = 2 THEN 'rumus-kerucut'
        WHEN m.slug = 'kerucut' AND lesson_order = 3 THEN 'jaring-jaring-kerucut'
        WHEN m.slug = 'bola' AND lesson_order = 1 THEN 'konsep-dasar-bola'
        WHEN m.slug = 'bola' AND lesson_order = 2 THEN 'rumus-bola'
        WHEN m.slug = 'bola' AND lesson_order = 3 THEN 'jaring-jaring-bola'
    END as slug,
    CASE
        WHEN lesson_order = 1 THEN 'Konsep Dasar'
        WHEN lesson_order = 2 THEN 'Rumus dan Perhitungan'
        WHEN lesson_order = 3 THEN 'Jaring-jaring'
    END as title,
    CASE
        WHEN lesson_order = 1 THEN 'concept'
        WHEN lesson_order = 2 THEN 'formula'
        WHEN lesson_order = 3 THEN 'interactive'
    END as lesson_type,
    lesson_order,
    CASE
        WHEN m.slug = 'tabung' AND lesson_order = 1 THEN 'Tabung adalah bangun ruang yang memiliki alas dan tutup berbentuk lingkaran serta selimut berbentuk persegi panjang.'
        WHEN m.slug = 'kerucut' AND lesson_order = 1 THEN 'Kerucut adalah bangun ruang yang memiliki alas berbentuk lingkaran dan puncak yang lancip.'
        WHEN m.slug = 'bola' AND lesson_order = 1 THEN 'Bola adalah bangun ruang yang semua titik pada permukaannya berjarak sama dari pusat.'
        ELSE NULL
    END as content_markdown,
    50 as xp_reward,
    CASE
        WHEN lesson_order = 1 THEN 15
        WHEN lesson_order = 2 THEN 20
        WHEN lesson_order = 3 THEN 25
    END as estimated_duration_minutes,
    true as is_published
FROM module_ids m
CROSS JOIN (VALUES (1), (2), (3)) AS lessons(lesson_order)
ON CONFLICT DO NOTHING;

-- Insert sample badges
INSERT INTO public.badges (slug, name, description, requirement_type, requirement_value) VALUES
    ('first-steps', 'First Steps', 'Complete your first lesson', 'lessons_completed', 1),
    ('geometry-explorer', 'Geometry Explorer', 'Complete all 3 geometry modules', 'modules_completed', 3),
    ('quick-learner', 'Quick Learner', 'Complete a lesson in under 10 minutes', 'time_based', 10),
    ('consistent-student', 'Consistent Student', 'Study for 7 days in a row', 'streak_days', 7),
    ('xp-master', 'XP Master', 'Earn 1000 XP points', 'xp', 1000),
    ('3d-creator', '3D Creator', 'Create and export your first 3D model', 'models_created', 1),
    ('master-builder', 'Master Builder', 'Create 10 different 3D models', 'models_created', 10)
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Modules are viewable by everyone" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Student progress policies
CREATE POLICY "Users can view own progress" ON public.student_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.student_progress FOR ALL USING (auth.uid() = user_id);

-- Gamification policies
CREATE POLICY "Users can view own gamification" ON public.gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own gamification" ON public.gamification FOR ALL USING (auth.uid() = user_id);

-- Quiz attempt policies
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- Export job policies
CREATE POLICY "Users can view own export jobs" ON public.export_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own export jobs" ON public.export_jobs FOR ALL USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view own activity log" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity log" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules(slug);
CREATE INDEX IF NOT EXISTS idx_modules_published ON public.modules(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson_id ON public.student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON public.gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON public.quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_id ON public.classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id ON public.classroom_members(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_classroom_id ON public.assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at columns
CREATE TRIGGER set_timestamp_modules BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_lessons BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_student_progress BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_gamification BEFORE UPDATE ON public.gamification FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_quiz_questions BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_classrooms BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_assignments BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_assignment_submissions BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_models_3d BEFORE UPDATE ON public.models_3d FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_export_jobs BEFORE UPDATE ON public.export_jobs FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Success message
SELECT 'GeoCetak database setup completed successfully with new schema! 🎉' as message;