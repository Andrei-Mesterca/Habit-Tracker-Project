// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkNEMqtYEGThJwGGge2mc8ZLUus9x8c3U",
  authDomain: "ct216-1c0c8.firebaseapp.com",
  projectId: "ct216-1c0c8",
  storageBucket: "ct216-1c0c8.firebasestorage.app",
  messagingSenderId: "754585070527",
  appId: "1:754585070527:web:c99beacd184166c8fe4f0a",
  measurementId: "G-XN8LRW553V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase
const db = getFirestore(app, "habitablehabits");

export { app, db };