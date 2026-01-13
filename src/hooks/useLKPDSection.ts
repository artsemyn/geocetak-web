// src/hooks/useLKPDSection.ts
import { useEffect } from 'react';
import { useLKPDStore } from '@/stores/lkpdStore';

/**
 * Hook for LKPD section management
 * Now uses Zustand store with Supabase backend
 */
export const useLKPDSection = () => {
  const {
    currentProject,
    submissionId,
    isLoading,
    error,
    initializeProject,
    loadProject,
    updateStage,
    autoSave,
    submitProject,
    getProgress
  } = useLKPDStore();

  // Load project on mount if not already loaded
  useEffect(() => {
    if (!currentProject && !isLoading && !error) {
      loadProject();
    }
  }, [currentProject, isLoading, error, loadProject]);

  return {
    lkpdData: currentProject,
    submissionId,
    isLoading,
    error,
    initializeProject,
    updateStage,
    autoSave,
    submitProject,
    getProgress,
  };
};
