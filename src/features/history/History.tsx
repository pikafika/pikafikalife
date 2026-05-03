import React, { useState } from 'react';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useCustomFoodStore } from '../../store/useCustomFoodStore';
import { FOOD_DB } from '../../data/food_db';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Calendar01Icon, 
  Clock01Icon, 
  DropletIcon, 
  Calculator01Icon, 
  InformationCircleIcon, 
  Delete02Icon, 
  ArrowDown01Icon, 
  ArrowUp01Icon,
  StickyNote01Icon
} from '@hugeicons/core-free-icons';
import { LogEntry } from '../../types';
import { twMerge } from 'tailwind-merge';

export default function History() {
  const { logs, removeLog, updateLog } = useHistoryStore();
  const { customFoods } = useCustomFoodStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [tempMemo, setTempMemo] = useState('');

  // 날짜별 그룹화
  const groupedLogs = logs.reduce((acc: Record<string, LogEntry[]>, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const startEditMemo = (log: LogEntry) => {
    setEditingMemoId(log.id);
    setTempMemo(log.memo);
  };

  const saveMemo = (id: string) => {
    updateLog(id, { memo: tempMemo });
    setEditingMemoId(null);
  };

  const getFoodName = (entry: { foodId: string; name?: string; emoji?: string }) => {
    const dbFood = FOOD_DB.find(f => f.id === entry.foodId);
    if (dbFood) return `${dbFood.emoji} ${dbFood.name}`;
    const customFood = customFoods.find(f => f.id === entry.foodId);
    if (customFood) return `${customFood.emoji} ${customFood.name}`;
    if (entry.name) return `${entry.emoji || '🍴'} ${entry.name}`;
    return '알 수 없는 음식';
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
          <HugeiconsIcon icon={Calendar01Icon} size={28} className="text-gray-300" />
        </div>
        <p className="text-gray-400 text-[14px] font-medium tracking-tight">아직 기록된 내용이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 pb-32 pt-2">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => {
        const dailyCarbs = dateLogs.reduce((sum, log) => sum + log.totalCarbs, 0);
        const dailyInsulin = dateLogs.reduce((sum, log) => sum + log.totalInsulin, 0);
        const avgBG = Math.round(dateLogs.reduce((sum, log) => sum + log.currentBG, 0) / dateLogs.length);

        return (
          <div key={date} className="space-y-6">
            <div className="flex flex-col gap-3 px-2">
              <h3 className="text-[14px] font-bold text-text-main flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-brand-500" strokeWidth={2.5} />
                {date}
              </h3>
              
              {/* 일간 요약 서머리 카드 */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">총 탄수화물</span>
                  <span className="text-[16px] font-bold text-text-main">{dailyCarbs}<span className="text-[11px] font-medium text-text-muted ml-0.5">g</span></span>
                </div>
                <div className="flex flex-col items-center border-l border-r border-gray-200">
                  <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">총 인슐린</span>
                  <span className="text-[16px] font-bold text-text-main">{dailyInsulin.toFixed(1)}<span className="text-[11px] font-medium text-text-muted ml-0.5">u</span></span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">평균 혈당</span>
                  <span className="text-[16px] font-bold text-text-main">{avgBG || 0}<span className="text-[11px] font-medium text-text-muted ml-0.5">mg/dL</span></span>
                </div>
              </div>
            </div>
            
            <div className="relative border-l-2 border-gray-100 ml-6 space-y-5 pb-2">
              {dateLogs.map((log) => (
                <div key={log.id} className="relative pl-6 pr-2">
                  {/* 타임라인 노드 (점) */}
                  <div className="absolute top-6 -left-[9px] w-4 h-4 rounded-full border-4 border-white bg-brand-500 shadow-sm z-10" />
                  
                  <div 
                    className={twMerge(
                      "bg-white rounded-lg border border-gray-100 transition-all overflow-hidden relative group",
                      expandedId === log.id ? "shadow-lds border-brand-200" : "shadow-sm hover:border-brand-100"
                    )}
                  >
                    {/* 요약 헤더 */}
                <div 
                  className={twMerge(
                    "p-5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors",
                    expandedId === log.id && "bg-gray-50/50"
                  )}
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">시간</span>
                      <span className="text-[15px] font-bold text-text-main">
                        {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    
                    <div className="h-8 w-px bg-gray-100" />
                    
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">혈당</span>
                        <span className={twMerge(
                          "text-[15px] font-bold",
                          log.currentBG > 180 ? 'text-red-500' : log.currentBG < 70 ? 'text-amber-500' : 'text-brand-500'
                        )}>
                          {log.currentBG} <span className="text-[12px] font-medium opacity-70">mg/dL</span>
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">인슐린</span>
                        <span className="text-[15px] font-bold text-text-main">
                          {log.totalInsulin.toFixed(1)} <span className="text-[12px] font-medium opacity-70 text-text-muted">u</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-400">
                    <HugeiconsIcon icon={expandedId === log.id ? ArrowUp01Icon : ArrowDown01Icon} size={20} />
                  </div>
                </div>

                {/* 상세 내용 (확장 시) */}
                {expandedId === log.id && (
                  <div className="px-5 pb-5 space-y-6 animate-in slide-in-from-top-2 duration-200 border-t border-gray-50 pt-5">
                    {/* 투여 요약 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <div className="flex items-center text-[10px] font-bold text-text-sub mb-1.5 gap-1.5">
                          <HugeiconsIcon icon={Calculator01Icon} size={12} className="text-brand-500" /> 
                          식사 인슐린
                        </div>
                        <div className="text-[16px] font-bold text-text-main leading-none">{log.mealInsulin.toFixed(1)} <span className="text-[12px] font-medium text-text-muted">u</span></div>
                        <div className="text-[11px] text-text-muted font-medium mt-1.5">탄수화물 {log.totalCarbs}g</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <div className="flex items-center text-[10px] font-bold text-text-sub mb-1.5 gap-1.5">
                          <HugeiconsIcon icon={DropletIcon} size={12} className="text-brand-500" /> 
                          교정 인슐린
                        </div>
                        <div className="text-[16px] font-bold text-text-main leading-none">{log.corrInsulin.toFixed(1)} <span className="text-[12px] font-medium text-text-muted">u</span></div>
                        <div className="text-[11px] text-text-muted font-medium mt-1.5">IOB {log.iobAtTime.toFixed(1)} u</div>
                      </div>
                    </div>

                    {/* 음식 목록 */}
                    {log.foods.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[12px] font-bold text-text-sub flex items-center gap-1.5">
                          <HugeiconsIcon icon={Calculator01Icon} size={14} className="text-gray-400" /> 섭취 음식
                        </h4>
                        <div className="flex flex-wrap gap-2 text-wrap">
                          {log.foods.map((f, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-brand-50 text-brand-600 text-[13px] font-bold rounded-sm border border-brand-100">
                              {getFoodName(f)} {f.amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 메모 영역 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-bold text-text-sub flex items-center gap-1.5">
                          <HugeiconsIcon icon={StickyNote01Icon} size={14} className="text-gray-400" /> 상세 메모
                        </h4>
                        {editingMemoId !== log.id && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); startEditMemo(log); }}
                            className="text-[11px] font-bold text-brand-500 hover:underline"
                          >
                            수정하기
                          </button>
                        )}
                      </div>
                      
                      {editingMemoId === log.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={tempMemo}
                            onChange={(e) => setTempMemo(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-transparent rounded-sm text-[14px] focus:bg-white focus:border-brand-500 focus:outline-none transition-all font-medium min-h-[80px]"
                            placeholder="메모를 입력하세요..."
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingMemoId(null)}
                              className="px-4 py-2 text-[12px] font-bold text-text-muted hover:bg-gray-100 rounded-sm transition-colors"
                            >
                              취소
                            </button>
                            <button 
                              onClick={() => saveMemo(log.id)}
                              className="px-5 py-2 text-[12px] font-bold text-white bg-brand-500 rounded-sm shadow-sm"
                            >
                              저장하기
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[14px] font-medium text-text-sub leading-relaxed bg-gray-50 p-4 rounded-sm border border-gray-100 min-h-[50px]">
                          {log.memo || '입력된 상세 정보가 없습니다.'}
                        </p>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('이 기록을 정말 삭제할까요?')) {
                            removeLog(log.id);
                          }
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 hover:text-red-600 transition-all"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                        <span>기록 삭제</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
