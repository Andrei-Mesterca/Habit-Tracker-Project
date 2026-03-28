console.log("SERVER FILE STARTED");

require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { admin, db, auth } = require('./firebase');

const app = express();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com https://*.firebaseapp.com https://*.firebaseio.com;"
  );
  next();
});
app.use(express.json());

app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "backend alive" });
});

// ─── Auth middleware ──────────────────────────────────────────────────────────
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
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
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // 1. Verify credentials using Firebase Identity Toolkit REST API
    // Make sure FIREBASE_API_KEY is set in your .env file.
    // Get it from: Firebase Console → Project Settings → General → Web API Key
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("FIREBASE_API_KEY is not set in .env");
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

    // 2. Generate a Custom Token using the Admin SDK
    const uid = verifyData.localId;
    const customToken = await admin.auth().createCustomToken(uid);

    res.json({ success: true, customToken });

  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// ─── SIGNUP ──────────────────────────────────────────────────────────────────
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    // 1. Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });

    // 2. Save profile to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      username,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Generate a custom token so the client can sign in immediately
    //    without needing a second round-trip to /api/login
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.json({ success: true, uid: userRecord.uid, customToken });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});


// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
