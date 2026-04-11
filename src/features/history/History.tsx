import React, { useState } from 'react';
import { useHistoryStore } from '../../store/useHistoryStore';
import { FOOD_DB } from '../../data/food_db';
import { Trash2, Edit3, ChevronDown, ChevronUp, Calendar, Clock, Droplets, Utensils, Info } from 'lucide-react';
import { LogEntry } from '../../types';

export default function History() {
  const { logs, removeLog, updateLog } = useHistoryStore();
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

  const getFoodName = (foodId: string) => {
    const food = FOOD_DB.find(f => f.id === foodId);
    return food ? `${food.emoji} ${food.name}` : '알 수 없는 음식';
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-slate-300" />
        </div>
        <p className="text-slate-400 font-bold">아직 기록된 내용이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center space-x-2 px-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-slate-500">{date}</h3>
          </div>
          
          <div className="space-y-3">
            {dateLogs.map((log) => (
              <div 
                key={log.id} 
                className={`bg-white rounded-3xl p-1 mb-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all overflow-hidden ${
                  expandedId === log.id ? 'ring-2 ring-[#3182F6]/20' : ''
                }`}
              >
                {/* 요약 헤더 */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer active:bg-[#FAFAFB]"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <span className="text-[10px] font-black text-slate-400 block uppercase">시간</span>
                      <span className="text-sm font-bold text-slate-700">
                        {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-100" />
                    
                    <div className="flex space-x-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">혈당</span>
                        <span className={`text-sm font-black ${log.currentBG > 180 ? 'text-rose-500' : log.currentBG < 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {log.currentBG} <span className="text-[10px] font-bold">mg/dL</span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">인슐린</span>
                        <span className="text-sm font-black text-primary">
                          {log.totalInsulin.toFixed(1)} <span className="text-[10px] font-bold">u</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-slate-400">
                    {expandedId === log.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* 상세 내용 (확장 시) */}
                {expandedId === log.id && (
                  <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-[#FAFAFB] w-full" />
                    
                    {/* 투여 요약 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#FAFAFB] p-3 rounded-2xl">
                        <div className="flex items-center text-[10px] font-black text-slate-400 mb-1">
                          <Utensils className="w-3 h-3 mr-1" /> 식사 인슐린
                        </div>
                        <div className="text-sm font-bold text-slate-700">{log.mealInsulin.toFixed(1)} u</div>
                        <div className="text-[10px] text-slate-400 font-medium">탄수화물 {log.totalCarbs}g</div>
                      </div>
                      <div className="bg-[#FAFAFB] p-3 rounded-2xl">
                        <div className="flex items-center text-[10px] font-black text-slate-400 mb-1">
                          <Droplets className="w-3 h-3 mr-1" /> 교정 인슐린
                        </div>
                        <div className="text-sm font-bold text-slate-700">{log.corrInsulin.toFixed(1)} u</div>
                        <div className="text-[10px] text-slate-400 font-medium">IOB {log.iobAtTime.toFixed(1)} u</div>
                      </div>
                    </div>

                    {/* 음식 목록 */}
                    {log.foods.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[12px] font-bold text-gray-500 flex items-center">
                          <Utensils className="w-3.5 h-3.5 mr-1" /> 섭취 음식
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {log.foods.map((f, idx) => (
                            <span key={idx} className="px-3 py-1 bg-[#3182F6]/5 text-[#3182F6] text-sm font-bold rounded-full border border-[#3182F6]/10">
                              {getFoodName(f.foodId)} {f.amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 메모 영역 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-slate-400 flex items-center">
                          <Info className="w-3 h-3 mr-1" /> 메모
                        </h4>
                        {editingMemoId !== log.id && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); startEditMemo(log); }}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            수정하기
                          </button>
                        )}
                      </div>
                      
                      {editingMemoId === log.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempMemo}
                            onChange={(e) => setTempMemo(e.target.value)}
                            className="w-full p-3 bg-[#FAFAFB] border-2 border-primary/20 rounded-2xl text-sm focus:outline-none focus:border-primary transition-all font-medium"
                            rows={2}
                            placeholder="메모를 입력하세요..."
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setEditingMemoId(null)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              취소
                            </button>
                            <button 
                              onClick={() => saveMemo(log.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg shadow-sm"
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-600 italic bg-[#FAFAFB]/50 p-3 rounded-2xl border border-slate-50">
                          {log.memo || '입력된 메모가 없습니다.'}
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
                        className="flex items-center space-x-1 text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>기록 삭제</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
