import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChelbQyIQECWcl0CDy0ynisUAIBvCwh6s",
  authDomain: "habitual-2d22c.firebaseapp.com",
  projectId: "habitual-2d22c",
  storageBucket: "habitual-2d22c.firebasestorage.app",
  messagingSenderId: "626552524028",
  appId: "1:626552524028:web:add8b2e4c18f3118d15b79",
  measurementId: "G-WGEJK5EPX1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };