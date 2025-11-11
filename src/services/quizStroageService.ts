// src/services/quizStorageService.ts
import { supabase } from './supabase'

export interface QuizPhotoUploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
  filePath?: string
}

export class QuizStorageService {
  private static readonly BUCKET_NAME = 'assignment-files'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
  ]

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File ${file.name} terlalu besar. Maksimal 5MB`
      }
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipe file tidak diizinkan. Hanya foto (JPG, PNG, WebP, GIF)`
      }
    }

    return { valid: true }
  }

  static generateFilePath(userId: string, questionId: string, fileName: string): string {
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${userId}/quiz-essays/${questionId}/${timestamp}_${sanitizedFileName}`
  }

  static async uploadQuizPhoto(
    file: File,
    userId: string,
    questionId: string
  ): Promise<QuizPhotoUploadResult> {
    try {
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const filePath = this.generateFilePath(userId, questionId, file.name)

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        return {
          success: false,
          error: `Gagal mengupload ${file.name}: ${error.message}`
        }
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        fileName: file.name,
        filePath
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Terjadi kesalahan saat mengupload file'
      }
    }
  }

  static async deleteQuizPhoto(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Gagal menghapus file' }
    }
  }
}