import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Settings02Icon, 
  Settings01Icon,
  DatabaseIcon, 
  CloudDownloadIcon, 
  CloudUploadIcon, 
  InformationCircleIcon, 
  CheckmarkCircle02Icon, 
  AlertCircleIcon,
  FloppyDiskIcon,
  Refresh01Icon
} from '@hugeicons/core-free-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { SyncService } from '../../services/syncService';
import { LogService } from '../../services/logService';
import { exportData, importData } from '../../utils/backup';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { twMerge } from 'tailwind-merge';
import { isAdmin } from '../../utils/permissions';
import { SeedingCard } from '../../components/SeedingCard';

export default function Settings() {
  const { user, login, logout } = useAuthStore();
  const { settings, updateSettings } = useUserStore();
  const [formData, setFormData] = useState({
    icr: settings.icr,
    isf: settings.isf,
    targetBG: settings.targetBG,
    dia: settings.dia,
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const SAFE_RANGES = {
    icr:      { min: 1,  max: 100,  label: 'ICR(탄수화물 계수)',     unit: 'g/u' },
    isf:      { min: 1,  max: 500,  label: 'ISF(인슐린 민감도)',      unit: 'mg/dL' },
    targetBG: { min: 60, max: 200,  label: '목표 혈당',              unit: 'mg/dL' },
    dia:      { min: 1,  max: 8,    label: '인슐린 활성 시간(DIA)',   unit: '시간' },
  } as const;

  const handleSave = () => {
    for (const [key, range] of Object.entries(SAFE_RANGES)) {
      const val = formData[key as keyof typeof formData];
      if (val < range.min || val > range.max) {
        setStatus({
          type: 'error',
          message: `${range.label}은(는) ${range.min}~${range.max}${range.unit} 범위여야 합니다.`,
        });
        return;
      }
    }
    updateSettings(formData);
    setStatus({ type: 'success', message: '설정이 저장되었습니다.' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleExport = () => {
    exportData();
    setStatus({ type: 'success', message: '데이터 백업 파일이 생성되었습니다.' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        const newSettings = useUserStore.getState().settings;
        setFormData({
          icr: newSettings.icr,
          isf: newSettings.isf,
          targetBG: newSettings.targetBG,
          dia: newSettings.dia,
        });
        setStatus({ type: 'success', message: '데이터가 성공적으로 복구되었습니다.' });
      } else {
        setStatus({ type: 'error', message: '데이터 복구에 실패했습니다.' });
      }
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-32 pt-2">
      {/* 상태 메시지 */}
      {status.type && (
        <div className={twMerge(
          "mx-2 p-4 rounded-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 border",
          status.type === 'success' ? 'bg-brand-50 text-brand-600 border-brand-100' : 'bg-red-50 text-red-600 border-red-100'
        )}>
          <HugeiconsIcon icon={status.type === 'success' ? CheckmarkCircle02Icon : AlertCircleIcon} size={20} strokeWidth={2.5} />
          <span className="text-[13px] font-bold">{status.message}</span>
        </div>
      )}

      {/* 헤더 섹션 */}
      <section className="px-2 mb-2">
        <h2 className="text-[22px] font-bold text-text-main flex items-center gap-2">
          <HugeiconsIcon icon={Settings02Icon} size={24} className="text-brand-500" strokeWidth={2.5} />
          환경 설정
        </h2>
        <p className="text-[13px] text-text-muted mt-2 font-medium">
          더 정확한 인슐린 계산을 위해 개인 설정값을 유지해 주세요.
        </p>
      </section>

      {/* 계정 정보 그룹 */}
      <section className="bg-white rounded-lg shadow-lds border border-gray-100 mx-2 overflow-hidden mb-2">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <img src={user.photoURL || ''} alt="Profile" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
                <div>
                  <h4 className="text-[15px] font-bold text-text-main">{user.displayName}</h4>
                  <p className="text-[12px] font-medium text-text-sub">{user.email}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[20px]">
                  👤
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[15px] font-bold text-text-main">로그인이 필요합니다</h4>
                  <p className="text-[12px] font-medium text-text-sub">데이터 백업을 위해 로그인해주세요.</p>
                </div>
              </>
            )}
          </div>
          {user ? (
            <button onClick={logout} className="px-3 py-1.5 text-[12px] font-bold text-gray-500 bg-gray-100 rounded-sm hover:bg-gray-200 transition-all">로그아웃</button>
          ) : (
            <button onClick={login} className="px-4 py-2 bg-brand-500 text-white rounded-sm font-bold text-[12px] shadow-sm hover:bg-brand-600 transition-all">로그인</button>
          )}
        </div>
      </section>

      {/* 개인 설정 그룹 */}
      <section className="bg-white rounded-lg shadow-lds border border-gray-100 mx-2 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
          <HugeiconsIcon icon={Settings01Icon} size={18} className="text-brand-500" />
          <span className="text-[14px] font-bold text-text-main">계산 계수 설정</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* 탄수화물 계수 (ICR) */}
            <div className="space-y-2.5">
              <label className="flex items-center text-[13px] font-bold text-text-sub">
                탄수화물 계수 (ICR)
                <div className="group relative ml-1 cursor-help">
                  <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-gray-300" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-800 text-white text-[10px] rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed font-medium">
                    인슐린 1단위가 처리하는 탄수화물 양(g)입니다.
                  </div>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.icr}
                  onChange={(e) => setFormData({ ...formData, icr: Number(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-sm focus:bg-white focus:border-brand-500 focus:outline-none font-bold text-text-main transition-all text-base"
                  placeholder="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-text-muted">g/u</span>
              </div>
            </div>

            {/* 인슐린 민감도 (ISF) */}
            <div className="space-y-2.5">
              <label className="flex items-center text-[13px] font-bold text-text-sub">
                인슐린 민감도 (ISF)
                <div className="group relative ml-1 cursor-help">
                  <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-gray-300" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-800 text-white text-[10px] rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed font-medium">
                    인슐린 1단위가 낮추는 혈당량(mg/dL)입니다.
                  </div>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.isf}
                  onChange={(e) => setFormData({ ...formData, isf: Number(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-sm focus:bg-white focus:border-brand-500 focus:outline-none font-bold text-text-main transition-all text-base"
                  placeholder="50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-text-muted">mg/dL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 목표 혈당 (Target BG) */}
              <div className="space-y-2.5">
                <label className="flex items-center text-[13px] font-bold text-text-sub">
                  목표 혈당
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.targetBG}
                    onChange={(e) => setFormData({ ...formData, targetBG: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-sm focus:bg-white focus:border-brand-500 focus:outline-none font-bold text-text-main transition-all text-base"
                    placeholder="120"
                  />
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted">mg/dL</span>
                </div>
              </div>

              {/* 인슐린 활성 시간 (DIA) */}
              <div className="space-y-2.5">
                <label className="flex items-center text-[13px] font-bold text-text-sub">
                  활성 시간
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.dia}
                    step="0.5"
                    onChange={(e) => setFormData({ ...formData, dia: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-sm focus:bg-white focus:border-brand-500 focus:outline-none font-bold text-text-main transition-all text-base"
                    placeholder="4"
                  />
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted">시간</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full lds-button-primary py-4 text-[15px] flex items-center justify-center gap-2 mt-4"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} size={18} strokeWidth={2.5} />
            <span>설정 저장하기</span>
          </button>
        </div>
      </section>

      {/* 데이터 관리 그룹 */}
      <section className="bg-white rounded-lg shadow-lds border border-gray-100 mx-2 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
          <HugeiconsIcon icon={DatabaseIcon} size={18} className="text-brand-500" />
          <span className="text-[14px] font-bold text-text-main">데이터 관리</span>
        </div>

        <div className="p-6">
          <p className="text-[12px] text-text-muted font-medium mb-6 leading-relaxed">
            기록된 데이터를 백업 파일로 저장하거나, <br />이전에 저장한 데이터파일로부터 복구할 수 있습니다.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex flex-col items-center justify-center py-6 bg-white border border-gray-100 rounded-sm hover:bg-gray-50 transition-all gap-2 group"
            >
              <HugeiconsIcon icon={CloudDownloadIcon} size={24} className="text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-[13px] font-bold text-text-sub">데이터 백업</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-6 bg-white border border-gray-100 rounded-sm hover:bg-gray-50 transition-all gap-2 group"
            >
              <HugeiconsIcon icon={CloudUploadIcon} size={24} className="text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-[13px] font-bold text-text-sub">데이터 복구</span>
            </button>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
          accept=".json"
        />
      </section>

      {/* 관리자 도구 */}
      <SeedingCard />
    </div>
  );
}
