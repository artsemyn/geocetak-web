// src/hooks/useLKPDSection.ts
import { useState, useEffect, useCallback } from 'react';
import type { LKPDData } from '@/types/lkpd.types';

const STORAGE_KEY = 'lkpd_current_session';

export const useLKPDSection = () => {
  const [lkpdData, setLkpdData] = useState<LKPDData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage (temporary, nanti ganti Supabase)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLkpdData(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage (temporary)
  const saveData = useCallback((data: LKPDData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLkpdData(data);
  }, []);

  // Initialize new project
  const initializeProject = useCallback(() => {
    const newProject: LKPDData = {
      project: {
        id: `lkpd_${Date.now()}`,
        user_id: 'temp_user', // Nanti ambil dari auth
        title: 'Merancang Wadah Berbentuk Bangun Ruang Sisi Lengkung',
        project_type: 'cylinder',
        current_stage: 1,
        is_completed: false,
        started_at: new Date().toISOString(),
        last_auto_save: new Date().toISOString(),
      },
    };
    saveData(newProject);
    return newProject;
  }, [saveData]);

  // Update specific stage
  const updateStage = useCallback(
    (stage: number, data: any) => {
      if (!lkpdData) return;
      
      const updated: LKPDData = {
        ...lkpdData,
        [`stage${stage}`]: {
          ...data,
          completed_at: new Date().toISOString(),
        },
        project: {
          ...lkpdData.project,
          current_stage: Math.max(lkpdData.project.current_stage, stage + 1) as any,
          last_auto_save: new Date().toISOString(),
        },
      };
      saveData(updated);
    },
    [lkpdData, saveData]
  );

  // Auto-save without completing
  const autoSave = useCallback(
    (stage: number, data: any) => {
      if (!lkpdData) return;
      
      const updated: LKPDData = {
        ...lkpdData,
        [`stage${stage}`]: data,
        project: {
          ...lkpdData.project,
          last_auto_save: new Date().toISOString(),
        },
      };
      saveData(updated);
    },
    [lkpdData, saveData]
  );

  // Get progress
  const getProgress = useCallback(() => {
    if (!lkpdData) return { completed: 0, total: 6, percentage: 0 };
    
    let completed = 0;
    for (let i = 1; i <= 6; i++) {
      if ((lkpdData as any)[`stage${i}`]?.completed_at) completed++;
    }
    
    return {
      completed,
      total: 6,
      percentage: Math.round((completed / 6) * 100),
    };
  }, [lkpdData]);

  return {
    lkpdData,
    isLoading,
    initializeProject,
    updateStage,
    autoSave,
    getProgress,
  };
};