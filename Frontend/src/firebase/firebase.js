import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyrHx0PscJ_6NvLIsChDl0mVjxWtcgtY8",
  authDomain: "project1-4ffa4.firebaseapp.com",
  projectId: "project1-4ffa4",
  storageBucket: "project1-4ffa4.firebasestorage.app",
  messagingSenderId: "834369789957",
  appId: "1:834369789957:web:fd0c6eb09d13f2a3537c6c",
  measurementId: "G-SSXZQ1MEVW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
