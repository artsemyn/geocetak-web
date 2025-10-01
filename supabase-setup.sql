-- ============================================================================
-- GeoCetak Database Setup Script
-- Complete database schema reconstruction from datastructure.json
-- ============================================================================
-- Run this in your Supabase SQL Editor to rebuild the entire database
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- DROP EXISTING TABLES (if any) - BE CAREFUL!
-- ============================================================================
-- Uncomment the following lines if you want to completely reset the database
-- Tables to be dropped (in reverse order of dependencies)
-- DROP TABLE IF EXISTS public.activity_log CASCADE;
-- DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
-- DROP TABLE IF EXISTS public.assignments CASCADE;
-- DROP TABLE IF EXISTS public.classroom_members CASCADE;
-- DROP TABLE IF EXISTS public.classrooms CASCADE;
-- DROP TABLE IF EXISTS public.export_jobs CASCADE;
-- DROP TABLE IF EXISTS public.gamification CASCADE;
-- DROP TABLE IF EXISTS public.badges CASCADE;
-- DROP TABLE IF EXISTS public.student_progress CASCADE;
-- DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
-- DROP TABLE IF EXISTS public.quiz_questions CASCADE;
-- DROP TABLE IF EXISTS public.lessons CASCADE;
-- DROP TABLE IF EXISTS public.models_3d CASCADE;
-- DROP TABLE IF EXISTS public.modules CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student',
    school_name TEXT,
    grade_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';

-- modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.modules IS 'Learning modules/courses';

-- lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.lessons IS 'Individual lessons within modules';

-- quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium',
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.quiz_questions IS 'Quiz questions for lessons';

-- classrooms table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    class_code TEXT UNIQUE NOT NULL,
    school_name TEXT,
    grade_level TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.classrooms IS 'Classrooms created by teachers';

-- classroom_members table
CREATE TABLE IF NOT EXISTS public.classroom_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(classroom_id, student_id)
);

COMMENT ON TABLE public.classroom_members IS 'Students enrolled in classrooms';

-- assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    assignment_type TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    max_score INTEGER DEFAULT 100,
    rubric JSONB,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.assignments IS 'Assignments created by teachers for classrooms';

-- assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_files JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'draft',
    score INTEGER,
    ai_feedback JSONB,
    teacher_feedback TEXT,
    teacher_override_score INTEGER,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

COMMENT ON TABLE public.assignment_submissions IS 'Student submissions for assignments';

-- student_progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,
    quiz_score INTEGER,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

COMMENT ON TABLE public.student_progress IS 'Student progress tracking for lessons';

-- quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INTEGER,
    max_score INTEGER,
    time_spent_seconds INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.quiz_attempts IS 'Quiz attempts by students';

-- badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.badges IS 'Badge definitions for gamification';

-- gamification table
CREATE TABLE IF NOT EXISTS public.gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    badges_earned JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.gamification IS 'Gamification data: XP, levels, streaks, badges';

-- activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.activity_log IS 'Activity logs for users';

