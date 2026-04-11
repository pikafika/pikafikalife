import React, { useState, useRef } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { exportData, importData } from '../../utils/backup';
import { Save, Download, Upload, Info, CheckCircle2, AlertCircle, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
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

  const handleSave = () => {
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
        // 성공 시 페이지를 새로고침하거나 상태를 동기화합니다.
        // 스토어 상태가 바뀌었으므로, 현재 폼 데이터도 갱신합니다.
        const newSettings = useUserStore.getState().settings;
        setFormData({
          icr: newSettings.icr,
          isf: newSettings.isf,
          targetBG: newSettings.targetBG,
          dia: newSettings.dia,
        });
        setStatus({ type: 'success', message: '데이터가 성공적으로 복구되었습니다.' });
      } else {
        setStatus({ type: 'error', message: '데이터 복구에 실패했습니다. 올바른 파일인지 확인해 주세요.' });
      }
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상태 메시지 */}
      {status.type && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          status.type === 'success' ? 'bg-[#FAFAFB] text-blue-600 border border-blue-100' : 'bg-rose-50 text-rose-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{status.message}</span>
        </div>
      )}

      {/* 개인 설정 섹션 */}
      <section className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-6">
        <h2 className="text-[20px] font-black text-gray-900 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-gray-800" />
          개인 설정 ⚙️
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 탄수화물 계수 (ICR) */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-black text-slate-600">
              탄수화물 계수 (ICR)
              <div className="group relative ml-1 cursor-help">
                <Info className="w-4 h-4 text-slate-400" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  인슐린 1단위가 처리하는 탄수화물 양(g)입니다.
                </div>
              </div>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.icr}
                onChange={(e) => setFormData({ ...formData, icr: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-primary focus:outline-none font-bold text-slate-800 transition-all"
                placeholder="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">g/u</span>
            </div>
          </div>

          {/* 인슐린 민감도 (ISF) */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-black text-slate-600">
              인슐린 민감도 (ISF)
              <div className="group relative ml-1 cursor-help">
                <Info className="w-4 h-4 text-slate-400" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  인슐린 1단위가 낮추는 혈당량(mg/dL)입니다.
                </div>
              </div>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.isf}
                onChange={(e) => setFormData({ ...formData, isf: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-primary focus:outline-none font-bold text-slate-800 transition-all"
                placeholder="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">mg/dL</span>
            </div>
          </div>

          {/* 목표 혈당 (Target BG) */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-black text-slate-600">
              목표 혈당
              <div className="group relative ml-1 cursor-help">
                <Info className="w-4 h-4 text-slate-400" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  교정 계산 시 목표로 하는 혈당값입니다.
                </div>
              </div>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.targetBG}
                onChange={(e) => setFormData({ ...formData, targetBG: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-primary focus:outline-none font-bold text-slate-800 transition-all"
                placeholder="120"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">mg/dL</span>
            </div>
          </div>

          {/* 인슐린 활성 시간 (DIA) */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-black text-slate-600">
              인슐린 활성 시간 (DIA)
              <div className="group relative ml-1 cursor-help">
                <Info className="w-4 h-4 text-slate-400" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  투여된 인슐린이 체내에서 효과를 내는 시간(시간)입니다.
                </div>
              </div>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.dia}
                step="0.5"
                onChange={(e) => setFormData({ ...formData, dia: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#FAFAFB] border-2 border-slate-100 rounded-2xl focus:border-primary focus:outline-none font-bold text-slate-800 transition-all"
                placeholder="4"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">시간</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#3182F6] text-white py-[18px] rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <Save className="w-5 h-5" />
          <span>설정 저장하기</span>
        </button>
      </section>

      {/* 백업 및 복구 섹션 */}
      <section className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-6">
        <h2 className="text-[20px] font-black text-gray-900 flex items-center">
          <Download className="w-6 h-6 mr-2 text-gray-800" />
          데이터 관리 📦
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          투여 기록과 개인 설정을 백업하여 기기를 바꾸거나 재설치 시에도 안전하게 복구할 수 있습니다.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center py-8 bg-[#FAFAFB] border border-slate-100 rounded-2xl cursor-pointer active:scale-95 transition-all space-y-2 group"
          >
            <Download className="w-8 h-8 text-[#3182F6]" />
            <span className="text-[14px] font-bold text-gray-700">백업 만들기</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center py-8 bg-[#FAFAFB] border border-slate-100 rounded-2xl cursor-pointer active:scale-95 transition-all space-y-2 group"
          >
            <Upload className="w-8 h-8 text-[#3182F6]" />
            <span className="text-[14px] font-bold text-gray-700">데이터 복구</span>
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
          accept=".json"
        />
      </section>
    </div>
  );
}
