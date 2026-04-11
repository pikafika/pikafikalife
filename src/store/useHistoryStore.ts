import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LogEntry } from '../types';

interface HistoryState {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  removeLog: (id: string) => void;
  updateLog: (id: string, updatedLog: Partial<LogEntry>) => void;
  clearLogs: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs], // 최신 기록이 앞으로 오도록 추가
        })),
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
      name: 'history-storage',
    }
  )
);
