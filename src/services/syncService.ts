import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  where,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { LogEntry, UserSettings } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { LogService } from "./logService";
import { isAdmin } from "../utils/permissions";

/**
 * Firestore와 Zustand 스토어 간의 동기화를 담당하는 서비스
 */
export class SyncService {
  private static familyUnsubscribe: (() => void) | null = null;
  private static logsUnsubscribe: (() => void) | null = null;

  /**
   * 사용자의 가족 정보를 가져오거나 생성
   */
  static async getOrCreateFamily(uid: string, displayName: string) {
    if (!db) {
      console.error("Firestore DB is not initialized.");
      return null;
    }
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().familyId) {
          return userDoc.data().familyId;
      }

      const familyId = `fam_${uid}`;
      const array = new Uint8Array(4);
      crypto.getRandomValues(array);
      const inviteCode = Array.from(array, (b) => b.toString(36)).join('').substring(0, 6).toUpperCase();

      await setDoc(userDocRef, { uid, displayName, familyId }, { merge: true });
      await setDoc(doc(db, "families", familyId), {
        familyId,
        ownerId: uid,
        inviteCode,
        members: { [uid]: "owner" },
        createdAt: Date.now()
      });

      return familyId;
    } catch {
      return null;
    }
  }

  /**
   * 초대 코드로 가족 그룹 가입
   */
  static async joinFamilyByCode(_uid: string, _inviteCode: string) {
    // TODO: 초대 코드로 가족 그룹 가입 기능 미구현
    if (!db) return;
  }

  /**
   * 실시간 로그 구독 설정
   */
  static subscribeLogs(familyId: string, onUpdate: (logs: LogEntry[]) => void) {
    if (!db || !familyId) return;
    if (this.logsUnsubscribe) this.logsUnsubscribe();

    const logsRef = collection(db, "families", familyId, "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(100));

    this.logsUnsubscribe = onSnapshot(q, (snapshot) => {
      const logs: LogEntry[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as LogEntry);
      });
      onUpdate(logs);
    }, (error) => {
      // 에러를 기록하여 디버깅 가능하게 함 (권한 오류, 네트워크 오류 등)
      console.error('[Sync] subscribeLogs 에러:', error.code, error.message);
      LogService.addLog({
        type: 'error',
        message: error.code || error.message,
        details: `실시간 로그 구독 오류 (familyId: ${familyId})`
      });
    });
  }

  /**
   * 실시간 로그 구독 해제 — useEffect cleanup에서 호출
   */
  static unsubscribeLogs() {
    if (this.logsUnsubscribe) {
      this.logsUnsubscribe();
      this.logsUnsubscribe = null;
    }
  }

  /**
   * 로그 저장 (작성자 정보 포함)
   */
  static async saveLog(familyId: string, log: LogEntry) {
    if (!db || !familyId) return;
    const user = useAuthStore.getState().user;
    if (!user) return;

    const logRef = doc(db, "families", familyId, "logs", log.id);
    try {
      await setDoc(logRef, {
        ...log,
        author: {
          uid: user.uid,
          displayName: user.displayName || "익명",
          photoURL: user.photoURL || ""
        }
      });
    } catch (e: any) {
      LogService.addLog({
        type: 'error',
        message: e.code || e.message,
        details: `로그 저장 중 오류 (ID: ${log.id})`
      });
      throw e;
    }
  }

  /**
   * 14일치 더미 데이터 생성
   */
  static async seed14DayDummyData(familyId: string) {
    const user = useAuthStore.getState().user;
    if (!isAdmin(user)) {
      throw new Error('이 작업을 수행할 권한이 없습니다.');
    }

    if (!db || !familyId) {
      await LogService.addLog({
        type: 'error',
        message: 'no-family',
        details: '데이터베이스 연결 또는 가족 정보를 찾을 수 없습니다.'
      });
      return;
    }
    
    await LogService.addLog({
      type: 'info',
      message: '더미 데이터 생성을 시작합니다.',
      details: `가족 ID: ${familyId}`
    });

    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("로그인 정보가 없습니다.");

      // 1. 가족 문서 존재 확인 및 필요 시 생성
      let currentFamilyId = familyId;
      try {
        const familyDoc = await getDoc(doc(db, "families", currentFamilyId));
        if (!familyDoc.exists()) {
          const newFamilyId = await this.getOrCreateFamily(user.uid, user.displayName || "관리자");
          if (newFamilyId) currentFamilyId = newFamilyId;
        }
      } catch (e: any) {
        if (import.meta.env.DEV) console.warn("오프라인 상태이거나 가족 확인 실패. 계속 진행합니다.");
        await LogService.addLog({
          type: 'info',
          message: '오프라인 모드로 데이터 생성을 계속합니다.',
          details: '네트워크 연결 시 데이터가 동기화됩니다.'
        });
      }

      // 2. 배치 데이터 준비
      const batch = writeBatch(db);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      let totalCount = 0;

      const author = {
        uid: user.uid,
        displayName: user.displayName || "익명",
        photoURL: user.photoURL || ""
      };

      for (let i = 14; i >= 0; i--) {
        const dayTimestamp = now - i * oneDayMs;
        const schedules = [
          { label: '아침', hour: 8, bgRange: [110, 160], carb: 45 },
          { label: '점심', hour: 13, bgRange: [130, 210], carb: 65 },
          { label: '저녁', hour: 19, bgRange: [140, 240], carb: 75 },
          { label: '취침전', hour: 22, bgRange: [110, 180], carb: 0 }
        ];

        for (const s of schedules) {
          const logTime = new Date(dayTimestamp).setHours(s.hour, Math.floor(Math.random() * 45));
          if (logTime > now) continue;

          const currentBG = Math.floor(Math.random() * (s.bgRange[1] - s.bgRange[0])) + s.bgRange[0];
          const logId = `seed_${logTime}`;
          
          const logData = {
            id: logId,
            timestamp: logTime,
            currentBG,
            totalCarbs: s.carb,
            mealInsulin: Math.max(1, Math.round(s.carb / 10)),
            corrInsulin: currentBG > 150 ? Math.round((currentBG - 150) / 40) : 0,
            totalInsulin: Math.max(1, Math.round(s.carb / 10)) + (currentBG > 150 ? Math.round((currentBG - 150) / 40) : 0),
            iobAtTime: 0,
            foods: [],
            isEaten: true,
            memo: `${s.label} 정기 기록 (더미)`,
            author
          };

          const logRef = doc(db, "families", currentFamilyId, "logs", logId);
          batch.set(logRef, logData);
          totalCount++;
        }
      }

      // 3. 한 번에 커밋 (타임아웃 적용)
      await LogService.addLog({
        type: 'info',
        message: '데이터 커밋을 시작합니다.',
        details: `${totalCount}개의 데이터를 데이터베이스에 기록하고 있습니다...`
      });

      // 10초 타임아웃 설정: 이 시간 내에 완료되지 않으면 백그라운드 위임으로 간주
      const commitPromise = batch.commit();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("COMMIT_TIMEOUT")), 10000)
      );

      try {
        await Promise.race([commitPromise, timeoutPromise]);
        
        await LogService.addLog({
          type: 'success',
          message: '더미 데이터 생성이 완료되었습니다.',
          details: `${totalCount}개의 기록이 성공적으로 처리되었습니다.`
        });
      } catch (err: any) {
        if (err.message === "COMMIT_TIMEOUT") {
          if (import.meta.env.DEV) console.warn("Commit timeout — operations continuing in background.");
          await LogService.addLog({
            type: 'info',
            message: '데이터가 백그라운드에서 동기화 중입니다.',
            details: '네트워크 연결이 지연되어 작업이 백그라운드로 전환되었습니다. 잠시 후 결과가 반영됩니다.'
          });
          // 타임아웃은 에러가 아니므로 성공으로 간주하고 UI를 풀어줍니다.
        } else {
          throw err;
        }
      }
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      await LogService.addLog({
        type: 'error',
        message: err.code || err.message || 'unknown',
        details: `데이터 생성 중 오류 발생: ${err.message ?? ''}`
      });
      throw e;
    }
  }
}
