// src/pages/lkpd/Stage2Imagine.tsx
import { useState, useEffect, useRef } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage2Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage2Imagine({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Stage2Data>({
    sketch_images: [],
    design_description: '',
    checklist: {
      sketch_clear: false,
      size_determined: false,
      easy_to_make: false,
      matches_goal: false,
    },
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage2) {
      setFormData(lkpdData.stage2);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.design_description && formData.sketch_images.length === 0) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(2, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (formData.sketch_images.length >= 3) {
        alert('Maksimal 3 gambar');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          sketch_images: [...prev.sketch_images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sketch_images: prev.sketch_images.filter((_, i) => i !== index),
    }));
  };

  const handleChecklistChange = (key: keyof Stage2Data['checklist']) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }));
  };

  const handleSubmit = () => {
    if (formData.sketch_images.length === 0 || !formData.design_description) {
      alert('Mohon upload minimal 1 gambar dan isi deskripsi!');
      return;
    }

    updateStage(2, formData);
    onNext();
  };

  const isValid = formData.sketch_images.length > 0 && formData.design_description.length >= 20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-4xl">
              🟨
            </div>
            <div>
              <div className="text-sm text-yellow-600 font-semibold">TAHAP 2 dari 6</div>
              <h1 className="text-3xl font-bold text-gray-800">Imagine</h1>
              <p className="text-gray-600">Mengembangkan Ide dan Alternatif Solusi</p>
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
            <div className="flex items-center gap-2 mt-4 text-yellow-600 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
              <span>Menyimpan...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💡 Visualisasikan Ide Desainmu</h2>
          
          {/* Image Upload Section */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-3">
              📤 Upload Sketsa Design <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-yellow-500 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="text-5xl mb-4">📁</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Upload File
              </button>
              <p className="text-sm text-gray-600 mb-2">Format: JPG, PNG</p>
              <p className="text-xs text-gray-500">Maksimal 3 gambar</p>
            </div>

            {/* Image Preview */}
            {formData.sketch_images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.sketch_images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Sketch ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        IMG {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-2">
              ✍️ Deskripsikan desainmu secara singkat <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.design_description}
              onChange={(e) => setFormData({ ...formData, design_description: e.target.value })}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              placeholder="Contoh: Desain berbentuk tabung dengan diameter 8cm dan tinggi 12cm. Bagian atas terbuka untuk memudahkan pengisian air..."
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.design_description.length} karakter (minimal 20)
            </div>
          </div>

          {/* Checklist */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="font-semibold text-gray-800 mb-4">
              ✅ Checklist (centang yang sudah dipenuhi):
            </h3>
            <div className="space-y-3">
              {[
                { key: 'sketch_clear', label: 'Sketsa sudah jelas dan detail' },
                { key: 'size_determined', label: 'Ukuran sudah ditentukan' },
                { key: 'easy_to_make', label: 'Desain mudah untuk dibuat di Tinkercad' },
                { key: 'matches_goal', label: 'Desain sesuai dengan tujuan projek' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.checklist[item.key as keyof Stage2Data['checklist']]}
                    onChange={() => handleChecklistChange(item.key as keyof Stage2Data['checklist'])}
                    className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* STEAM Tags */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
            <span className="font-semibold text-gray-700">Tag STEAM aktif:</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">🎨 Arts</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">⚙️ Engineering</span>
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
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg'
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