import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  TargetIcon, 
  InformationCircleIcon, 
  AiChat01Icon,
  Analytics01Icon,
  ZapIcon
} from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';
import { getGeminiService } from '../../services/geminiService';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useAIStore } from '../../store/useAIStore';

interface AIReportOverlayProps {
  onClose: () => void;
  stats: {
    totalCarbs: number;
    totalInsulin: number;
    avgBG: number;
  };
  lastBG: number | null;
}

export const AIReportOverlay: React.FC<AIReportOverlayProps> = ({ onClose, stats, lastBG }) => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { logs } = useHistoryStore();
  const { coachingHistory, addCoachingHistory } = useAIStore();

  useEffect(() => {
    const fetchReport = async () => {
      const service = getGeminiService();
      if (!service) {
        setReport('Gemini API 키가 설정되지 않았거나 불러올 수 없습니다. .env 파일에 VITE_GEMINI_API_KEY가 있는지 확인해 주세요.');
        setIsLoading(false);
        return;
      }

      // 최근 7일치 데이터만 필터링
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentLogs = logs.filter(l => l.timestamp >= sevenDaysAgo);

      if (recentLogs.length === 0) {
        setReport('분석할 최근 7일간의 기록이 없습니다. 식사나 혈당 기록을 1개 이상 추가한 뒤 다시 시도해 주세요! 📝');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await service.generateCoachingReport(recentLogs, coachingHistory);
        setReport(result);
        addCoachingHistory(result); // 히스토리에 저장 (학습용)
      } catch (error: any) {
        let errorMessage = 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        
        if (error?.message?.includes('API_KEY_INVALID')) {
          errorMessage = '설정된 Gemini API 키가 유효하지 않습니다. 키 값을 다시 확인해 주세요.';
        } else if (error?.message?.includes('SAFETY')) {
          errorMessage = '보안 정책 내 가이드라인으로 인해 분석 결과를 생성할 수 없습니다.';
        }
        
        setReport(errorMessage);
        console.error('AI Analysis Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 mx-auto w-full max-w-[500px] z-[9999] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl border-x border-gray-100">
      {/* Header */}
      <header className="p-6 pt-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-brand-500 flex items-center justify-center">
            <HugeiconsIcon icon={AiChat01Icon} size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-text-main">AI 분석 리포트</h3>
            <span className="text-[10px] font-bold text-brand-500 border border-brand-100 px-2 py-0.5 rounded-sm uppercase tracking-wider">Live Analysis</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 border border-gray-100 rounded-md active:bg-gray-50 transition-all">
          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-3 border-gray-100 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-[14px] font-bold text-text-sub">데이터를 정밀하게 분석 중입니다...</p>
          </div>
        ) : (
          <>
            {/* AI Generated Content */}
            <section className="bg-gray-900 rounded-lg p-8 text-left relative overflow-hidden shadow-lds">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={ZapIcon} size={16} className="text-brand-500" strokeWidth={3} />
                    <p className="text-brand-300 text-[13px] font-bold uppercase tracking-wider">LDS AI Insight</p>
                  </div>
                  {/* 데이터 기간 안내 가이드 */}
                  {logs.length > 0 && (Date.now() - logs[logs.length - 1].timestamp < 7 * 24 * 60 * 60 * 1000) && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-sm border border-white/10">
                      <HugeiconsIcon icon={InformationCircleIcon} size={10} className="text-brand-400" />
                      <span className="text-[10px] font-bold text-brand-300 tracking-tight">분석 완성까지 D-{Math.max(1, 7 - Math.floor((Date.now() - logs[logs.length-1].timestamp) / (24*60*60*1000)))}</span>
                    </div>
                  )}
                </div>

                <div className="text-white text-[14px] font-medium leading-relaxed whitespace-pre-wrap">
                  {report}
                </div>
              </div>
            </section>

            {/* 기본 통계 */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-5 border border-gray-100">
                <span className="text-gray-400 text-[10px] block font-bold uppercase mb-1 tracking-wider">주간 평균 혈당</span>
                <span className="text-text-main text-[20px] font-bold">{stats.avgBG} <span className="text-[12px] font-medium">mg/dL</span></span>
              </div>
              <div className="bg-gray-50 rounded-md p-5 border border-gray-100">
                <span className="text-gray-400 text-[10px] block font-bold uppercase mb-1 tracking-wider">분석 로그 수</span>
                <span className="text-text-main text-[20px] font-bold">{logs.filter(l => l.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000).length} <span className="text-[12px] font-medium">건</span></span>
              </div>
            </section>

            <div className="flex gap-2 p-5 bg-gray-50 rounded-md border border-gray-100">
              <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                본 리포트는 의료적 판단의 참고 자료이며, 전문가 상담을 대체할 수 없습니다. 
                치료 계획 변경 시 반드시 전문의와 상의하십시오.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Button Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-30">
        <button 
          onClick={onClose}
          className="lds-button-primary w-full py-4.5 text-[15px]"
        >
          확인 완료
        </button>
      </div>
    </div>
  );
};
