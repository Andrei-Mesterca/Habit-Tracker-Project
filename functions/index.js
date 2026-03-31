// functions/index.js
require('dotenv').config();
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch"); // install in functions: npm install node-fetch

// Import Firebase admin & db from your firebase.js
const { admin, db, auth } = require("./firebase");

const app = express();

// ─── Middleware ─────────────────────────────
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  // Tells the browser that the "Private Network" access is allowed
  res.setHeader("Access-Control-Allow-Private-Network", "true");

  // If this is a preflight (OPTIONS) request, return 200 immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com https://*.firebaseapp.com https://*.firebaseio.com;"
  );
  next();
});

// ─── Serve frontend files ────────────────────
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// ─── Health check ──────────────────────────
app.get("/health", (req, res) => res.json({ status: "backend alive" }));

// ─── Auth middleware ───────────────────────
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

// ─── Helper ─────────────────────────────────
function habitIdFromName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

// ─── LOGIN ──────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: "Email and password required" });

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: "Missing API key" });

    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) }
    );
    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) throw new Error(verifyData.error?.message || "Invalid credentials");

    const uid = verifyData.localId;
    const customToken = await admin.auth().createCustomToken(uid);
    res.json({ success: true, customToken });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// ─── SIGNUP ─────────────────────────────────
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) return res.status(400).json({ success: false, error: "All fields required" });
    if (password.length < 8) return res.status(400).json({ success: false, error: "Password must be >= 8 characters" });

    const userRecord = await auth.createUser({ email, password, displayName: username });
    await db.collection('users').doc(userRecord.uid).set({ username, email, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.json({ success: true, uid: userRecord.uid, customToken });
  } catch (error) {
    logger.error("Signup error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── SPA fallback ───────────────────────────
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

// ─── Export as Firebase Function ───────────
exports.api = onRequest(app);