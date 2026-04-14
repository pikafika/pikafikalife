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
  runTransaction
} from "firebase/firestore";
import { db } from "./firebase";
import { LogEntry, UserSettings } from "../types";
import { useAuthStore } from "../store/useAuthStore";

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
        if (import.meta.env.DEV) {
          console.log("Existing family found:", userDoc.data().familyId);
        }
        return userDoc.data().familyId;
      }

      // 새 가족 그룹 생성 (최초 1회)
      const familyId = `fam_${uid}`;
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      if (import.meta.env.DEV) {
        console.log("Creating new family group for user:", uid, "with code:", inviteCode);
      }

      await setDoc(userDocRef, { uid, displayName, familyId }, { merge: true });
      await setDoc(doc(db, "families", familyId), {
        familyId,
        ownerId: uid,
        inviteCode,
        members: { [uid]: "owner" },
        createdAt: Date.now()
      });

      console.log("✅ Family group created successfully:", familyId);
      return familyId;
    } catch (e) {
      console.error("❌ Family creation error:", e);
      return null;
    }
  }

  /**
   * 초대 코드로 가족 그룹 가입
   */
  static async joinFamilyByCode(uid: string, inviteCode: string) {
    if (!db) return;
    // ... (상세 구현 생략 또는 구현되어 있던 로직)
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
      console.error("Logs sync error:", error);
    });
  }

  /**
   * 로그 저장 (작성자 정보 포함)
   */
  static async saveLog(familyId: string, log: LogEntry) {
    if (!db || !familyId) return;
    const user = useAuthStore.getState().user;
    if (!user) return;

    const logRef = doc(db, "families", familyId, "logs", log.id);
    await setDoc(logRef, {
      ...log,
      author: {
        uid: user.uid,
        displayName: user.displayName || "익명",
        photoURL: user.photoURL || ""
      }
    });
  }
}
