import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase 초기화 중 에러 발생:", error);
  }
} else {
  console.warn("Firebase API Key가 설정되지 않았습니다. .env 파일을 확인해 주세요.");
}

export { auth, db, googleProvider };
