import { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { SyncService } from '../services/syncService';

export const useCloudSync = () => {
  const { user } = useAuthStore();
  const { logs, setLogs } = useHistoryStore();
  const [isSyncing, setIsSyncing] = useState(false);
  // Capture the latest logs in a ref so the one-time migration effect doesn't
  // need logs in its deps array (intentional stale-on-purpose pattern).
  const logsRef = useRef(logs);
  logsRef.current = logs;

  useEffect(() => {
    if (!user || !db) return;

    const initSync = async () => {
      setIsSyncing(true);
      try {
        const familyId = await SyncService.getOrCreateFamily(user.uid, user.displayName || '익명');

        // familyId가 null이면 Firestore 초기화 실패 — 동기화 중단
        if (!familyId) {
          console.error('[Sync] familyId를 가져오지 못했습니다. Firestore 연결을 확인하세요.');
          setIsSyncing(false);
          return;
        }

        // One-time migration: upload local-only logs to the cloud on first login.
        // Guarded by a localStorage flag so it never runs twice for the same user.
        const migrationKey = `pikafika_migrated_${user.uid}`;
        if (!localStorage.getItem(migrationKey)) {
          const localLogs = logsRef.current.filter(log => !log.author);
          if (localLogs.length > 0) {
            await Promise.all(localLogs.map(log => SyncService.saveLog(familyId, log)));
          }
          localStorage.setItem(migrationKey, 'true');
        }

        SyncService.subscribeLogs(familyId, (cloudLogs) => {
          setLogs(cloudLogs);
          setIsSyncing(false);
        });
      } catch (err) {
        console.error('[Sync] 초기화 중 오류:', err);
        setIsSyncing(false);
      }
    };

    initSync();

    // 언마운트 또는 user 변경 시 Firestore 리스너 정리
    return () => {
      SyncService.unsubscribeLogs();
    };
  }, [user, setLogs]);

  return { isSyncing };
};
