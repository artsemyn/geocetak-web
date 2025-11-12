// src/pages/lkpd/Stage1Define.tsx
import { useState, useEffect } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage1Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage1Define({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();
  
  const [formData, setFormData] = useState<Stage1Data>({
    project_goal: '',
    shape_importance: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage1) {
      setFormData(lkpdData.stage1);
    }
  }, [lkpdData]);

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!formData.project_goal && !formData.shape_importance) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(1, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleSubmit = () => {
    if (!formData.project_goal || !formData.shape_importance) {
      alert('Mohon lengkapi semua field!');
      return;
    }
    updateStage(1, formData);
    onNext();
  };

  const isValid = formData.project_goal.length >= 10 && formData.shape_importance.length >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-4xl">
              🟦
            </div>
            <div>
              <div className="text-sm text-blue-600 font-semibold">TAHAP 1 dari 6</div>
              <h1 className="text-3xl font-bold text-gray-800">Define the Problem</h1>
            </div>
          </div>

          {/* Auto-save indicator */}
          {autoSaveStatus === 'saved' && (
            <div className="mt-4 text-green-600 text-sm">✓ Tersimpan otomatis</div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">
                1. Projek apa yang akan kamu buat? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.project_goal}
                onChange={(e) => setFormData({ ...formData, project_goal: e.target.value })}
                className="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Saya akan membuat gelas berbentuk tabung..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.project_goal.length} karakter (minimal 10)
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                2. Kenapa kamu memilih projek ini? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.shape_importance}
                onChange={(e) => setFormData({ ...formData, shape_importance: e.target.value })}
                className="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Karena bentuk tabung mudah dibuat..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.shape_importance.length} karakter (minimal 10)
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200"
            >
              ← Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`px-6 py-3 rounded-xl font-semibold ${
                isValid
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Simpan & Lanjut →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}