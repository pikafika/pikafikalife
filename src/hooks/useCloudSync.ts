import { useEffect } from 'react';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { SyncService } from '../services/syncService';

export const useCloudSync = () => {
  const { user } = useAuthStore();
  const { logs, setLogs } = useHistoryStore();

  useEffect(() => {
    if (!user || !db) return; // DB가 초기화되지 않았으면 실행하지 않음

    const initSync = async () => {
      // 1. 가족 그룹 확인 또는 생성
      const familyId = await SyncService.getOrCreateFamily(user.uid, user.displayName || '익명');

      // 2. 마이그레이션 (로컬에만 데이터가 있고 클라우드가 비어있을 경우 등 - 실제 환경에선 더 정밀한 체크 필요)
      // 현재는 간단히 로컬 로그가 있고 클라우드 동기화 전이라면 업로드 시도
      if (logs.length > 0) {
        // 로컬 데이터를 하나씩 클라우드로 백업 (중복 방지 로직은 상용 서비스 시 보완 필요)
        for (const log of logs) {
          if (!log.author) { // 로컬 기록이면 업로드
            await SyncService.saveLog(familyId, log);
          }
        }
      }

      // 3. 실시간 구독 시작
      SyncService.subscribeLogs(familyId, (cloudLogs) => {
        setLogs(cloudLogs);
      });
    };

    initSync();
  }, [user]);
};