-- models_3d table
CREATE TABLE IF NOT EXISTS public.models_3d (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    glb_file_path TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size_bytes BIGINT,
    is_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.models_3d IS '3D models (GLB/GLTF) for lessons and projects';

-- export_jobs table
CREATE TABLE IF NOT EXISTS public.export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_model_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    stl_file_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.export_jobs IS '3D model export jobs (GLB to STL)';

-- ============================================================================
-- INDEXES for performance optimization
-- ============================================================================

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- modules indexes
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules(slug);
CREATE INDEX IF NOT EXISTS idx_modules_published ON public.modules(is_published);
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules(order_index);

-- lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON public.lessons(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(module_id, order_index);

-- quiz_questions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(lesson_id, order_index);

-- classrooms indexes
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_class_code ON public.classrooms(class_code);
CREATE INDEX IF NOT EXISTS idx_classrooms_active ON public.classrooms(is_active);

-- classroom_members indexes
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_id ON public.classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id ON public.classroom_members(student_id);

-- assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_classroom_id ON public.assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module_id ON public.assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON public.assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignments_published ON public.assignments(is_published);

-- assignment_submissions indexes
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON public.assignment_submissions(status);

-- student_progress indexes
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson_id ON public.student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON public.student_progress(status);

-- quiz_attempts indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON public.quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created ON public.quiz_attempts(created_at);

-- badges indexes
CREATE INDEX IF NOT EXISTS idx_badges_slug ON public.badges(slug);

-- gamification indexes
CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON public.gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_level ON public.gamification(level);
CREATE INDEX IF NOT EXISTS idx_gamification_xp ON public.gamification(total_xp);

-- activity_log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON public.activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at);

-- models_3d indexes
CREATE INDEX IF NOT EXISTS idx_models_3d_module_id ON public.models_3d(module_id);
CREATE INDEX IF NOT EXISTS idx_models_3d_template ON public.models_3d(is_template);
CREATE INDEX IF NOT EXISTS idx_models_3d_created_by ON public.models_3d(created_by);

-- export_jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created ON public.export_jobs(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_modules
    BEFORE UPDATE ON public.modules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_lessons
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_quiz_questions
    BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_classrooms
    BEFORE UPDATE ON public.classrooms
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_assignments
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_assignment_submissions
    BEFORE UPDATE ON public.assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_student_progress
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_gamification
    BEFORE UPDATE ON public.gamification
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_models_3d
    BEFORE UPDATE ON public.models_3d
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_export_jobs
    BEFORE UPDATE ON public.export_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to create gamification record on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.gamification (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create gamification record
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_profile();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Modules policies (public read for published)
CREATE POLICY "Anyone can view published modules" ON public.modules
    FOR SELECT USING (is_published = true);

-- Lessons policies (public read for published)
CREATE POLICY "Anyone can view published lessons" ON public.lessons
    FOR SELECT USING (is_published = true);

-- Quiz questions policies (public read for published lessons)
CREATE POLICY "Anyone can view quiz questions for published lessons" ON public.quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
            AND lessons.is_published = true
        )
    );

-- Classrooms policies
CREATE POLICY "Teachers can view their own classrooms" ON public.classrooms
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classrooms" ON public.classrooms
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own classrooms" ON public.classrooms
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classrooms" ON public.classrooms
    FOR DELETE USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view classrooms they're members of" ON public.classrooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classroom_members
            WHERE classroom_members.classroom_id = classrooms.id
            AND classroom_members.student_id = auth.uid()
        )
    );

-- Classroom members policies
CREATE POLICY "Teachers can manage members in their classrooms" ON public.classroom_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.classrooms
            WHERE classrooms.id = classroom_members.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their classroom memberships" ON public.classroom_members
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can join classrooms" ON public.classroom_members
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Assignments policies
CREATE POLICY "Teachers can manage their own assignments" ON public.assignments
    FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view assignments in their classrooms" ON public.assignments
    FOR SELECT USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM public.classroom_members
            WHERE classroom_members.classroom_id = assignments.classroom_id
            AND classroom_members.student_id = auth.uid()
        )
    );

-- Assignment submissions policies
CREATE POLICY "Students can manage their own submissions" ON public.assignment_submissions
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view submissions for their assignments" ON public.assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments
            WHERE assignments.id = assignment_submissions.assignment_id
            AND assignments.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update submissions for their assignments" ON public.assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.assignments
            WHERE assignments.id = assignment_submissions.assignment_id
            AND assignments.teacher_id = auth.uid()
        )
    );

-- Student progress policies
CREATE POLICY "Students can manage their own progress" ON public.student_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view progress of their students" ON public.student_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classroom_members
            JOIN public.classrooms ON classrooms.id = classroom_members.classroom_id
            WHERE classroom_members.student_id = student_progress.user_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

-- Quiz attempts policies
CREATE POLICY "Students can manage their own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view quiz attempts of their students" ON public.quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classroom_members
            JOIN public.classrooms ON classrooms.id = classroom_members.classroom_id
            WHERE classroom_members.student_id = quiz_attempts.user_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

-- Badges policies (public read)
CREATE POLICY "Anyone can view badges" ON public.badges
    FOR SELECT USING (true);

-- Gamification policies
CREATE POLICY "Users can view their own gamification data" ON public.gamification
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification data" ON public.gamification
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view gamification leaderboard" ON public.gamification
    FOR SELECT USING (true);

-- Activity log policies
CREATE POLICY "Users can view their own activity log" ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log" ON public.activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3D models policies
CREATE POLICY "Anyone can view template models" ON public.models_3d
    FOR SELECT USING (is_template = true);

CREATE POLICY "Users can view their own models" ON public.models_3d
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create models" ON public.models_3d
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own models" ON public.models_3d
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own models" ON public.models_3d
    FOR DELETE USING (auth.uid() = created_by);

