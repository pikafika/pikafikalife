import { useHistoryStore } from '../store/useHistoryStore';
import { useUserStore } from '../store/useUserStore';
import { LogEntry, UserSettings } from '../types';

interface BackupData {
  version: string;
  timestamp: number;
  logs: LogEntry[];
  settings: UserSettings;
}

/**
 * 데이터를 JSON 파일로 내보냅니다.
 */
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

/**
 * JSON 파일로부터 데이터를 복구합니다.
 */
export const importData = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const data: BackupData = JSON.parse(text);

    // 데이터 구조 검증
    if (!data.version || !Array.isArray(data.logs) || !data.settings) {
      throw new Error('올바르지 않은 백업 파일 형식입니다.');
    }

    // 스토어 업데이트
    // useHistoryStore.getState().clearLogs(); // 기존 로그 삭제 (선택 사항)
    // 여기서는 덮어쓰기 방식으로 진행
    
    // Zustand의 persist 미들웨어가 있으므로, 직접 상태를 설정하는 방법을 사용하거나
    // 각 스토어에 set 전체 상태 메서드를 추가해야 할 수도 있습니다.
    // 현재 스토어에는 개별 추가/삭제만 있으므로, 전체를 갈아끼우는 메서드를 고려하거나
    // 단순히 루프를 돌며 처리할 수도 있지만, 성능상 전체 교체가 낫습니다.
    
    // 임시로 logs를 하나씩 추가하는 대신, 스토어에 setState를 사용합니다.
    useHistoryStore.setState({ logs: data.logs });
    useUserStore.setState({ settings: data.settings });

    return true;
  } catch (error) {
    console.error('Data import failed:', error);
    return false;
  }
};
