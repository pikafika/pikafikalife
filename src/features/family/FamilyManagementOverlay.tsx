import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  UserGroupIcon, 
  Copy01Icon, 
  Link01Icon,
  CheckmarkBadge01Icon,
  HelpCircleIcon
} from '@hugeicons/core-free-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../services/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface FamilyManagementOverlayProps {
  onClose: () => void;
}

export const FamilyManagementOverlay: React.FC<FamilyManagementOverlayProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const [familyData, setFamilyData] = useState<any>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    let unsubscribeFamily: (() => void) | null = null;

    // 1. 먼저 사용자의 familyId를 감시
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (userDoc: any) => {
      if (userDoc.exists() && userDoc.data().familyId) {
        const familyId = userDoc.data().familyId;
        
        // 2. familyId가 확인되면 해당 가족 그룹 정보를 실시간으로 감시
        if (unsubscribeFamily) unsubscribeFamily();
        unsubscribeFamily = onSnapshot(doc(db, 'families', familyId), (famDoc: any) => {
          if (famDoc.exists()) {
            setFamilyData(famDoc.data());
          }
          setLoading(false);
        }, (err: any) => {
          console.error("Family fetch error:", err);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }, (err: any) => {
      console.error("User doc fetch error:", err);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      if (unsubscribeFamily) unsubscribeFamily();
    };
  }, [user]);

  const handleCopyCode = () => {
    if (familyData?.inviteCode) {
      try {
        navigator.clipboard.writeText(familyData.inviteCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
        alert("코드 복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
      }
    } else {
      alert("공유 가능한 코드가 아직 생성되지 않았습니다.");
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 mx-auto w-full max-w-[500px] z-[9999] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl border-x border-slate-50">
      <header className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-white">
            <HugeiconsIcon icon={UserGroupIcon} size={20} strokeWidth={2.5} />
          </div>
          <h3 className="text-[18px] font-black text-text-main">가족 연결 관리</h3>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-50 rounded-2xl">
          <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 내 가족 코드 섹션 */}
        <section className="bg-slate-50 rounded-[40px] p-8 text-center border border-slate-100">
          <h4 className="text-[15px] font-black text-text-main mb-2">나의 가족 참여 코드</h4>
          <p className="text-[12px] font-bold text-text-muted mb-6">다른 가족에게 이 코드를 공유하여 <br /> 실시간으로 기록을 함께 보세요.</p>
          
          <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-brand-200 relative group min-h-[100px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[12px] font-bold text-brand-300">연결 확인 중...</span>
              </div>
            ) : (
              <span className="text-[32px] font-black text-brand-500 tracking-widest">
                {familyData?.inviteCode || 'GENERATING'}
              </span>
            )}
            {!loading && (
              <button 
                onClick={handleCopyCode}
                className="absolute -right-3 -bottom-3 w-12 h-12 bg-brand-500 rounded-2xl shadow-lg flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <HugeiconsIcon icon={isCopied ? CheckmarkBadge01Icon : Copy01Icon} size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
          {isCopied && <p className="text-brand-500 text-[11px] font-bold mt-4 animate-bounce">코드가 복사되었습니다!</p>}
        </section>

        {/* 코드 입력하여 참여하기 */}
        <section className="space-y-4">
          <h4 className="text-[16px] font-black text-text-main flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} size={18} className="text-brand-500" />
            초대 코드로 가족 참여하기
          </h4>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="6자리 코드를 입력하세요"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-text-main placeholder:text-slate-300 focus:border-brand-500 outline-none transition-all uppercase tracking-widest"
              maxLength={6}
            />
            <button className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[14px] active:scale-95 transition-all">
              참여
            </button>
          </div>
        </section>

        {/* 도움말 */}
        <div className="bg-soft-blue/30 rounded-3xl p-5 flex gap-3 border border-brand-100/50">
          <HugeiconsIcon icon={HelpCircleIcon} size={18} className="text-brand-500 shrink-0 mt-0.5" />
          <p className="text-[12px] font-bold text-brand-600 leading-tight">
            참여 코드를 통해 가족으로 연결되면 모든 혈당 및 식단 기록이 실시간으로 공유됩니다. 언제든 관리 페이지에서 연결을 해제할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="p-6 border-t border-slate-50">
        <button 
          onClick={onClose}
          className="w-full bg-brand-500 text-white py-5 rounded-3xl font-black text-[16px] shadow-lg shadow-brand-500/30"
        >
          설정 완료
        </button>
      </div>
    </div>
  );
};
