import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import { Calculator } from './features/calculator/Calculator';
import History from './features/history/History';
import Settings from './features/settings/Settings';
import FoodManager from './features/foods/FoodManager';
import { FamilyView } from './features/family/FamilyView';

import { useAIStore } from './store/useAIStore';
import { AIReportOverlay } from './features/dashboard/AIReportOverlay';
import { FamilyManagementOverlay } from './features/family/FamilyManagementOverlay';
import { StoryViewer } from './features/dashboard/StoryViewer';
import { useHistoryStore } from './store/useHistoryStore';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAIReportOpen, setIsAIReportOpen] = useState(false);
  const [isFamilyMgmtOpen, setIsFamilyMgmtOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const { logs } = useHistoryStore();
  const { insights } = useAIStore();

  const stats = {
    totalCarbs: logs.reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0),
    totalInsulin: logs.reduce((acc, curr) => acc + (curr.totalInsulin || 0), 0),
    avgBG: logs.length > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.currentBG, 0) / logs.length) : 0
  };
  const lastBG = logs.length > 0 ? logs[logs.length - 1].currentBG : null;

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onOpenAIReport={() => setIsAIReportOpen(true)}
            onOpenStory={(index) => setSelectedStoryIndex(index)}
            onOpenFamilyMgmt={() => setIsFamilyMgmtOpen(true)}
          />
        );
      case 'history':
        return <History />;
      case 'family':
        return <FamilyView />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            onOpenAIReport={() => setIsAIReportOpen(true)}
            onOpenStory={(index) => setSelectedStoryIndex(index)}
            onOpenFamilyMgmt={() => setIsFamilyMgmtOpen(true)}
          />
        );
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      >
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </Layout>

      {/* Overlays - 모두 최상위에서 관리 */}
      {isCalculatorOpen && (
        <Calculator
          onClose={() => setIsCalculatorOpen(false)}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsCalculatorOpen(false);
          }}
        />
      )}

      {isAIReportOpen && (
        <AIReportOverlay
          stats={stats}
          lastBG={lastBG}
          onClose={() => setIsAIReportOpen(false)}
        />
      )}

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={insights}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {isFamilyMgmtOpen && (
        <FamilyManagementOverlay
          onClose={() => setIsFamilyMgmtOpen(false)}
        />
      )}
    </>
  );
}

export default App;
