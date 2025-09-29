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
}

export class ModelExportService {
  /**
   * Save a 3D model export to the database
   */
  static async saveModelExport(data: ExportModelData): Promise<ModelExport | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get student profile if exists
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Generate mock STL content (in real implementation, this would come from Three.js editor)
      const stlContent = this.generateMockSTL(data.projectName, data.geometryParams)

      // In a real implementation, you would:
      // 1. Get the actual 3D model data from Three.js editor iframe
      // 2. Convert it to STL format
      // 3. Upload the STL file to Supabase Storage
      // 4. Get the public URL

      // For now, we'll simulate this process
      const mockSTLUrl = `https://storage.supabase.com/models/${user.id}/${data.projectName}.stl`

      const exportData = {
        user_id: user.id,
        student_id: studentData?.id || null,
        project_name: data.projectName,
        model_type: data.modelType || 'custom',
        model_data: data.modelData || {},
        stl_file_url: mockSTLUrl,
        stl_file_size: stlContent.length,
        thumbnail_url: null,
        description: data.description || null,
        geometry_params: data.geometryParams || {},
        export_status: 'completed',
        download_count: 0,
        is_public: data.isPublic || false,
        tags: data.tags || []
      }

      const { data: result, error } = await supabase
        .from('model_exports')
        .insert(exportData)
        .select()
        .single()

      if (error) {
        console.error('Error saving model export:', error)
        return null
      }

      // Update student XP for creating a model
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
        .from('model_exports')
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
   * Get public models
   */
  static async getPublicModels(): Promise<ModelExport[]> {
    try {
      const { data, error } = await supabase
        .from('model_exports')
        .select('*')
        .eq('is_public', true)
        .order('download_count', { ascending: false })
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
   * Download a model (increment download count)
   */
  static async downloadModel(modelId: number): Promise<string | null> {
    try {
      // Increment download count
      const { error: updateError } = await supabase
        .from('model_exports')
        .update({
          download_count: supabase.rpc('increment_download_count', { model_id: modelId })
        })
        .eq('id', modelId)

      if (updateError) {
        console.error('Error updating download count:', updateError)
      }

      // Get the STL file URL
      const { data, error } = await supabase
        .from('model_exports')
        .select('stl_file_url, project_name')
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
  static async deleteModel(modelId: number, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('model_exports')
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
  private static async awardModelCreationXP(studentId: number): Promise<void> {
    try {
      const xpReward = 75 // XP for creating a model

      // Update student XP
      await supabase
        .from('students')
        .update({
          xp_points: supabase.raw('xp_points + ?', [xpReward]),
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', studentId)

      console.log(`Awarded ${xpReward} XP for model creation`)
    } catch (error) {
      console.error('Error awarding model creation XP:', error)
    }
  }

  /**
   * Generate mock STL content (for demonstration)
   * In a real implementation, this would come from the Three.js editor
   */
  private static generateMockSTL(projectName: string, geometryParams: any): string {
    const header = `solid ${projectName.replace(/\s+/g, '_')}\n`
    const footer = `endsolid ${projectName.replace(/\s+/g, '_')}\n`

    // Mock triangle data (this would be real STL triangles in production)
    let triangles = ''
    for (let i = 0; i < 10; i++) {
      triangles += `  facet normal 0.0 0.0 1.0\n`
      triangles += `    outer loop\n`
      triangles += `      vertex ${i}.0 ${i}.0 0.0\n`
      triangles += `      vertex ${i + 1}.0 ${i}.0 0.0\n`
      triangles += `      vertex ${i}.0 ${i + 1}.0 0.0\n`
      triangles += `    endloop\n`
      triangles += `  endfacet\n`
    }

    return header + triangles + footer
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
        .from('model_exports')
        .select('download_count, is_public')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching model stats:', error)
        return { totalModels: 0, totalDownloads: 0, publicModels: 0 }
      }

      const totalModels = data.length
      const totalDownloads = data.reduce((sum, model) => sum + (model.download_count || 0), 0)
      const publicModels = data.filter(model => model.is_public).length

      return { totalModels, totalDownloads, publicModels }
    } catch (error) {
      console.error('Error in getUserModelStats:', error)
      return { totalModels: 0, totalDownloads: 0, publicModels: 0 }
    }
  }
}

export default ModelExportService