import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhjd58zkdd-ad8lsaJS9eFGBmJeZvJQWM",
  authDomain: "ct216app-7fff1.firebaseapp.com",
  projectId: "ct216app-7fff1",
  storageBucket: "ct216app-7fff1.firebasestorage.app",
  messagingSenderId: "808113080991",
  appId: "1:808113080991:web:3f0f513e596f7d4a9f30aa",
  measurementId: "G-ZDZ0LW9KLC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };