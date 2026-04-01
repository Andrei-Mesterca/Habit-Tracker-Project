console.log("SERVER FILE STARTED");

require('dotenv').config();

const functions = require('firebase-functions');
const express = require("express");
const cors = require("cors");
const { admin, db, auth } = require('./firebase');

const app = express();

// Cors
app.use(cors({ origin: true }));
app.use(express.json());



// ─── Health check ────────────────────────────────────────────────────────────
// Handle both /health and /api/health
app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "backend alive" });
});

// ─── Auth middleware ──────────────────────────────────────────────────────────
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const token = header.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────
function habitIdFromName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// Handle both /login and /api/login
app.post(["/login", "/api/login"], async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const apiKey = process.env.MY_API_KEY;
    if (!apiKey) {
      console.error("MY_API_KEY is not set in .env");
      return res.status(500).json({ success: false, error: "Server misconfiguration: missing API key" });
    }

    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      throw new Error(verifyData.error?.message || "Invalid credentials");
    }

    const uid = verifyData.localId;
    const customToken = await admin.auth().createCustomToken(uid);

    res.json({ success: true, customToken });

  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// ─── SIGNUP ──────────────────────────────────────────────────────────────────
// Handle both /signup and /api/signup
app.post(["/signup", "/api/signup"], async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });

    await db.collection('users').doc(userRecord.uid).set({
      username,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.json({ success: true, uid: userRecord.uid, customToken });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);