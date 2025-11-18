// src/stores/lkpdStore.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { LKPDData, LKPDProject, Stage1Data, Stage2Data, Stage3Data, Stage4Data, Stage5Data, Stage6Data } from '@/types/lkpd.types';

interface LKPDSubmission {
  id: string;
  student_id: string;
  title: string;
  project_type: 'cylinder' | 'hemisphere' | 'cone' | 'composite';
  project_data: LKPDData;
  current_stage: 1 | 2 | 3 | 4 | 5 | 6;
  completed_stages: number[];
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  submitted_at: string | null;
  last_auto_save: string;
  created_at: string;
  updated_at: string;
}

interface LKPDStore {
  // State
  currentProject: LKPDData | null;
  submissionId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeProject: () => Promise<void>;
  loadProject: (projectId?: string) => Promise<void>;
  updateStage: (stage: number, data: any) => Promise<void>;
  autoSave: (stage: number, data: any) => Promise<void>;
  submitProject: () => Promise<void>;
  getProgress: () => { completed: number; total: number; percentage: number };
  clearProject: () => void;
}

export const useLKPDStore = create<LKPDStore>((set, get) => ({
  // Initial State
  currentProject: null,
  submissionId: null,
  isLoading: false,
  error: null,

  // Initialize a new project
  initializeProject: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user already has a project in progress
      const { data: existingSubmissions, error: fetchError } = await supabase
        .from('lkpd_submissions')
        .select('*')
        .eq('student_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // If there's an existing project, load it
      if (existingSubmissions && existingSubmissions.length > 0) {
        const submission = existingSubmissions[0] as LKPDSubmission;
        set({
          currentProject: submission.project_data,
          submissionId: submission.id,
          isLoading: false
        });
        return;
      }

      // Create new project
      const newProjectId = `lkpd_${Date.now()}`;
      const initialProjectData: LKPDData = {
        project: {
          id: newProjectId,
          user_id: user.id,
          title: 'LKPD Pembelajaran',
          project_type: 'cylinder',
          current_stage: 1,
          is_completed: false,
          started_at: new Date().toISOString(),
          last_auto_save: new Date().toISOString()
        }
      };

      const { data: newSubmission, error: insertError } = await supabase
        .from('lkpd_submissions')
        .insert({
          student_id: user.id,
          title: 'LKPD Pembelajaran',
          project_type: 'cylinder',
          project_data: initialProjectData,
          current_stage: 1,
          completed_stages: [],
          is_completed: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      set({
        currentProject: initialProjectData,
        submissionId: newSubmission.id,
        isLoading: false
      });

    } catch (error: any) {
      console.error('Error initializing project:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Load existing project
  loadProject: async (projectId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('lkpd_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (projectId) {
        query = query.eq('id', projectId);
      } else {
        // Load most recent project
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const submission = data[0] as LKPDSubmission;
        set({
          currentProject: submission.project_data,
          submissionId: submission.id,
          isLoading: false
        });
      } else {
        // No project found, initialize new one
        await get().initializeProject();
      }

    } catch (error: any) {
      console.error('Error loading project:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Update stage and mark as complete
  updateStage: async (stage: number, data: any) => {
    const { currentProject, submissionId } = get();

    console.log('updateStage called:', { stage, submissionId, hasProject: !!currentProject });

    if (!currentProject || !submissionId) {
      console.error('No current project or submission ID');
      alert('Error: No active project found. Please refresh the page.');
      return;
    }

    try {
      const stageKey = `stage${stage}` as keyof LKPDData;
      const completedAt = new Date().toISOString();

      // Update local state
      const updatedProject: LKPDData = {
        ...currentProject,
        [stageKey]: {
          ...data,
          completed_at: completedAt
        }
      };

      // Determine next stage
      const nextStage = Math.min(stage + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
      updatedProject.project = {
        ...updatedProject.project,
        current_stage: nextStage,
        last_auto_save: completedAt
      };

      console.log('Updating to next stage:', nextStage);

      // Update database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: currentSubmission, error: fetchError } = await supabase
        .from('lkpd_submissions')
        .select('completed_stages')
        .eq('id', submissionId)
        .single();

      if (fetchError) {
        console.error('Error fetching current submission:', fetchError);
        throw fetchError;
      }

      const completedStages = currentSubmission?.completed_stages || [];
      if (!completedStages.includes(stage)) {
        completedStages.push(stage);
      }

      console.log('Completed stages:', completedStages);

      const { error: updateError } = await supabase
        .from('lkpd_submissions')
        .update({
          project_data: updatedProject,
          current_stage: nextStage,
          completed_stages: completedStages,
          last_auto_save: completedAt
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Stage updated successfully, setting local state');
      set({ currentProject: updatedProject });

    } catch (error: any) {
      console.error('Error updating stage:', error);
      alert(`Error: ${error.message}`);
      set({ error: error.message });
      throw error; // Re-throw so the component knows it failed
    }
  },

  // Auto-save without completing stage
  autoSave: async (stage: number, data: any) => {
    const { currentProject, submissionId } = get();
    if (!currentProject || !submissionId) {
      return;
    }

    try {
      const stageKey = `stage${stage}` as keyof LKPDData;
      const now = new Date().toISOString();

      // Update local state (preserve existing completed_at if it exists)
      const existingStageData = currentProject[stageKey] as any;
      const updatedProject: LKPDData = {
        ...currentProject,
        [stageKey]: {
          ...data,
          completed_at: existingStageData?.completed_at || undefined
        }
      };

      updatedProject.project = {
        ...updatedProject.project,
        last_auto_save: now
      };

      // Update database
      const { error: updateError } = await supabase
        .from('lkpd_submissions')
        .update({
          project_data: updatedProject,
          last_auto_save: now
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      set({ currentProject: updatedProject });

    } catch (error: any) {
      console.error('Error auto-saving:', error);
      // Don't set error state for auto-save failures (silent fail)
    }
  },

  // Submit final project
  submitProject: async () => {
    const { submissionId } = get();
    if (!submissionId) {
      console.error('No submission ID');
      return;
    }

    try {
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('lkpd_submissions')
        .update({
          is_completed: true,
          completed_at: now,
          submitted_at: now
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // Update local state
      const { currentProject } = get();
      if (currentProject) {
        const updatedProject = {
          ...currentProject,
          project: {
            ...currentProject.project,
            is_completed: true,
            completed_at: now
          }
        };
        set({ currentProject: updatedProject });
      }

    } catch (error: any) {
      console.error('Error submitting project:', error);
      set({ error: error.message });
    }
  },

  // Get progress
  getProgress: () => {
    const { currentProject } = get();
    if (!currentProject) {
      return { completed: 0, total: 6, percentage: 0 };
    }

    let completed = 0;
    for (let i = 1; i <= 6; i++) {
      const stageKey = `stage${i}` as keyof LKPDData;
      const stageData = currentProject[stageKey] as any;
      if (stageData?.completed_at) {
        completed++;
      }
    }

    return {
      completed,
      total: 6,
      percentage: Math.round((completed / 6) * 100)
    };
  },

  // Clear project (for logout or reset)
  clearProject: () => {
    set({
      currentProject: null,
      submissionId: null,
      error: null
    });
  }
}));
