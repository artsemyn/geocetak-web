// src/components/lkpd/common/LKPDHeader.tsx

import React from 'react';

interface LKPDHeaderProps {
  title: string;
  objectives: string[];
  estimatedMinutes?: number;
}

export const LKPDHeader: React.FC<LKPDHeaderProps> = ({ 
  title, 
  objectives,
  estimatedMinutes 
}) => {
  return (
    <div className="lkpd-header">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      
      {estimatedMinutes && (
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <span>⏱️</span>
          <span>Estimasi waktu: {estimatedMinutes} menit</span>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-blue-900">
          🎯 Tujuan Pembelajaran
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {objectives.map((objective, idx) => (
            <li key={idx} className="text-sm text-blue-800">
              {objective}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};