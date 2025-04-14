
// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmIaq_sWUb2jGeU9GDvEl1IHO4QPcc1N0",
  authDomain: "my-app-ff7a5.firebaseapp.com",
  projectId: "my-app-ff7a5",
  storageBucket: "my-app-ff7a5.firebasestorage.app",
  messagingSenderId: "931473615633",
  appId: "1:931473615633:web:e7620bcdc22388b8bfbab0",
  measurementId: "G-JRSMN7KDB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
export default app;