-- Export jobs policies
CREATE POLICY "Users can manage their own export jobs" ON public.export_jobs
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to award XP and update gamification
CREATE OR REPLACE FUNCTION public.award_xp(
    p_user_id UUID,
    p_xp_amount INTEGER,
    p_activity_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_new_xp INTEGER;
BEGIN
    -- Get current level
    SELECT level INTO v_old_level
    FROM public.gamification
    WHERE user_id = p_user_id;

    -- Update XP
    UPDATE public.gamification
    SET
        total_xp = total_xp + p_xp_amount,
        level = GREATEST(1, FLOOR((total_xp + p_xp_amount) / 100.0) + 1),
        last_activity_date = CURRENT_DATE,
        current_streak_days = CASE
            WHEN last_activity_date = CURRENT_DATE THEN current_streak_days
            WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
            ELSE 1
        END,
        longest_streak_days = GREATEST(
            longest_streak_days,
            CASE
                WHEN last_activity_date = CURRENT_DATE THEN current_streak_days
                WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
                ELSE 1
            END
        )
    WHERE user_id = p_user_id
    RETURNING total_xp, level INTO v_new_xp, v_new_level;

    -- Log activity
    IF p_activity_type IS NOT NULL THEN
        INSERT INTO public.activity_log (user_id, activity_type, metadata)
        VALUES (p_user_id, p_activity_type, jsonb_build_object('xp_earned', p_xp_amount));
    END IF;

    -- Return result
    v_result := jsonb_build_object(
        'old_level', v_old_level,
        'new_level', v_new_level,
        'new_xp', v_new_xp,
        'xp_earned', p_xp_amount,
        'leveled_up', v_new_level > v_old_level
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_gamification RECORD;
    v_badge RECORD;
    v_badges_awarded JSONB := '[]'::jsonb;
    v_current_badges JSONB;
BEGIN
    -- Get user gamification data
    SELECT * INTO v_gamification
    FROM public.gamification
    WHERE user_id = p_user_id;

    v_current_badges := v_gamification.badges_earned;

    -- Check each badge
    FOR v_badge IN SELECT * FROM public.badges LOOP
        -- Skip if already earned
        IF v_current_badges ? v_badge.slug THEN
            CONTINUE;
        END IF;

        -- Check requirements
        IF v_badge.requirement_type = 'total_xp' AND v_gamification.total_xp >= v_badge.requirement_value THEN
            v_current_badges := v_current_badges || jsonb_build_object(
                v_badge.slug, jsonb_build_object(
                    'earned_at', now(),
                    'badge_id', v_badge.id
                )
            );
            v_badges_awarded := v_badges_awarded || to_jsonb(v_badge.slug);
        ELSIF v_badge.requirement_type = 'streak_days' AND v_gamification.current_streak_days >= v_badge.requirement_value THEN
            v_current_badges := v_current_badges || jsonb_build_object(
                v_badge.slug, jsonb_build_object(
                    'earned_at', now(),
                    'badge_id', v_badge.id
                )
            );
            v_badges_awarded := v_badges_awarded || to_jsonb(v_badge.slug);
        END IF;
    END LOOP;

    -- Update badges if any awarded
    IF jsonb_array_length(v_badges_awarded) > 0 THEN
        UPDATE public.gamification
        SET badges_earned = v_current_badges
        WHERE user_id = p_user_id;
    END IF;

    RETURN jsonb_build_object('badges_awarded', v_badges_awarded);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA (Optional - Uncomment to insert sample badges)
-- ============================================================================

-- INSERT INTO public.badges (slug, name, description, icon_url, requirement_type, requirement_value) VALUES
-- ('first-steps', 'First Steps', 'Complete your first lesson', NULL, 'total_xp', 10),
-- ('explorer', 'Explorer', 'Earn 100 XP', NULL, 'total_xp', 100),
-- ('scholar', 'Scholar', 'Earn 500 XP', NULL, 'total_xp', 500),
-- ('master', 'Master', 'Earn 1000 XP', NULL, 'total_xp', 1000),
-- ('consistent', 'Consistent', 'Maintain a 7-day streak', NULL, 'streak_days', 7),
-- ('dedicated', 'Dedicated', 'Maintain a 30-day streak', NULL, 'streak_days', 30);

-- ============================================================================
-- DONE! Your database is ready to use.
-- ============================================================================
