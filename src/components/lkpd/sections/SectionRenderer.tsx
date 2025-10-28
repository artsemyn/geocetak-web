// src/components/lkpd/sections/SectionRenderer.tsx

import React from 'react';
import type { LKPDSection, SectionResponse, LKPDSubmission } from '../../../types/lkpd';

interface SectionRendererProps {
  section: LKPDSection;
  sectionIndex: number;
  submission: LKPDSubmission;
  onSave: (sectionIndex: number, response: SectionResponse) => Promise<boolean>;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  sectionIndex,
  submission,
  onSave
}) => {
  // Get existing response for this section
  const existingResponse = submission.section_responses[`section_${sectionIndex}`];
  
  // Render different components based on section type
  switch (section.type) {
    case 'intro':
      return (
        <div className="intro-section prose max-w-none">
          <h2>{section.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
        </div>
      );
    
    case 'activity':
      return (
        <div className="activity-section">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          <div className="steps-list space-y-3">
            {section.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <p className="flex-1 pt-1">{step}</p>
              </div>
            ))}
          </div>
          
          {section.requires_3d && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm">
                💡 <strong>Petunjuk:</strong> Gunakan 3D viewer untuk mengikuti langkah-langkah di atas
              </p>
            </div>
          )}
          
          {/* TODO: Add data capture button (Day 2) */}
        </div>
      );
    
    case 'observation':
      return (
        <div className="observation-section">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          <p className="text-gray-600 mb-4">{section.instruction}</p>
          
          {/* TODO: Implement ObservationTable component (Day 2) */}
          <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">
              Tabel Pengamatan akan ditambahkan pada Hari 2
            </p>
          </div>
        </div>
      );
    
    case 'analysis':
      return (
        <div className="analysis-section">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          
          {/* TODO: Implement AnalysisQuestion components (Day 2) */}
          <div className="space-y-6">
            {section.questions.map((question, idx) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-2">
                  {idx + 1}. {question.question}
                </p>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Tuliskan jawabanmu di sini..."
                />
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'conclusion':
      return (
        <div className="conclusion-section">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          <p className="text-gray-700 mb-6">{section.prompt}</p>
          
          {/* TODO: Implement full conclusion form (Day 2) */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">
                Rumus yang kamu temukan:
              </label>
              <input 
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Contoh: L = πr²"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">
                Jelaskan bagaimana kamu menemukannya:
              </label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={6}
                placeholder="Ceritakan proses penemuanmu..."
              />
            </div>
          </div>
        </div>
      );
    
    default:
      return <div>Unknown section type</div>;
  }
};