-- GeoCetak Database Setup Script
-- Run this in your Supabase SQL Editor to set up the database

-- Enable RLS (Row Level Security)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.modules;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.lessons;

-- Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    xp_reward INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    lesson_type TEXT DEFAULT 'concept',
    content_data JSONB,
    interactive_config JSONB,
    xp_reward INTEGER DEFAULT 50,
    estimated_duration INTEGER DEFAULT 15,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert sample modules
INSERT INTO public.modules (name, slug, description, order_index, is_published, xp_reward) VALUES
    ('Tabung', 'tabung', 'Mempelajari bentuk geometri tabung, rumus volume, dan luas permukaan', 1, true, 100),
    ('Kerucut', 'kerucut', 'Mempelajari bentuk geometri kerucut, garis pelukis, dan perhitungan volume', 2, true, 100),
    ('Bola', 'bola', 'Mempelajari bentuk geometri bola, simetri, dan rumus-rumus terkait', 3, true, 100)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    is_published = EXCLUDED.is_published,
    xp_reward = EXCLUDED.xp_reward,
    updated_at = timezone('utc'::text, now());

-- Insert sample lessons for each module
INSERT INTO public.lessons (module_id, title, slug, order_index, lesson_type, content_data, xp_reward, estimated_duration, is_published) VALUES
    -- Tabung lessons
    (1, 'Konsep Dasar Tabung', 'konsep-dasar', 1, 'concept', '{"content": "Tabung adalah bangun ruang yang memiliki alas dan tutup berbentuk lingkaran serta selimut berbentuk persegi panjang."}', 50, 15, true),
    (1, 'Rumus Volume dan Luas Permukaan', 'rumus-perhitungan', 2, 'formula', '{"content": "Volume tabung = π × r² × t, Luas permukaan = 2πr(r + t)"}', 50, 20, true),
    (1, 'Jaring-jaring Tabung', 'jaring-jaring', 3, 'interactive', '{"content": "Eksplorasi jaring-jaring tabung dalam bentuk 3D interaktif"}', 50, 25, true),

    -- Kerucut lessons
    (2, 'Konsep Dasar Kerucut', 'konsep-dasar', 1, 'concept', '{"content": "Kerucut adalah bangun ruang yang memiliki alas berbentuk lingkaran dan puncak yang lancip."}', 50, 15, true),
    (2, 'Garis Pelukis dan Rumus', 'rumus-perhitungan', 2, 'formula', '{"content": "Volume kerucut = 1/3 × π × r² × t, Luas permukaan = πr(r + s)"}', 50, 20, true),
    (2, 'Jaring-jaring Kerucut', 'jaring-jaring', 3, 'interactive', '{"content": "Eksplorasi jaring-jaring kerucut berupa lingkaran dan juring"}', 50, 25, true),

    -- Bola lessons
    (3, 'Konsep Dasar Bola', 'konsep-dasar', 1, 'concept', '{"content": "Bola adalah bangun ruang yang semua titik pada permukaannya berjarak sama dari pusat."}', 50, 15, true),
    (3, 'Rumus Volume dan Luas Permukaan', 'rumus-perhitungan', 2, 'formula', '{"content": "Volume bola = 4/3 × π × r³, Luas permukaan = 4πr²"}', 50, 20, true),
    (3, 'Simetri dan Belahan Bola', 'jaring-jaring', 3, 'interactive', '{"content": "Eksplorasi simetri bola dan visualisasi belahan bola"}', 50, 25, true)
ON CONFLICT DO NOTHING;

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create students table (if not exists)
CREATE TABLE IF NOT EXISTS public.students (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    nis TEXT,
    class_id INTEGER,
    teacher_id INTEGER,
    xp_points INTEGER DEFAULT 0,
    total_badges INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create student progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES public.modules(id) ON DELETE CASCADE,
    current_lesson_id INTEGER REFERENCES public.lessons(id),
    progress_percentage DECIMAL DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, module_id)
);

-- Create lesson completions table
CREATE TABLE IF NOT EXISTS public.lesson_completions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    time_spent INTEGER DEFAULT 0,
    score INTEGER,
    xp_earned INTEGER DEFAULT 0,
    completion_data JSONB,
    UNIQUE(student_id, lesson_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    badge_icon_url TEXT,
    criteria_type TEXT DEFAULT 'xp',
    criteria_value INTEGER DEFAULT 100,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create model exports table for user 3D creations
CREATE TABLE IF NOT EXISTS public.model_exports (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    model_type TEXT DEFAULT 'custom',
    model_data JSONB,
    stl_file_url TEXT,
    stl_file_size INTEGER,
    thumbnail_url TEXT,
    description TEXT,
    geometry_params JSONB,
    export_status TEXT DEFAULT 'pending',
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, criteria_type, criteria_value, xp_reward) VALUES
    ('First Steps', 'Complete your first lesson', 'lessons_completed', 1, 25),
    ('Geometry Explorer', 'Complete all 3 geometry modules', 'modules_completed', 3, 200),
    ('Quick Learner', 'Complete a lesson in under 10 minutes', 'time_based', 10, 50),
    ('Consistent Student', 'Study for 7 days in a row', 'streak_days', 7, 100),
    ('XP Master', 'Earn 1000 XP points', 'xp', 1000, 150),
    ('3D Creator', 'Create and export your first 3D model', 'models_created', 1, 75),
    ('Master Builder', 'Create 10 different 3D models', 'models_created', 10, 200)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_exports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Modules are viewable by everyone" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Student policies (users can only access their own data)
CREATE POLICY "Users can view own student data" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own student data" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own student data" ON public.students FOR UPDATE USING (auth.uid() = user_id);

-- Progress policies
CREATE POLICY "Users can view own progress" ON public.student_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = student_progress.student_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own progress" ON public.student_progress FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = student_progress.student_id AND user_id = auth.uid())
);

-- Completion policies
CREATE POLICY "Users can view own completions" ON public.lesson_completions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = lesson_completions.student_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own completions" ON public.lesson_completions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = lesson_completions.student_id AND user_id = auth.uid())
);

-- Model exports policies
CREATE POLICY "Users can view own models" ON public.model_exports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own models" ON public.model_exports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own models" ON public.model_exports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own models" ON public.model_exports FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public models are viewable by everyone" ON public.model_exports FOR SELECT USING (is_public = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules(slug);
CREATE INDEX IF NOT EXISTS idx_modules_published ON public.modules(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_student_id ON public.lesson_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_model_exports_user_id ON public.model_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_model_exports_student_id ON public.model_exports(student_id);
CREATE INDEX IF NOT EXISTS idx_model_exports_public ON public.model_exports(is_public);

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
CREATE TRIGGER set_timestamp_students BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_student_progress BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_model_exports BEFORE UPDATE ON public.model_exports FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Success message
SELECT 'GeoCetak database setup completed successfully! 🎉' as message;