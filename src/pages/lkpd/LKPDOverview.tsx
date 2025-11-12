// src/components/lkpd/LKPDOverview.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LKPDData } from '../../types/lkpd.types';

interface StageCardProps {
  stage: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  title,
  description,
  isCompleted,
  isCurrent,
  onClick,
}) => {
  const stageIcons = ['🎯', '💡', '📐', '🏗️', '🧪', '💭'];
  const icon = stageIcons[stage - 1] || '📋';

  return (
    <button
      onClick={onClick}
      className={`
        w-full max-w-xs p-6 rounded-lg border-2 transition-all duration-200
        ${isCurrent 
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
          : isCompleted
          ? 'border-green-500 bg-green-50 hover:shadow-md'
          : 'border-gray-300 bg-white hover:shadow-md hover:border-gray-400'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="text-left flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">TAHAP {stage}</h3>
            {isCompleted && <span className="text-green-600 font-bold">✓</span>}
            {isCurrent && <span className="text-blue-600 font-bold">→</span>}
          </div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

interface LKPDOverviewProps {
  data?: LKPDData;
  onSelectStage?: (stage: number) => void;
}

export const LKPDOverview: React.FC<LKPDOverviewProps> = ({ 
  data, 
  onSelectStage 
}) => {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [projectData, setProjectData] = useState<LKPDData | null>(data || null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (!data) {
      // Load project data from localStorage or API
      const storedData = localStorage.getItem(`lkpd_${assignmentId}`);
      if (storedData) {
        try {
          setProjectData(JSON.parse(storedData));
        } catch (error) {
          console.error('Error loading project data:', error);
        }
      }
      setLoading(false);
    }
  }, [assignmentId, data]);

  const completedStages = projectData ? Object.keys(projectData).filter(
    key => key.startsWith('stage') && (projectData[key as keyof LKPDData] as any)?.completed_at
  ).length : 0;

  const currentStage = projectData?.project.current_stage || 1;
  const totalStages = 6;
  const progressPercent = Math.round((completedStages / totalStages) * 100);

  const stages = [
    {
      stage: 1,
      title: 'Define Problem',
      description: 'Tentukan proyek dan tujuanmu',
    },
    {
      stage: 2,
      title: 'Imagine',
      description: 'Visualisasikan ide desainmu',
    },
    {
      stage: 3,
      title: 'Plan & Design',
      description: 'Buat model 3D di Tinkercad',
    },
    {
      stage: 4,
      title: 'Create/Build',
      description: 'Upload file STL hasil design',
    },
    {
      stage: 5,
      title: 'Test & Observe',
      description: 'Analisis dan uji desainmu',
    },
    {
      stage: 6,
      title: 'Share & Reflect',
      description: 'Refleksi pembelajaran',
    },
  ];

  const handleStageClick = (stage: number) => {
    if (onSelectStage) {
      onSelectStage(stage);
    } else {
      // Navigate to the stage
      navigate(`/lkpd/${assignmentId}/stage/${stage}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            ← Kembali ke Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            OVERVIEW: 6 TAHAPAN LKPD
          </h1>
          <p className="text-gray-600">
            {projectData?.project.title || 'Proyek Pembelajaran'}
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Kemajuan Proyek</h2>
          
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {completedStages}/{totalStages} Selesai
              </span>
              <span className="text-sm font-bold text-gray-700">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stage indicators */}
          <div className="flex justify-between items-center gap-2">
            {stages.map((s) => {
              const isCompleted = projectData?.project.current_stage! > s.stage ||
                (projectData?.[`stage${s.stage}` as keyof LKPDData] as any)?.completed_at;
              const isCurrent = currentStage === s.stage;
              
              return (
                <div key={s.stage} className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                      transition-all duration-200
                      ${isCurrent 
                        ? 'bg-blue-500 ring-2 ring-blue-300 ring-offset-2' 
                        : isCompleted 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : s.stage}
                  </div>
                  <span className="text-xs text-center mt-1 font-medium text-gray-700">
                    T{s.stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stages Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-6 text-gray-800">
            Pilih tahap yang ingin dikerjakan:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.map((s) => {
              const isCompleted = projectData?.project.current_stage! > s.stage ||
                (projectData?.[`stage${s.stage}` as keyof LKPDData] as any)?.completed_at;
              const isCurrent = currentStage === s.stage;

              return (
                <StageCard
                  key={s.stage}
                  stage={s.stage}
                  title={s.title}
                  description={s.description}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  onClick={() => handleStageClick(s.stage)}
                />
              );
            })}
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">📊 Ringkasan Proyek</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">6</p>
              <p className="text-sm text-gray-600">Total Tahapan</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedStages}</p>
              <p className="text-sm text-gray-600">Selesai</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{totalStages - completedStages}</p>
              <p className="text-sm text-gray-600">Tersisa</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{progressPercent}%</p>
              <p className="text-sm text-gray-600">Progres</p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <p className="text-sm text-amber-800">
            <strong>💡 Tips:</strong> Kerjakan tahapan secara berurutan untuk hasil terbaik. 
            Setiap tahapan akan tersimpan otomatis saat kamu pindah ke tahapan berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LKPDOverview;
