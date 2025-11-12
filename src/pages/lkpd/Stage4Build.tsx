// src/pages/lkpd/Stage4Build.tsx
import { useState, useEffect, useRef } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage4Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage4Build({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Stage4Data>({
    challenges: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage4) {
      setFormData(lkpdData.stage4);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.challenges && !formData.stl_file) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(4, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.stl')) {
      alert('Hanya file .STL yang diperbolehkan!');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Ukuran file maksimal 50MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        stl_file: {
          name: file.name,
          size: file.size,
          url: reader.result as string, // For local storage, nanti ganti dengan Supabase URL
          uploaded_at: new Date().toISOString(),
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, stl_file: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = () => {
    if (!formData.stl_file || !formData.challenges) {
      alert('Mohon upload file STL dan isi tantangan yang dihadapi!');
      return;
    }

    updateStage(4, formData);
    onNext();
  };

  const isValid = !!formData.stl_file && formData.challenges.length >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-4xl">
              🟥
            </div>
            <div>
              <div className="text-sm text-red-600 font-semibold">TAHAP 4 dari 6</div>
              <h1 className="text-3xl font-bold text-gray-800">Create / Build</h1>
              <p className="text-gray-600">Membuat Model dan Mencetak 3D</p>
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
            <div className="flex items-center gap-2 mt-4 text-red-600 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full" />
              <span>Menyimpan...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏗️ Upload File STL</h2>
          
          {/* File Upload Section */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-3">
              📤 Upload File STL dari Tinkercad <span className="text-red-500">*</span>
            </label>

            {!formData.stl_file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-500 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-6xl mb-4">📁</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-3 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Pilih File .STL
                </button>
                <p className="text-sm text-gray-600 mb-1">Format: .STL only (max 50MB)</p>
              </div>
            ) : (
              <div className="border-2 border-green-500 rounded-xl p-6 bg-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-5xl">✓</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-lg mb-1">
                        {formData.stl_file.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Ukuran: {formatFileSize(formData.stl_file.size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded at: {formatDate(formData.stl_file.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Cara export STL dari Tinkercad:</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">1.</span>
                <span>Klik "Export" di menu atas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">2.</span>
                <span>Pilih format ".STL"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">3.</span>
                <span>Download file ke komputer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">4.</span>
                <span>Upload file tersebut di sini</span>
              </li>
            </ol>
          </div>

          {/* Challenges */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-2">
              🔧 Apa tantangan atau hambatan yang kamu temui saat membuat design ini? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Contoh: Sulit mengatur ketebalan dinding agar tidak terlalu tipis. Sempat kesulitan menggabungkan dua bentuk geometri..."
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.challenges.length} karakter (minimal 10)
            </div>
          </div>

          {/* STEAM Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
            <span className="font-semibold text-gray-700">Tag STEAM aktif:</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">⚙️ Engineering</span>
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
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isValid
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Simpan & Lanjut <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}