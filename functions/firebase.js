// functions/firebase.js
const admin = require('firebase-admin');

// Use default credentials provided by Firebase
admin.initializeApp();

// Firestore and Auth exports
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };