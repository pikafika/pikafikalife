import { useHistoryStore } from '../store/useHistoryStore';
import { useUserStore } from '../store/useUserStore';
import { LogEntry, UserSettings } from '../types';

interface BackupData {
  version: string;
  timestamp: number;
  logs: LogEntry[];
  settings: UserSettings;
}

const SETTINGS_RANGES = {
  icr:      { min: 1,  max: 100 },
  isf:      { min: 1,  max: 500 },
  targetBG: { min: 60, max: 300 },
  dia:      { min: 1,  max: 8   },
} as const;

function isValidSettings(s: unknown): s is UserSettings {
  if (!s || typeof s !== 'object') return false;
  const settings = s as Record<string, unknown>;
  return (
    typeof settings.icr === 'number' && settings.icr >= SETTINGS_RANGES.icr.min && settings.icr <= SETTINGS_RANGES.icr.max &&
    typeof settings.isf === 'number' && settings.isf >= SETTINGS_RANGES.isf.min && settings.isf <= SETTINGS_RANGES.isf.max &&
    typeof settings.targetBG === 'number' && settings.targetBG >= SETTINGS_RANGES.targetBG.min && settings.targetBG <= SETTINGS_RANGES.targetBG.max &&
    typeof settings.dia === 'number' && settings.dia >= SETTINGS_RANGES.dia.min && settings.dia <= SETTINGS_RANGES.dia.max
  );
}

function isValidLog(log: unknown): log is LogEntry {
  if (!log || typeof log !== 'object') return false;
  const l = log as Record<string, unknown>;
  return (
    typeof l.id === 'string' &&
    typeof l.timestamp === 'number' &&
    typeof l.currentBG === 'number' && l.currentBG >= 0 && l.currentBG <= 800 &&
    typeof l.totalCarbs === 'number' && l.totalCarbs >= 0 &&
    typeof l.totalInsulin === 'number' && l.totalInsulin >= 0 && l.totalInsulin <= 100
  );
}

export const exportData = () => {
  const logs = useHistoryStore.getState().logs;
  const settings = useUserStore.getState().settings;

  const backupData: BackupData = {
    version: '1.0.0',
    timestamp: Date.now(),
    logs,
    settings,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `t1d-backup-${date}.json`;
  link.click();

  URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as BackupData;

    if (!data.version || !Array.isArray(data.logs) || !data.settings) {
      throw new Error('올바르지 않은 백업 파일 형식입니다.');
    }

    if (!isValidSettings(data.settings)) {
      throw new Error('설정값이 허용 범위를 벗어났습니다. 파일이 손상되었거나 조작되었을 수 있습니다.');
    }

    const validLogs = data.logs.filter(isValidLog);
    if (validLogs.length !== data.logs.length) {
      throw new Error(`${data.logs.length - validLogs.length}개의 기록이 유효하지 않아 복구할 수 없습니다.`);
    }

    useHistoryStore.setState({ logs: validLogs });
    useUserStore.setState({ settings: data.settings });

    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Data import failed:', error);
    }
    return false;
  }
};
