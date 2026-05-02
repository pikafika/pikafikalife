/**
 * 활동 및 에러 로그 인터페이스
 */
export interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'success';
  message: string;        // 기술적 메시지 또는 요약
  friendlyMessage: string; // 비개발자용 친절한 설명
  details?: string;       // 상세 내용
}

const STORAGE_KEY = 'pikafika_activity_logs';
const MAX_LOGS = 50;

/**
 * 기술 에러 코드를 친절한 설명으로 매핑하는 사전
 */
const ERROR_MAP: Record<string, string> = {
  'auth/user-not-found': '로그인 정보를 찾을 수 없어요. 다시 로그인해 보시겠어요?',
  'auth/network-request-failed': '인터넷 연결이 불안정해요. 네트워크 상태를 확인해 주세요.',
  'permission-denied': '데이터를 쓸 권한이 없어요. 가족 그룹에 정상적으로 소속되어 있는지 확인이 필요해요.',
  'unavailable': '지금은 데이터베이스와 대화하기 어려워요. 잠시 후 다시 시도해 주세요.',
  'not-found': '요청하신 데이터를 찾을 수 없어요.',
  'offline': '현재 오프라인 상태예요. 온라인으로 돌아오면 데이터가 동기화됩니다.',
  'no-family': '가족 그룹 정보가 없어요. 먼저 가족 그룹을 생성하거나 가입해 주세요.',
  'no-user': '로그인이 필요한 서비스예요.',
  'default': '알 수 없는 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
};

export class LogService {
  /**
   * 로그 기록하기 (서버 파일로 전송)
   */
  static async addLog(log: Omit<ActivityLog, 'id' | 'timestamp' | 'friendlyMessage'>) {
    const timestamp = Date.now();
    
    // 에러 코드에서 친절한 메시지 추출
    let friendlyMessage = ERROR_MAP[log.message] || log.message;
    if (log.type === 'error' && !ERROR_MAP[log.message]) {
      if (log.message.includes('offline')) friendlyMessage = ERROR_MAP['offline'];
      else if (log.message.includes('permission')) friendlyMessage = ERROR_MAP['permission-denied'];
      else friendlyMessage = ERROR_MAP['default'];
    }

    const newLog: ActivityLog = {
      ...log,
      id: `log_${timestamp}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      friendlyMessage
    };

    // 서버로 로그 전송 (비동기)
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => {
      // 서버 전송 실패 시 콘솔에만 출력
      console.error('Failed to send log to server:', err);
    });
    
    if (import.meta.env.DEV) {
      if (log.type === 'error') {
        console.error(`[ActivityLog] ${log.message}`, log.details);
      } else {
        console.log(`[ActivityLog] ${log.message}`);
      }
    }
    
    return newLog;
  }

  /**
   * 로그 가져오기 (파일 기반으로 변경되어 빈 배열 반환)
   * UI 구성 요소와의 호환성을 위해 유지
   */
  static getLogs(): ActivityLog[] {
    return [];
  }

  /**
   * 로그 초기화
   */
  static clearLogs() {
    // 파일 기반 로그는 수동으로 삭제해야 함
    console.info('로그 파일은 logs/activity.log에서 직접 삭제하거나 관리해 주세요.');
  }
}
