import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import { Calculator } from './features/calculator/Calculator';
import History from './features/history/History';
import Settings from './features/settings/Settings';
import FoodManager from './features/foods/FoodManager';
import { FamilyView } from './features/family/FamilyView';

import { useAIStore } from './store/useAIStore';
import { useCloudSync } from './hooks/useCloudSync';
import { AIReportOverlay } from './features/dashboard/AIReportOverlay';
import { FamilyManagementOverlay } from './features/family/FamilyManagementOverlay';
import { StoryViewer } from './features/dashboard/StoryViewer';
import { useHistoryStore } from './store/useHistoryStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';
import { INSIGHTS_DATA, InsightStory } from './data/insights_db';

function App() {
  // 어느 탭에 있어도 로그인 즉시 Firestore 동기화 시작
  useCloudSync();

  const [activeTab, setActiveTab] = useState('home');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAIReportOpen, setIsAIReportOpen] = useState(false);
  const [isFamilyMgmtOpen, setIsFamilyMgmtOpen] = useState(false);
  const [isInsightHubOpen, setIsInsightHubOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [viewingStories, setViewingStories] = useState<InsightStory[]>([]);

  const { logs } = useHistoryStore();
  const { insights } = useAIStore();
  const hubInsights = insights.length > 0 ? insights : INSIGHTS_DATA;

  const stats = {
    totalCarbs: (logs || []).reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0),
    totalInsulin: (logs || []).reduce((acc, curr) => acc + (curr.totalInsulin || 0), 0),
    avgBG: (logs || []).length > 0 ? Math.round((logs || []).reduce((acc, curr) => acc + curr.currentBG, 0) / (logs || []).length) : 0
  };
  const lastBG = (logs || []).length > 0 ? (logs || [])[(logs || []).length - 1].currentBG : null;

  // 오버레이 열릴 때 스크롤 차단
  useEffect(() => {
    if (isInsightHubOpen || isCalculatorOpen || isAIReportOpen || isFamilyMgmtOpen || selectedStoryIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isInsightHubOpen, isCalculatorOpen, isAIReportOpen, isFamilyMgmtOpen, selectedStoryIndex]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onOpenAIReport={() => setIsAIReportOpen(true)}
            onOpenStory={(index) => {
              setViewingStories(insights.length > 0 ? insights : INSIGHTS_DATA.slice(0, 4));
              setSelectedStoryIndex(index);
            }}
            onOpenInsightHub={() => setIsInsightHubOpen(true)}
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
            onOpenStory={(index) => {
              setViewingStories(insights.length > 0 ? insights : INSIGHTS_DATA.slice(0, 4));
              setSelectedStoryIndex(index);
            }}
            onOpenInsightHub={() => setIsInsightHubOpen(true)}
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

      {/* Overlays - 모두 최상위(App 루트)에서 관리하여 레이아웃 간섭 방지 */}

      {/* 1. 건강 인사이트 허브 리스트 오버레이 */}
      {isInsightHubOpen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden shadow-2xl w-full max-w-[500px] mx-auto border-x border-gray-100 animate-in slide-in-from-bottom duration-500">
          <div className="px-4 pt-6 pb-3 bg-white z-50 flex flex-col shrink-0 border-b border-gray-100 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-black text-text-main tracking-tight flex items-center gap-2">
                <span className="w-1 h-5 bg-brand-500 rounded-full shadow-lg shadow-brand-500/30"></span>
                건강 인사이트 허브
              </h3>
              <button
                onClick={() => setIsInsightHubOpen(false)}
                className="p-2 text-text-main bg-white border border-gray-100 rounded-xl active:scale-90 transition-all shadow-sm"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <p className="text-[13px] font-bold text-text-muted mb-4">
              총 {hubInsights.length}개의 전문 지식
            </p>
            {hubInsights.map((insight, index) => (
              <button
                key={`${insight.id}-${index}`}
                onClick={() => {
                  setViewingStories(hubInsights);
                  setSelectedStoryIndex(index);
                  setIsInsightHubOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm active:bg-gray-50 transition-all group"
              >
                <div className={twMerge("w-12 h-12 rounded-md flex items-center justify-center text-[22px] shrink-0", insight.color)}>
                  {typeof insight.icon === 'string' ? insight.icon : insight.icon}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">{insight.title}</span>
                  <h4 className="text-[15px] font-bold text-text-main truncate">
                    {insight.label}
                  </h4>
                  <p className="text-[12px] font-medium text-text-muted mt-0.5 truncate">
                    {insight.content.description}
                  </p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-gray-300" strokeWidth={3} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. 인슐린 계산기 */}
      {isCalculatorOpen && (
        <Calculator
          onClose={() => setIsCalculatorOpen(false)}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsCalculatorOpen(false);
          }}
        />
      )}

      {/* 3. AI 리포트 */}
      {isAIReportOpen && (
        <AIReportOverlay
          stats={stats}
          lastBG={lastBG}
          onClose={() => setIsAIReportOpen(false)}
        />
      )}

      {/* 4. 상세 아티클 뷰어 */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={viewingStories.length > 0 ? viewingStories : (insights.length > 0 ? insights : INSIGHTS_DATA.slice(0, 4))}
          initialIndex={selectedStoryIndex}
          onClose={() => {
            setSelectedStoryIndex(null);
            setViewingStories([]);
          }}
        />
      )}

      {/* 5. 가족 관리 */}
      {isFamilyMgmtOpen && (
        <FamilyManagementOverlay
          onClose={() => setIsFamilyMgmtOpen(false)}
        />
      )}
    </>
  );
}

export default App;
