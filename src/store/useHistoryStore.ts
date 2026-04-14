import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LogEntry } from '../types';

interface HistoryState {
  logs: LogEntry[];
  addLog: (log: LogEntry, familyId?: string) => void;
  setLogs: (logs: LogEntry[]) => void;
  removeLog: (id: string) => void;
  updateLog: (id: string, updatedLog: Partial<LogEntry>) => void;
  clearLogs: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      logs: [],
      setLogs: (logs) => set({ logs }),
      addLog: (log, familyId) => {
        set((state) => ({
          logs: [log, ...state.logs],
        }));
        
        // 데이터베이스 동기화 (선택적)
        if (familyId) {
          import('../services/syncService').then(({ SyncService }) => {
            SyncService.saveLog(familyId, log);
          });
        }
      },
      removeLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        })),
      updateLog: (id, updatedLog) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? { ...log, ...updatedLog } : log
          ),
        })),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'pikafika-history',
    }
  )
);
