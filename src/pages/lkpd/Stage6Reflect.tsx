// src/pages/lkpd/Stage6Reflect.tsx
import { useState, useEffect } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage6Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export function Stage6Reflect({ onBack, onComplete }: Props) {
  const { lkpdData, autoSave, updateStage, getProgress } = useLKPDSection();
  
  const [formData, setFormData] = useState<Stage6Data>({
    learning_reflection: '',
    challenges: '',
    application: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage6) {
      setFormData(lkpdData.stage6);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.learning_reflection && !formData.challenges && !formData.application) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(6, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = () => {
    const reflectionWords = countWords(formData.learning_reflection);
    const challengesWords = countWords(formData.challenges);
    const applicationWords = countWords(formData.application);

    if (reflectionWords < 50 || challengesWords < 50 || applicationWords < 30) {
      alert('Mohon lengkapi semua refleksi sesuai minimal kata!');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    updateStage(6, formData);
    // Mark project as completed (you can add this to the hook)
    onComplete();
  };

  const isValid = countWords(formData.learning_reflection) >= 50 &&
                  countWords(formData.challenges) >= 50 &&
                  countWords(formData.application) >= 30;

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-4xl">
              🟧
            </div>
            <div>
              <div className="text-sm text-orange-600 font-semibold">TAHAP 6 dari 6 - TERAKHIR!</div>
              <h1 className="text-3xl font-bold text-gray-800">Share & Reflect</h1>
              <p className="text-gray-600">Merefleksikan dan Berbagi Hasil</p>
            </div>
          </div>

          {/* Auto-save Status */}
          {autoSaveStatus === 'saved' && (
            <div className="flex items-center gap-2 mt-4 text-green-600 text-sm">
              <span>✓</span>
              <span>Tersimpan otomatis</span>
            </div>
          )}
          {autoSaveStatus === 'saving' && (
            <div className="flex items-center gap-2 mt-4 text-orange-600 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full" />
              <span>Menyimpan...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <p className="text-green-800 font-medium text-center">
              🎉 Selamat! Kamu sudah menyelesaikan semua tahapan. Sekarang waktunya refleksi.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">💭 Refleksi Pembelajaran</h2>
          
          {/* Question 1 */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-2">
              1. Apa yang kamu pelajari dari kegiatan ini? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.learning_reflection}
              onChange={(e) => setFormData({ ...formData, learning_reflection: e.target.value })}
              className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Jelaskan apa yang kamu pelajari tentang geometri 3D, proses desain, dan aplikasinya dalam kehidupan nyata..."
            />
            <div className="flex justify-between text-sm mt-1">
              <span className={`${countWords(formData.learning_reflection) >= 50 ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                {countWords(formData.learning_reflection)} / 50 kata (minimal)
              </span>
              {countWords(formData.learning_reflection) >= 50 && <span className="text-green-600 font-bold">✓</span>}
            </div>
          </div>

          {/* Question 2 */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-2">
              2. Apa kekurangan yang kamu rasakan selama mengerjakan proyek ini? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Jelaskan tantangan yang dihadapi, aspek yang perlu diperbaiki, dan pembelajaran dari kesalahan..."
            />
            <div className="flex justify-between text-sm mt-1">
              <span className={`${countWords(formData.challenges) >= 50 ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                {countWords(formData.challenges)} / 50 kata (minimal)
              </span>
              {countWords(formData.challenges) >= 50 && <span className="text-green-600 font-bold">✓</span>}
            </div>
          </div>

          {/* Question 3 */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-2">
              3. Kamu akan menerapkan/menggunakan barang hasil desainmu untuk apa? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Jelaskan rencana penggunaan desainmu dalam kehidupan sehari-hari..."
            />
            <div className="flex justify-between text-sm mt-1">
              <span className={`${countWords(formData.application) >= 30 ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                {countWords(formData.application)} / 30 kata (minimal)
              </span>
              {countWords(formData.application) >= 30 && <span className="text-green-600 font-bold">✓</span>}
            </div>
          </div>

          {/* Project Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4">📊 Ringkasan Proyek:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Semua 6 tahap selesai ({progress.completed}/6)</span>
              </div>
              {lkpdData?.stage2 && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">{lkpdData.stage2.sketch_images.length} sketsa design</span>
                </div>
              )}
              {lkpdData?.stage4?.stl_file && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">1 file STL ({lkpdData.stage4.stl_file.name})</span>
                </div>
              )}
              {lkpdData?.stage5 && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{lkpdData.stage5.result_photos.length} foto hasil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">Volume: {lkpdData.stage5.calculated_volume} cm³</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-yellow-900 font-medium">
                Setelah dikumpulkan, LKPD tidak bisa diedit lagi! Pastikan semua sudah benar.
              </p>
            </div>
          </div>

          {/* STEAM Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
            <span className="font-semibold text-gray-700">Tag STEAM aktif:</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">🎨 Arts</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">💻 Technology</span>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <span>←</span> Kembali ke Overview
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 ${
                isValid
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ✓ Kumpulkan LKPD
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Konfirmasi Pengumpulan
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah kamu yakin ingin mengumpulkan LKPD ini? 
                Setelah dikumpulkan, data tidak bisa diubah lagi.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Ya, Kumpulkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}