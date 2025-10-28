// src/components/lkpd/LKPDWorkspace.tsx

import React, { useState } from 'react';
import { useLKPDData } from '../../hooks/useLKPDData';
import { submitLKPD, markSectionComplete } from '../../services/lkpdService';
import { LKPDHeader } from './common/LKPDHeader';
import { ProgressTracker } from './common/ProgressTracker';
import { SectionRenderer } from './sections/SectionRenderer';

export const LKPDWorkspace: React.FC = () => {
  const { worksheet, submission, loading, error, saveSection, goToSection } = useLKPDData();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat LKPD...</p>
        </div>
      </div>
    );
  }
  
  if (error || !worksheet || !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">❌ {error || 'LKPD tidak ditemukan'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }
  
  const currentSection = worksheet.sections[submission.current_section];
  const isLastSection = submission.current_section === worksheet.sections.length - 1;
  const canGoNext = submission.current_section < worksheet.sections.length - 1;
  const canGoPrevious = submission.current_section > 0;
  
  const handleSaveDraft = async () => {
    setSaving(true);
    // Current section data is already auto-saved via saveSection
    setTimeout(() => {
      setSaving(false);
      alert('✅ Draft tersimpan!');
    }, 500);
  };
  
  const handleNext = async () => {
    // Mark current section as complete (optional)
    await markSectionComplete(submission.id, submission.current_section);
    
    // Go to next section
    if (canGoNext) {
      await goToSection(submission.current_section + 1);
    }
  };
  
  const handlePrevious = async () => {
    if (canGoPrevious) {
      await goToSection(submission.current_section - 1);
    }
  };
  
  const handleSubmit = async () => {
    const confirmed = window.confirm(
      'Apakah kamu yakin ingin submit LKPD ini? Setelah submit, kamu tidak bisa mengubah jawabanmu.'
    );
    
    if (!confirmed) return;
    
    setSubmitting(true);
    const success = await submitLKPD(submission.id);
    
    if (success) {
      alert('✅ LKPD berhasil di-submit! Kamu akan menerima feedback dari guru.');
      // Redirect to assignments page or show success screen
      window.location.href = '/assignments';
    } else {
      alert('❌ Gagal submit LKPD. Silakan coba lagi.');
      setSubmitting(false);
    }
  };
  
  return (
    <div className="lkpd-workspace max-w-6xl mx-auto p-6">
      {/* Header */}
      <LKPDHeader 
        title={worksheet.title}
        objectives={worksheet.learning_objectives}
        estimatedMinutes={worksheet.estimated_minutes}
      />
      
      {/* Progress Tracker */}
      <div className="my-8">
        <ProgressTracker 
          sections={worksheet.sections}
          currentIndex={submission.current_section}
          completedSections={submission.completed_sections}
        />
      </div>
      
      {/* Current Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <SectionRenderer 
          section={currentSection}
          sectionIndex={submission.current_section}
          submission={submission}
          onSave={saveSection}
        />
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Sebelumnya
        </button>
        
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {saving ? '💾 Menyimpan...' : '💾 Simpan Draft'}
        </button>
        
        {!isLastSection ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Selanjutnya →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit LKPD'}
          </button>
        )}
      </div>
      
      {/* Status indicator */}
      {submission.status === 'draft' && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>💡 Pekerjaanmu otomatis tersimpan saat kamu pindah section</p>
        </div>
      )}
    </div>
  );
};