// src/pages/SuccessPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SuccessPageProps {
  assignmentId?: string;
  projectTitle?: string;
  submissionTime?: string;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  assignmentId,
  projectTitle = 'LKPD Pembelajaran',
  submissionTime,
}) => {
  const navigate = useNavigate();
  const params = useParams<{ assignmentId: string }>();
  const id = assignmentId || params.assignmentId;
  const [displayedTime, setDisplayedTime] = useState<string>('');

  useEffect(() => {
    // Add celebratory style with animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotateZ(360deg);
          opacity: 0;
        }
      }
      .confetti {
        position: fixed;
        pointer-events: none;
        animation: fall 3s ease-out forwards;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);

    // Create falling particles
    const emojis = ['🎉', '🎊', '⭐', '✨', '🎈'];
    for (let i = 0; i < 50; i++) {
      const confettiEl = document.createElement('div');
      confettiEl.className = 'confetti';
      confettiEl.style.left = Math.random() * 100 + '%';
      confettiEl.style.top = '-10px';
      confettiEl.style.fontSize = Math.random() * 20 + 10 + 'px';
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      if (emoji) confettiEl.textContent = emoji;
      confettiEl.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confettiEl);
      setTimeout(() => confettiEl.remove(), 3500);
    }

    return () => style.remove();
  }, []);

  useEffect(() => {
    // Set current time if not provided
    if (!submissionTime) {
      const now = new Date();
      setDisplayedTime(
        now.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } else {
      setDisplayedTime(submissionTime);
    }
  }, [submissionTime]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToLKPDList = () => {
    navigate('/lkpd');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:shadow-3xl">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            {/* Animated checkmark */}
            <div className="flex justify-center mb-4">
              <div className="animate-bounce">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <span className="text-5xl text-green-500">✓</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              🎉 Selamat! 🎊
            </h1>
            <p className="text-green-100 text-lg font-semibold">
              LKPD Berhasil Dikumpulkan
            </p>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Message */}
            <p className="text-gray-700 text-lg mb-2">
              LKPD kamu sudah berhasil dikumpulkan!
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Guru akan menilai dalam beberapa hari.
            </p>

            {/* Details Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              {projectTitle && (
                <div className="mb-3 pb-3 border-b border-green-200">
                  <p className="text-xs font-semibold text-gray-600">PROYEK</p>
                  <p className="text-sm font-medium text-gray-800">{projectTitle}</p>
                </div>
              )}

              <div className="mb-3 pb-3 border-b border-green-200">
                <p className="text-xs font-semibold text-gray-600">STATUS</p>
                <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                  Dikumpulkan
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600">WAKTU PENGUMPULAN</p>
                <p className="text-sm font-medium text-gray-800">{displayedTime}</p>
              </div>
            </div>

            {/* Info Messages */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl flex-shrink-0">📧</span>
                <p className="text-xs text-gray-700 text-left">
                  Notifikasi feedback akan dikirim ke emailmu saat guru selesai menilai
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl flex-shrink-0">⭐</span>
                <p className="text-xs text-gray-700 text-left">
                  Kerja kerasmu akan dievaluasi dengan rubrik penilaian yang telah ditetapkan
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl flex-shrink-0">🔒</span>
                <p className="text-xs text-gray-700 text-left">
                  LKPD yang sudah dikumpulkan tidak bisa diedit lagi
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBackToDashboard}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                🏠 Kembali ke Dashboard
              </button>

              <button
                onClick={handleBackToLKPDList}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 active:scale-95"
              >
                📋 Lihat Daftar LKPD
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Submission ID: <span className="font-mono text-gray-700">{id}</span>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ✨ Terima kasih telah mengerjakan LKPD dengan sepenuh hati! ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
