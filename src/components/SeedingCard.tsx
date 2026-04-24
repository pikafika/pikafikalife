import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { SyncService } from '../services/syncService';
import { HugeiconsIcon } from '@hugeicons/react';
import { ZapIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { isAdmin } from '../utils/permissions';

export const SeedingCard: React.FC = () => {
  const { user } = useAuthStore();
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isAdmin(user)) return null;

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      // familyId는 user.familyId가 없으면 getOrCreateFamily를 통해 가져옵니다 (SyncService 내부에서 처리)
      const familyId = `fam_${user.uid}`; 
      await SyncService.seed14DayDummyData(familyId);
      alert('더미 데이터 생성이 완료되었습니다.');
    } catch (error) {
      console.error(error);
      alert('데이터 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <section className="px-2 mb-8">
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 relative overflow-hidden group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center">
            <HugeiconsIcon icon={ZapIcon} size={16} color="white" strokeWidth={3} />
          </div>
          <h4 className="font-bold text-[15px] text-white">데이터 시딩 (개발자 전용)</h4>
        </div>
        <div className="bg-white/5 rounded-sm p-5 border border-white/10">
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[14px] leading-relaxed text-white font-bold">
              14일치 더미 데이터 생성
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-relaxed">
              테스트를 위한 가상 데이터를 현재 가족 그룹에 추가합니다.
            </span>
          </div>
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 py-3 rounded-sm transition-all disabled:opacity-50"
          >
            {isSeeding ? '데이터 생성 중...' : '지금 바로 생성하기'}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
};
