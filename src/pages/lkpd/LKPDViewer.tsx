// src/pages/lkpd/LKPDViewer.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const { lkpdData, initializeProject } = useLKPDSection();

  useEffect(() => {
    // Redirect to dashboard on mount (when user tries to access dashboard view)
    if (currentView === 'overview' && !lkpdData) {
      initializeProject();
    }
  }, [currentView, lkpdData, initializeProject]);

  // Check if stage is unlocked
  const isStageUnlocked = (stage: number): boolean => {
    if (stage === 1) return true; // Stage 1 always unlocked

    const prevStage = stage - 1;
    const prevStageData = lkpdData?.[`stage${prevStage}` as keyof typeof lkpdData];
    return !!(prevStageData as any)?.completed_at;
  };

  // Route guard for stage navigation
  const navigateToStage = (stage: number, viewName: ViewType) => {
    if (!isStageUnlocked(stage)) {
      alert(`Selesaikan Tahap ${stage - 1} terlebih dahulu untuk membuka Tahap ${stage}`);
      setCurrentView('overview');
      return;
    }
    setCurrentView(viewName);
  };

  const renderView = () => {
    switch (currentView) {

      case 'overview':
        return (
          <LKPDOverview
            data={lkpdData || undefined}
            onSelectStage={(stage) => navigateToStage(stage, `stage${stage}` as ViewType)}
          />
        );

      case 'stage1':
        return (
          <Stage1Define
            onBack={() => setCurrentView('overview')}
            onNext={() => navigateToStage(2, 'stage2')}
          />
        );

      case 'stage2':
        if (!isStageUnlocked(2)) {
          setCurrentView('overview');
          return null;
        }
        return (
          <Stage2Imagine
            onBack={() => setCurrentView('overview')}
            onNext={() => navigateToStage(3, 'stage3')}
          />
        );

      case 'stage3':
        if (!isStageUnlocked(3)) {
          setCurrentView('overview');
          return null;
        }
        return (
          <Stage3Design
            onBack={() => setCurrentView('overview')}
            onNext={() => navigateToStage(4, 'stage4')}
          />
        );

      case 'stage4':
        if (!isStageUnlocked(4)) {
          setCurrentView('overview');
          return null;
        }
        return (
          <Stage4Build
            onBack={() => setCurrentView('overview')}
            onNext={() => navigateToStage(5, 'stage5')}
          />
        );

      case 'stage5':
        if (!isStageUnlocked(5)) {
          setCurrentView('overview');
          return null;
        }
        return (
          <Stage5Test
            onBack={() => setCurrentView('overview')}
            onNext={() => navigateToStage(6, 'stage6')}
          />
        );

      case 'stage6':
        if (!isStageUnlocked(6)) {
          setCurrentView('overview');
          return null;
        }
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
            data={lkpdData || undefined}
            onSelectStage={(stage) => navigateToStage(stage, `stage${stage}` as ViewType)}
          />
        );
    }
  };

  return <div>{renderView()}</div>;
}
