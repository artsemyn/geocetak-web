// src/services/modelExportService.ts
import { supabase, ModelExport } from './supabase'

export interface ExportModelData {
  projectName: string
  modelType: string
  modelData?: any
  geometryParams?: any
  description?: string
  tags?: string[]
  isPublic?: boolean
  stlFile?: File  // Add support for real file upload
}

export class ModelExportService {
  /**
   * Upload STL file to Supabase Storage
   */
  static async uploadSTLFile(file: File, userId: string): Promise<{ url: string; path: string } | null> {
    try {
      // Generate unique file path
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${userId}/${timestamp}-${sanitizedFileName}`

      // Upload file to Supabase Storage bucket 'user-models'
      const { error } = await supabase.storage
        .from('user-models')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading STL file:', error)
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-models')
        .getPublicUrl(filePath)

      return {
        url: urlData.publicUrl,
        path: filePath
      }
    } catch (error) {
      console.error('Error in uploadSTLFile:', error)
      return null
    }
  }

  /**
   * Save a 3D model export to the database
   */
  static async saveModelExport(data: ExportModelData): Promise<ModelExport | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      let stlFileUrl = ''
      let stlFilePath = ''


      // If user provided an STL file, upload it to storage
      if (data.stlFile) {
        const uploadResult = await this.uploadSTLFile(data.stlFile, user.id)

        if (!uploadResult) {
          throw new Error('Failed to upload STL file')
        }

        stlFileUrl = uploadResult.url
        stlFilePath = uploadResult.path
      } else {
        // Fallback: generate mock STL if no file provided (backward compatibility)
        // const stlContent = this.generateMockSTL(data.projectName, data.geometryParams)
        stlFileUrl = `https://storage.supabase.com/models/${user.id}/${data.projectName}.stl`
        stlFilePath = `${user.id}/${data.projectName}.stl`
      }

      // Save to export_jobs table
      const exportData = {
        user_id: user.id,
        source_model_path: stlFilePath,
        stl_file_url: stlFileUrl,
        status: 'completed',
        error_message: null
      }

      const { data: result, error } = await supabase
        .from('export_jobs')
        .insert(exportData)
        .select()
        .single()

      if (error) {
        console.error('Error saving model export:', error)
        return null
      }

      // Award XP for creating a model
      const { data: studentData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (studentData?.id) {
        await this.awardModelCreationXP(studentData.id)
      }

      return result
    } catch (error) {
      console.error('Error in saveModelExport:', error)
      return null
    }
  }

  /**
   * Get user's model exports
   */
  static async getUserModels(userId: string): Promise<ModelExport[]> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user models:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserModels:', error)
      return []
    }
  }

  /**
   * Get public models (all models with status completed)
   */
  static async getPublicModels(): Promise<ModelExport[]> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching public models:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPublicModels:', error)
      return []
    }
  }

  /**
   * Download a model
   */
  static async downloadModel(modelId: string): Promise<string | null> {
    try {
      // Get the STL file URL
      const { data, error } = await supabase
        .from('export_jobs')
        .select('stl_file_url, source_model_path')
        .eq('id', modelId)
        .single()

      if (error) {
        console.error('Error fetching model:', error)
        return null
      }

      return data.stl_file_url
    } catch (error) {
      console.error('Error in downloadModel:', error)
      return null
    }
  }

  /**
   * Delete a user's model
   */
  static async deleteModel(modelId: string, userId: string): Promise<boolean> {
    try {
      // First get the file path to delete from storage
      const { data: modelData } = await supabase
        .from('export_jobs')
        .select('source_model_path')
        .eq('id', modelId)
        .eq('user_id', userId)
        .single()

      // Delete from storage if file exists
      if (modelData?.source_model_path) {
        await supabase.storage
          .from('user-models')
          .remove([modelData.source_model_path])
      }

      // Delete from database
      const { error } = await supabase
        .from('export_jobs')
        .delete()
        .eq('id', modelId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting model:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteModel:', error)
      return false
    }
  }

  /**
   * Award XP for creating a model
   */
  private static async awardModelCreationXP(userId: string): Promise<void> {
    try {
      const xpReward = 75 // XP for creating a model

      // Update gamification table
      const { data: gamData } = await supabase
        .from('gamification')
        .select('id, total_xp')
        .eq('user_id', userId)
        .single()

      if (gamData) {
        await supabase
          .from('gamification')
          .update({
            total_xp: gamData.total_xp + xpReward,
            last_activity_date: new Date().toISOString()
          })
          .eq('user_id', userId)
      } else {
        // Create gamification record if not exists
        await supabase
          .from('gamification')
          .insert({
            user_id: userId,
            total_xp: xpReward,
            level: 1,
            current_streak_days: 1,
            longest_streak_days: 1,
            last_activity_date: new Date().toISOString()
          })
      }


    } catch (error) {
      console.error('Error awarding model creation XP:', error)
    }
  }



  /**
   * Get model statistics for a user
   */
  static async getUserModelStats(userId: string): Promise<{
    totalModels: number
    totalDownloads: number
    publicModels: number
  }> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('status')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching model stats:', error)
        return { totalModels: 0, totalDownloads: 0, publicModels: 0 }
      }

      const totalModels = data.length
      const completedModels = data.filter(model => model.status === 'completed').length

      return {
        totalModels,
        totalDownloads: 0, // Not tracked in export_jobs
        publicModels: completedModels
      }
    } catch (error) {
      console.error('Error in getUserModelStats:', error)
      return { totalModels: 0, totalDownloads: 0, publicModels: 0 }
    }
  }
}

export default ModelExportService