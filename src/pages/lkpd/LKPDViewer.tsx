// src/pages/lkpd/LKPDViewer.tsx
import { useState, useEffect } from 'react';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import { LKPDOverview } from './LKPDOverview';
import { Stage1Define } from './Stage1Define';
import { Stage2Imagine } from './Stage2Imagine';
import { Stage3Design } from './Stage3Design';
import { Stage4Build } from './Stage4Build';
import { Stage5Test } from './Stage5Test';
import { Stage6Reflect } from './Stage6Reflect';
import { SuccessPage } from './SuccessPage';
type ViewType = 'overview' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'stage6' | 'success';

export default function LKPDViewer() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const { lkpdData, initializeProject } = useLKPDSection();

  useEffect(() => {
    // Redirect to dashboard on mount (when user tries to access dashboard view)
    if (currentView === 'overview' && !lkpdData) {
      initializeProject();
    }
  }, [currentView, lkpdData, initializeProject]);

  const renderView = () => {
    switch (currentView) {
      
      case 'overview':
        return (
          <LKPDOverview
            onSelectStage={(stage) => setCurrentView(`stage${stage}` as ViewType)}
          />
        );
      
      case 'stage1':
        return (
          <Stage1Define
            onBack={() => setCurrentView('overview')}
            onNext={() => setCurrentView('stage2')}
          />
        );
      
      case 'stage2':
        return (
          <Stage2Imagine
            onBack={() => setCurrentView('overview')}
            onNext={() => setCurrentView('stage3')}
          />
        );
      
      case 'stage3':
        return (
          <Stage3Design
            onBack={() => setCurrentView('overview')}
            onNext={() => setCurrentView('stage4')}
          />
        );
      
      case 'stage4':
        return (
          <Stage4Build
            onBack={() => setCurrentView('overview')}
            onNext={() => setCurrentView('stage5')}
          />
        );
      
      case 'stage5':
        return (
          <Stage5Test
            onBack={() => setCurrentView('overview')}
            onNext={() => setCurrentView('stage6')}
          />
        );
      case 'stage6':
        return (
          <Stage6Reflect
            onBack={() => setCurrentView('overview')}
            onComplete={() => setCurrentView('success')}
          />
        );
      case 'success':
        return <SuccessPage />;
      
      default:
        return (
          <LKPDOverview
            onSelectStage={(stage) => setCurrentView(`stage${stage}` as ViewType)}
          />
        );
    }
  };

  return <div>{renderView()}</div>;
}