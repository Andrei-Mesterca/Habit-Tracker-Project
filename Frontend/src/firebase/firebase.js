import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCiKtpEmCo7BY8_03xP71f2KJHTIUGZCgw",
  authDomain: "habitual-5e8a7.firebaseapp.com",
  projectId: "habitual-5e8a7",
  storageBucket: "habitual-5e8a7.firebasestorage.app",
  messagingSenderId: "502240807222",
  appId: "1:502240807222:web:9e48a60ba58c0445f20b97"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
