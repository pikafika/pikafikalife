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
      <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-4xl p-6 border border-rose-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <HugeiconsIcon icon={ZapIcon} size={80} />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <HugeiconsIcon icon={ZapIcon} size={16} color="white" strokeWidth={3} />
          </div>
          <h4 className="font-black text-[15px] text-rose-600">개발자 도구 : 데이터 시딩</h4>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white shadow-soft">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-[15px] leading-relaxed text-text-main font-bold">
              14일치 더미 데이터를 생성하시겠습니까?
            </span>
            <span className="text-[12px] text-text-sub font-medium">
              이 작업은 현재 가족 그룹에 테스트용 데이터를 추가합니다.
            </span>
          </div>
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 text-[12px] font-black text-rose-500 ml-auto bg-white px-4 py-2 rounded-xl shadow-sm border border-rose-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSeeding ? '생성 중...' : '지금 바로 생성하기'}
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
};
