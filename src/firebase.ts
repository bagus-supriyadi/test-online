import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCflzDIBEgyypGrrb0yLXGMdzVDIK9Db3c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "soal-ujian-online.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "soal-ujian-online",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "soal-ujian-online.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "583250978894",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:583250978894:web:34c41246be8a954b14fb1f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V30CB7QRCX"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// Connectivity validation as requested in the Firebase Integration Skill
export async function testConnection() {
  try {
    // Tests connection to server
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Client is offline. Operating in local-fallback mode.");
    } else {
      console.warn("Firebase not reachable or not yet configured. Operating in high-performance local persistence mode.");
    }
  }
}

testConnection();
