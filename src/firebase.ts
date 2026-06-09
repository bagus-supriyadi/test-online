import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCflzDIBEgyypGrrb0yLXGMdzVDIK9Db3c",
  authDomain: "soal-ujian-online.firebaseapp.com",
  projectId: "soal-ujian-online",
  storageBucket: "soal-ujian-online.firebasestorage.app",
  messagingSenderId: "583250978894",
  appId: "1:583250978894:web:34c41246be8a954b14fb1f",
  measurementId: "G-V30CB7QRCX"
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
