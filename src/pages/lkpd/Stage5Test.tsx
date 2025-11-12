// src/pages/lkpd/Stage5Test.tsx
import { useState, useEffect, useRef } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage5Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage5Test({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Stage5Data>({
    calculated_volume: 0,
    surface_area: 0,
    capacity: 0,
    strengths: '',
    weaknesses: '',
    result_photos: [],
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Calculate volume and surface area from Stage 3 data
  useEffect(() => {
    if (lkpdData?.stage3) {
      const { radius, height } = lkpdData.stage3;
      
      // Volume tabung: V = πr²t
      const volume = Math.PI * Math.pow(radius, 2) * height;
      
      // Luas permukaan tabung: A = 2πr(r + t)
      const surfaceArea = 2 * Math.PI * radius * (radius + height);
      
      // Kapasitas dalam ml (1 cm³ = 1 ml)
      const capacity = volume;

      setFormData((prev) => ({
        ...prev,
        calculated_volume: parseFloat(volume.toFixed(2)),
        surface_area: parseFloat(surfaceArea.toFixed(2)),
        capacity: parseFloat(capacity.toFixed(2)),
      }));
    }
  }, [lkpdData]);

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage5) {
      setFormData((prev) => ({
        ...prev,
        ...lkpdData.stage5,
      }));
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.strengths && !formData.weaknesses) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(5, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (formData.result_photos.length >= 3) {
        alert('Maksimal 3 foto');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan!');
        return;
      }

      // Batasi ukuran file max 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Ukuran file terlalu besar! Max 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Compress image if too large
        if (result.length > 1024 * 1024) {
          // Convert to smaller size by reducing quality
          const img = new Image();
          img.src = result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width * 0.7;
              canvas.height = img.height * 0.7;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const compressed = canvas.toDataURL('image/jpeg', 0.7);
              setFormData((prev) => ({
                ...prev,
                result_photos: [...prev.result_photos, compressed],
              }));
            }
          };
        } else {
          setFormData((prev) => ({
            ...prev,
            result_photos: [...prev.result_photos, result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      result_photos: prev.result_photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.strengths || !formData.weaknesses || formData.result_photos.length === 0) {
      alert('Mohon lengkapi analisis dan upload minimal 1 foto!');
      return;
    }

    updateStage(5, formData);
    onNext();
  };

  const isValid = formData.strengths.length >= 20 && 
                  formData.weaknesses.length >= 20 && 
                  formData.result_photos.length >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-4xl">
              🟪
            </div>
            <div>
              <div className="text-sm text-purple-600 font-semibold">TAHAP 5 dari 6</div>
              <h1 className="text-3xl font-bold text-gray-800">Test & Observe</h1>
              <p className="text-gray-600">Menguji dan Mengamati Model Fisik</p>
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
            <div className="flex items-center gap-2 mt-4 text-purple-600 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
              <span>Menyimpan...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🧪 Analisis & Uji Desainmu</h2>
          
          {/* Auto Calculations */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4">
              📊 Perhitungan Otomatis:
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              (Berdasarkan ukuran dari Tahap 3)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Volume (V):</p>
                <p className="text-2xl font-bold text-gray-800">{formData.calculated_volume}</p>
                <p className="text-sm text-gray-500">cm³</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Luas Permukaan (A):</p>
                <p className="text-2xl font-bold text-gray-800">{formData.surface_area}</p>
                <p className="text-sm text-gray-500">cm²</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Kapasitas Air:</p>
                <p className="text-2xl font-bold text-gray-800">{formData.capacity}</p>
                <p className="text-sm text-gray-500">ml</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                💡 Rumus yang digunakan (Tabung):
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• V = πr²t</li>
                <li>• A = 2πr(r + t)</li>
                <li>• Kapasitas = V (1 cm³ = 1 ml)</li>
              </ul>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">📝 Analisis Desain:</h3>
            
            {/* Strengths */}
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-2">
                Apa kelebihan desainmu? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Contoh: Bentuk sederhana dan mudah digenggam, volume sesuai target 500ml. Desain efisien dalam penggunaan material..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.strengths.length} karakter (minimal 20)
              </div>
            </div>

            {/* Weaknesses */}
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-2">
                Apa kekurangan desainmu? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.weaknesses}
                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Contoh: Tidak ada pegangan, jadi agak licin saat dipegang. Bagian atas terlalu lebar sehingga kurang praktis..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.weaknesses.length} karakter (minimal 20)
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-8">
            <label className="block text-gray-800 font-semibold mb-3">
              📸 Upload Foto Barang Jadi <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="text-5xl mb-3">📷</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Upload Foto (minimal 1)
              </button>
              <p className="text-sm text-gray-600">Format: JPG, PNG (max 3 foto)</p>
            </div>

            {/* Photo Preview */}
            {formData.result_photos.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.result_photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Result ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {index === 0 ? 'TOP VIEW' : index === 1 ? 'SIDE VIEW' : `VIEW ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEAM Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
            <span className="font-semibold text-gray-700">Tag STEAM aktif:</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">🔬 Science</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">⚙️ Engineering</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">➗ Mathematics</span>
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
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:shadow-lg'
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