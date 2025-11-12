// src/pages/lkpd/Stage3Design.tsx
import { useState, useEffect } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage3Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage3Design({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();
  
  const [formData, setFormData] = useState<Stage3Data>({
    tinkercad_url: '',
    diameter: 0,
    radius: 0,
    height: 0,
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage3) {
      setFormData(lkpdData.stage3);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (formData.diameter === 0 && formData.height === 0) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(3, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleDiameterChange = (value: string) => {
    const diameter = parseFloat(value) || 0;
    setFormData({
      ...formData,
      diameter,
      radius: diameter / 2,
    });
  };

  const handleHeightChange = (value: string) => {
    const height = parseFloat(value) || 0;
    setFormData({ ...formData, height });
  };

  const handleSubmit = () => {
    if (formData.diameter === 0 || formData.height === 0) {
      alert('Mohon lengkapi diameter dan tinggi!');
      return;
    }

    updateStage(3, formData);
    onNext();
  };

  const isValid = formData.diameter > 0 && formData.height > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-4xl">
              🟩
            </div>
            <div>
              <div className="text-sm text-green-600 font-semibold">TAHAP 3 dari 6</div>
              <h1 className="text-3xl font-bold text-gray-800">Plan & Design</h1>
              <p className="text-gray-600">Merancang Desain Digital</p>
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
            <div className="flex items-center gap-2 mt-4 text-green-600 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
              <span>Menyimpan...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🖥️ Buat Model 3D di Tinkercad</h2>
          
          {/* Tinkercad Section */}
          <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🔗 Link ke Tinkercad
            </h3>
            <a id="tinkercad-link"
              href="https://www.tinkercad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-4"
            >
              🚀 Buka Tinkercad di Tab Baru
            </a>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">💡 Tips:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Login dengan akun Google/email</li>
                <li>• Buat project baru</li>
                <li>• Gunakan basic shapes untuk membuat design</li>
                <li>• Jangan lupa save projectmu!</li>
              </ul>
            </div>

            {/* Optional: Tinkercad URL Input */}
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-2">
                Link Tinkercad Project (optional):
              </label>
              <input
                type="url"
                value={formData.tinkercad_url}
                onChange={(e) => setFormData({ ...formData, tinkercad_url: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://www.tinkercad.com/things/..."
              />
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">📐 Isi Ukuran Desainmu:</h3>
            
            <div className="space-y-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              {/* Diameter */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Diameter (d): <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.diameter || ''}
                    onChange={(e) => handleDiameterChange(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="0.0"
                  />
                  <span className="text-gray-600 font-medium min-w-[3rem]">cm</span>
                </div>
              </div>

              {/* Radius (auto-calculated) */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Jari-jari (r):
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={formData.radius || ''}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-lg cursor-not-allowed"
                    placeholder="(auto: d/2)"
                  />
                  <span className="text-gray-600 font-medium min-w-[3rem]">cm</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Otomatis dihitung: diameter ÷ 2</p>
              </div>

              {/* Height */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Tinggi (t): <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.height || ''}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="0.0"
                  />
                  <span className="text-gray-600 font-medium min-w-[3rem]">cm</span>
                </div>
              </div>
            </div>

            {/* Preview Dimensions */}
            {isValid && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">📊 Preview Ukuran:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Diameter:</span>
                    <span className="font-bold text-blue-900 ml-2">{formData.diameter} cm</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Radius:</span>
                    <span className="font-bold text-blue-900 ml-2">{formData.radius.toFixed(2)} cm</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tinggi:</span>
                    <span className="font-bold text-blue-900 ml-2">{formData.height} cm</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEAM Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <span className="font-semibold text-gray-700">Tag STEAM aktif:</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">💻 Technology</span>
            <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">➗ Mathematics</span>
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
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
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