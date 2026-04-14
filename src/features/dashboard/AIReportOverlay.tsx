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
    <div className="fixed top-0 bottom-0 left-0 right-0 mx-auto w-full max-w-[500px] z-[9999] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl border-x border-slate-50">
      {/* Premium Header */}
      <header className="p-6 flex items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <HugeiconsIcon icon={AiChat01Icon} size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[18px] font-black text-text-main">AI 정밀 분석 리포트</h3>
            <span className="text-[11px] font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md uppercase">Live Analytics</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-50 rounded-2xl active:scale-90 transition-all">
          <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-[15px] font-black text-text-sub">최근 7일간의 기록을 분석하고 있어요...</p>
            <p className="text-[12px] font-bold text-text-muted">당신에게 딱 맞는 맞춤 코칭을 준비 중입니다.</p>
          </div>
        ) : (
          <>
            {/* AI Generated Content */}
            <section className="bg-gradient-to-br from-slate-900 to-brand-900 rounded-[40px] p-8 text-left relative overflow-hidden shadow-premium">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={ZapIcon} size={18} className="text-brand-400" strokeWidth={3} />
                    <p className="text-brand-200 text-[14px] font-bold">AI 맞춤 종합 분석</p>
                  </div>
                  {/* 데이터 기간 안내 가이드 */}
                  {logs.length > 0 && (Date.now() - logs[logs.length - 1].timestamp < 7 * 24 * 60 * 60 * 1000) && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                      <HugeiconsIcon icon={InformationCircleIcon} size={12} className="text-brand-300" />
                      <span className="text-[10px] font-bold text-brand-200">정밀 분석까지 D-{Math.max(1, 7 - Math.floor((Date.now() - logs[logs.length-1].timestamp) / (24*60*60*1000)))}일</span>
                    </div>
                  )}
                </div>

                {/* 7일 미만일 경우 가이드 문구 노출 */}
                {logs.length > 0 && (Date.now() - logs[logs.length - 1].timestamp < 7 * 24 * 60 * 60 * 1000) && (
                  <div className="mb-4 p-3 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-start gap-2">
                    <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-brand-300 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-brand-100 leading-tight">
                      정밀한 종합 분석 리포트를 위해 최소 7일 이상의 데이터가 권장됩니다. 현재는 보유한 데이터를 기반으로 분석해 드리고 있어요!
                    </p>
                  </div>
                )}

                <div className="text-white text-[15px] font-bold leading-relaxed whitespace-pre-wrap">
                  {report}
                </div>
              </div>
            </section>

            {/* 기본 통계 (참고용) */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <span className="text-slate-500 text-[11px] block font-black uppercase mb-1">최근 평균 혈당</span>
                <span className="text-text-main text-[20px] font-black">{stats.avgBG} <span className="text-[12px]">mg/dL</span></span>
              </div>
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <span className="text-slate-500 text-[11px] block font-black uppercase mb-1">분석 대상 로그</span>
                <span className="text-text-main text-[20px] font-black">{logs.filter(l => l.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000).length} <span className="text-[12px]">개</span></span>
              </div>
            </section>

            <div className="flex gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-slate-400 shrink-0" />
              <p className="text-[11px] font-bold text-slate-400 leading-tight">
                본 리포트는 인공지능 분석 결과로, 의료적 판단의 참고 자료로만 활용하시기 바랍니다. 
                중요한 변경 사항은 전문가와 상담하세요.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Close Button Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-50 z-30">
        <button 
          onClick={onClose}
          className="w-full bg-brand-500 text-white py-5 rounded-3xl font-black text-[16px] shadow-lg shadow-brand-500/30 active:scale-95 transition-all"
        >
          리포트 확인 완료
        </button>
      </div>
    </div>
  );
};
