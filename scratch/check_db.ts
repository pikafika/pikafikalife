import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
  const familyId = "fam_Ih6vjqgj0RfLHjpaRjLmidpaQoC2";
  console.log(`Checking data for family: ${familyId}...`);
  
  try {
    const logsRef = collection(db, "families", familyId, "logs");
    // Sort by timestamp desc to see the latest
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    
    console.log(`Successfully connected. Found ${querySnapshot.size} recent documents.`);
    
    if (querySnapshot.size > 0) {
      console.log("\nLast 5 recordings:");
      querySnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`- [${new Date(data.timestamp).toLocaleString('ko-KR')}] BG: ${data.currentBG}, Carbs: ${data.totalCarbs}g, Memo: ${data.memo}`);
      });
      
      // Get total count
      const allLogs = await getDocs(collection(db, "families", familyId, "logs"));
      console.log(`\nTotal documents in collection: ${allLogs.size}`);
    } else {
      console.log("No documents found in the logs collection.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    process.exit();
  }
}

checkData();
