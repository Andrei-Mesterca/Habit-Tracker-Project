import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkNEMqtYEGThJwGGge2mc8ZLUus9x8c3U",
  authDomain: "ct216-1c0c8.firebaseapp.com",
  projectId: "ct216-1c0c8",
  storageBucket: "ct216-1c0c8.firebasestorage.app",
  messagingSenderId: "754585070527",
  appId: "1:754585070527:web:c99beacd184166c8fe4f0a",
  measurementId: "G-XN8LRW553V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
