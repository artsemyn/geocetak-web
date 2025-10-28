// src/hooks/useLKPDData.ts

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getWorksheet, 
  getOrCreateSubmission,
  saveSectionResponse,
  updateCurrentSection 
} from '../services/lkpdService';
import type { LKPDWorksheet, LKPDSubmission, SectionResponse } from '../types/lkpd';

export function useLKPDData() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
    const user = { id: 'current-user-id' }; // Replace with actual user context  
  const [worksheet, setWorksheet] = useState<LKPDWorksheet | null>(null);
  const [submission, setSubmission] = useState<LKPDSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      if (!assignmentId || !user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch worksheet
        const worksheetData = await getWorksheet(assignmentId);
        if (!worksheetData) {
          throw new Error('Worksheet not found');
        }
        setWorksheet(worksheetData);
        
        // Get or create submission
        const submissionData = await getOrCreateSubmission(assignmentId, user.id);
        if (!submissionData) {
          throw new Error('Failed to create submission');
        }
        setSubmission(submissionData);
        
      } catch (err: any) {
        console.error('Error fetching LKPD data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [assignmentId, user]);
  
  // Save section response (auto-save)
  const saveSection = async (sectionIndex: number, response: SectionResponse) => {
    if (!submission) return false;
    
    const success = await saveSectionResponse(submission.id, sectionIndex, response);
    
    if (success) {
      // Update local state
      setSubmission(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          section_responses: {
            ...prev.section_responses,
            [`section_${sectionIndex}`]: response
          }
        };
      });
    }
    
    return success;
  };
  
  // Navigate to section
  const goToSection = async (sectionIndex: number) => {
    if (!submission) return;
    
    await updateCurrentSection(submission.id, sectionIndex);
    
    setSubmission(prev => {
      if (!prev) return prev;
      return { ...prev, current_section: sectionIndex };
    });
  };
  
  return {
    worksheet,
    submission,
    loading,
    error,
    saveSection,
    goToSection,
    refetch: () => {
      // Re-fetch data if needed
    }
  };
}