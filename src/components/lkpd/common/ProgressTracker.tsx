// src/components/lkpd/common/ProgressTracker.tsx

import React from 'react';
import type { LKPDSection } from '../../../types/lkpd';

interface ProgressTrackerProps {
  sections: LKPDSection[];
  currentIndex: number;
  completedSections: number[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sections,
  currentIndex,
  completedSections
}) => {
  const progress = Math.round((completedSections.length / sections.length) * 100);
  
  return (
    <div className="progress-tracker mb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Progress</span>
          <span className="text-gray-600">
            {completedSections.length} / {sections.length} selesai
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Section dots */}
      <div className="flex items-center justify-between">
        {sections.map((section, idx) => {
          const isCompleted = completedSections.includes(idx);
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-300 text-gray-600' : ''}
                  ${!isCompleted && isCurrent ? 'bg-blue-500 text-white' : ''}
                `}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className="text-xs mt-1 text-center">
                {section.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};