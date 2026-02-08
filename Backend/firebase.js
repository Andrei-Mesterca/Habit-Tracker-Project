const admin = require('firebase-admin');
require('dotenv').config();

try {
  // Check if env variables are loaded
  console.log("Checking environment variables...");
  console.log("Project ID:", process.env.FIREBASE_PROJECT_ID ? "✓ Found" : "✗ Missing");
  console.log("Private Key:", process.env.FIREBASE_PRIVATE_KEY ? "✓ Found" : "✗ Missing");
  console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL ? "✓ Found" : "✗ Missing");

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });

  const db = admin.firestore();
  const auth = admin.auth();

  console.log("✓ Firebase initialized successfully");

  module.exports = { admin, db, auth };

} catch (error) {
  console.error("✗ Firebase initialization error:", error.message);
  process.exit(1); // Stop the server if Firebase fails
}