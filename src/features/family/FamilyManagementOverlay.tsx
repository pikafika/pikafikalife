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
import { doc, onSnapshot } from 'firebase/firestore';

interface FamilyManagementOverlayProps {
  onClose: () => void;
}

export const FamilyManagementOverlay: React.FC<FamilyManagementOverlayProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const [familyData, setFamilyData] = useState<any>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const firestoreDb = db;
    let unsubscribeFamily: (() => void) | null = null;

    const unsubscribeUser = onSnapshot(doc(firestoreDb, 'users', user.uid), (userDoc: any) => {
      if (userDoc.exists() && userDoc.data().familyId) {
        const familyId = userDoc.data().familyId;

        if (unsubscribeFamily) unsubscribeFamily();
        unsubscribeFamily = onSnapshot(doc(firestoreDb, 'families', familyId), (famDoc: any) => {
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
      navigator.clipboard.writeText(familyData.inviteCode).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(() => {
        showToast('코드 복사에 실패했습니다. 직접 선택해서 복사해 주세요.');
      });
    } else {
      showToast('공유 가능한 코드가 아직 생성되지 않았습니다.');
    }
  };

  const handleJoin = () => {
    setJoinError(null);
    if (inviteCodeInput.length !== 6) {
      setJoinError('6자리 코드를 입력해 주세요.');
      return;
    }
    setJoinLoading(true);
    setTimeout(() => {
      setJoinLoading(false);
      showToast('가족 연결 기능을 곧 출시할게요! 🙌');
    }, 600);
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 mx-auto w-full max-w-[500px] z-[9999] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl border-x border-gray-100">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] bg-gray-900 text-white text-[13px] font-bold px-5 py-3 rounded-lg shadow-xl animate-in fade-in duration-200 max-w-[280px] text-center pointer-events-none">
          {toast}
        </div>
      )}

      <header className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-brand-500 flex items-center justify-center text-white">
            <HugeiconsIcon icon={UserGroupIcon} size={20} strokeWidth={2.5} />
          </div>
          <h3 className="text-[18px] font-bold text-text-main">가족 연결 관리</h3>
        </div>
        <button onClick={onClose} className="p-2 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors">
          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-y-contain p-6 space-y-8">
        {/* 내 가족 코드 섹션 */}
        <section className="bg-gray-50 rounded-lg p-8 text-center border border-gray-100">
          <h4 className="text-[15px] font-bold text-text-main mb-2">나의 가족 참여 코드</h4>
          <p className="text-[12px] font-medium text-text-muted mb-8 leading-relaxed">다른 가족에게 이 코드를 공유하여 <br /> 실시간으로 기록을 함께 보세요.</p>

          <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm relative overflow-hidden min-h-[120px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[12px] font-bold text-brand-300">연결 확인 중...</span>
              </div>
            ) : (
              <span className="text-[36px] font-bold text-text-main tracking-[0.2em] leading-none">
                {familyData?.inviteCode || '...'}
              </span>
            )}
            {!loading && (
              <button
                onClick={handleCopyCode}
                className="absolute right-3 bottom-3 w-10 h-10 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-brand-500 active:scale-90 transition-all hover:border-brand-200 hover:bg-brand-50"
              >
                <HugeiconsIcon icon={isCopied ? CheckmarkBadge01Icon : Copy01Icon} size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
          {isCopied && <p className="text-brand-500 text-[11px] font-bold mt-4 animate-pulse">코드가 클립보드에 복사되었습니다!</p>}
        </section>

        {/* 코드 입력하여 참여하기 */}
        <section className="space-y-4">
          <h4 className="text-[15px] font-bold text-text-main flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} size={18} className="text-brand-500" strokeWidth={2.5} />
            초대 코드로 가족 참여하기
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="6자리 코드 입력"
              value={inviteCodeInput}
              onChange={(e) => { setInviteCodeInput(e.target.value.toUpperCase()); setJoinError(null); }}
              className={`flex-1 bg-gray-50 border rounded-sm px-5 py-4 font-bold text-text-main placeholder:text-gray-300 focus:bg-white outline-none transition-all uppercase tracking-widest text-[16px] ${joinError ? 'border-red-300 focus:border-red-400' : 'border-gray-100 focus:border-brand-500'}`}
              maxLength={6}
            />
            <button
              onClick={handleJoin}
              disabled={joinLoading}
              className="bg-gray-900 text-white px-8 rounded-sm font-bold text-[14px] active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[88px]"
            >
              {joinLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : '연결하기'}
            </button>
          </div>
          {joinError && (
            <p className="text-red-500 text-[12px] font-bold pl-1">{joinError}</p>
          )}
        </section>

        {/* 도움말 */}
        <div className="bg-brand-50/50 rounded-lg p-5 flex gap-3 border border-brand-100">
          <HugeiconsIcon icon={HelpCircleIcon} size={18} className="text-brand-500 shrink-0 mt-0.5" />
          <p className="text-[12px] font-medium text-brand-700 leading-relaxed">
            참여 코드를 통해 가족으로 연결되면 모든 혈당 및 식단 기록이 실시간으로 공유됩니다. 개인 정보 보호를 위해 신중하게 공유해 주세요.
          </p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={onClose}
          className="w-full lds-button-primary"
        >
          확인
        </button>
      </div>
    </div>
  );
};
