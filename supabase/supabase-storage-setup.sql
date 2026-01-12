-- ============================================================================
-- GeoCetak Storage Buckets Setup Script
-- Storage buckets and policies for file uploads
-- ============================================================================
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql
-- ============================================================================

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- 1. Avatars bucket (user profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Module icons bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'module-icons',
    'module-icons',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Lesson videos bucket (optional - you might use YouTube/Vimeo instead)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lesson-videos',
    'lesson-videos',
    true,
    104857600, -- 100MB
    ARRAY['video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Assignment files bucket (student submissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assignment-files',
    'assignment-files',
    false, -- Private bucket
    20971520, -- 20MB
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 5. 3D models bucket (GLB/GLTF files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    '3d-models',
    '3d-models',
    true,
    52428800, -- 50MB
    ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Model thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'model-thumbnails',
    'model-thumbnails',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Badge icons bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'badge-icons',
    'badge-icons',
    true,
    1048576, -- 1MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 8. Exports bucket (STL files from conversions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exports',
    'exports',
    false, -- Private bucket
    104857600, -- 100MB
    ARRAY['model/stl', 'application/sla', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- ============================================================================
-- 1. AVATARS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================================
-- 2. MODULE ICONS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload module icons (for admins/teachers)
CREATE POLICY "Authenticated users can upload module icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'module-icons');

-- Allow authenticated users to update module icons
CREATE POLICY "Authenticated users can update module icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'module-icons');

-- Allow authenticated users to delete module icons
CREATE POLICY "Authenticated users can delete module icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'module-icons');

-- Allow public read access to module icons
CREATE POLICY "Anyone can view module icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'module-icons');

-- ============================================================================
-- 3. LESSON VIDEOS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload lesson videos
CREATE POLICY "Authenticated users can upload lesson videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-videos');

-- Allow authenticated users to update lesson videos
CREATE POLICY "Authenticated users can update lesson videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-videos');

-- Allow authenticated users to delete lesson videos
CREATE POLICY "Authenticated users can delete lesson videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-videos');

-- Allow public read access to lesson videos
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

-- ============================================================================
-- 4. ASSIGNMENT FILES BUCKET POLICIES
-- ============================================================================

-- Allow students to upload their assignment files
CREATE POLICY "Students can upload assignment files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own assignment files
CREATE POLICY "Students can update their assignment files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own assignment files
CREATE POLICY "Students can delete their assignment files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow students to view their own files
CREATE POLICY "Students can view their own assignment files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow teachers to view assignment files from their students
CREATE POLICY "Teachers can view their students assignment files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    EXISTS (
        SELECT 1
        FROM public.classroom_members cm
        JOIN public.classrooms c ON c.id = cm.classroom_id
        WHERE cm.student_id::text = (storage.foldername(name))[1]
        AND c.teacher_id = auth.uid()
    )
);

-- ============================================================================
-- 5. 3D MODELS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload 3D models
CREATE POLICY "Users can upload their own 3D models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = '3d-models' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own 3D models
CREATE POLICY "Users can update their own 3D models"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = '3d-models' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own 3D models
CREATE POLICY "Users can delete their own 3D models"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = '3d-models' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to 3D models
CREATE POLICY "Anyone can view 3D models"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = '3d-models');

-- ============================================================================
-- 6. MODEL THUMBNAILS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload model thumbnails
CREATE POLICY "Users can upload their own model thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'model-thumbnails' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own model thumbnails
CREATE POLICY "Users can update their own model thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'model-thumbnails' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own model thumbnails
CREATE POLICY "Users can delete their own model thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'model-thumbnails' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to model thumbnails
CREATE POLICY "Anyone can view model thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'model-thumbnails');

-- ============================================================================
-- 7. BADGE ICONS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload badge icons (for admins)
CREATE POLICY "Authenticated users can upload badge icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'badge-icons');

-- Allow authenticated users to update badge icons
CREATE POLICY "Authenticated users can update badge icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'badge-icons');

-- Allow authenticated users to delete badge icons
CREATE POLICY "Authenticated users can delete badge icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'badge-icons');

-- Allow public read access to badge icons
CREATE POLICY "Anyone can view badge icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'badge-icons');

-- ============================================================================
-- 8. EXPORTS BUCKET POLICIES
-- ============================================================================

-- Allow users to upload their own export files
CREATE POLICY "Users can upload their own export files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own export files
CREATE POLICY "Users can update their own export files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own export files
CREATE POLICY "Users can delete their own export files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own export files
CREATE POLICY "Users can view their own export files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- HELPER FUNCTIONS FOR STORAGE
-- ============================================================================

-- Function to get file URL
CREATE OR REPLACE FUNCTION public.get_storage_url(
    p_bucket_id TEXT,
    p_file_path TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/' || p_bucket_id || '/' || p_file_path;
END;
$$ LANGUAGE plpgsql;

-- Function to delete old file when updating
CREATE OR REPLACE FUNCTION public.delete_old_storage_file()
RETURNS TRIGGER AS $$
DECLARE
    v_bucket TEXT;
    v_old_path TEXT;
BEGIN
    -- Extract bucket and path from old URL
    -- This is a helper for automatic cleanup when URLs change
    -- Customize based on your URL structure

    IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' THEN
        IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
            -- Extract path and delete from storage
            -- You'll need to implement this based on your URL structure
            -- Example: DELETE FROM storage.objects WHERE bucket_id = 'avatars' AND name = extracted_path;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FOLDER STRUCTURE RECOMMENDATIONS
-- ============================================================================

-- When uploading files, use these folder structures:
--
-- avatars/
--   └── {user_id}/
--       └── avatar.{ext}
--
-- module-icons/
--   └── {module_slug}/
--       └── icon.{ext}
--
-- lesson-videos/
--   └── {lesson_slug}/
--       └── video.{ext}
--
-- assignment-files/
--   └── {student_id}/
--       └── {assignment_id}/
--           └── {filename}.{ext}
--
-- 3d-models/
--   └── {user_id}/
--       └── {model_id}/
--           └── model.glb
--
-- model-thumbnails/
--   └── {user_id}/
--       └── {model_id}/
--           └── thumbnail.{ext}
--
-- badge-icons/
--   └── {badge_slug}/
--       └── icon.{ext}
--
-- exports/
--   └── {user_id}/
--       └── {export_job_id}/
--           └── export.stl

-- ============================================================================
-- DONE! Your storage buckets are ready to use.
-- ============================================================================

-- Next steps:
-- 1. Go to Supabase Dashboard > Storage to verify buckets were created
-- 2. Test file uploads from your application
-- 3. Adjust file size limits and MIME types as needed
-- 4. Consider adding custom validation functions for specific file types
