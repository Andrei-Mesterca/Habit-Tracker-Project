// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBz5PF2k2F1DZOMFoKahXlBLPRJY0JZsQA",
  authDomain: "ct216-ab590.firebaseapp.com",
  projectId: "ct216-ab590",
  storageBucket: "ct216-ab590.firebasestorage.app",
  messagingSenderId: "645647655829",
  appId: "1:645647655829:web:8374d4f1bde37654d30c9c",
  measurementId: "G-8FK893FWKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };