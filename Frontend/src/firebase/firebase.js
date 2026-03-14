import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCiPXMDq_ElrWFQbURFVx2XQRxspG9IN3U",
  authDomain: "habitual1-e1d4f.firebaseapp.com",
  projectId: "habitual1-e1d4f",
  storageBucket: "habitual1-e1d4f.firebasestorage.app",
  messagingSenderId: "38122412164",
  appId: "1:38122412164:web:7bd36dec2068f76faf4ad1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
