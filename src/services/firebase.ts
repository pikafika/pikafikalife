import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore,
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Firebase 설정값 (Vite 환경변수 활용)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 설정값 확인 및 초기화
const isFirebaseConfigured = !!firebaseConfig.apiKey;

let auth: any;
let db: any;
let googleProvider: any;

if (isFirebaseConfigured) {
  try {
    // 이미 초기화된 앱이 있으면 재사용, 없으면 새로 생성
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Firestore 싱글톤 처리: 이미 초기화되었으면 getFirestore 사용
    try {
      db = getFirestore(app);
    } catch (e) {
      // 초기화 전이면 전역 설정과 함께 초기화
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    }
    
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase 초기화 중 에러 발생:", error);
  }
} else {
  console.warn("Firebase API Key가 설정되지 않았습니다. .env 파일을 확인해 주세요.");
}

export { auth, db, googleProvider };
