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

    res.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── HABITS ──────────────────────────────────────────────────────────────────

// GET /api/habits — list all habits for the authenticated user
app.get("/api/habits", verifyToken, async (req, res) => {
  try {
    const snap = await db
      .collection('users').doc(req.uid)
      .collection('habits')
      .orderBy('createdAt', 'asc')
      .get();
    const habits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, habits });
  } catch (e) {
    console.error("GET habits error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/habits — create a new habit
app.post("/api/habits", verifyToken, async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "Habit name is required" });

    const habitId = habitIdFromName(name);
    const ref = db.collection('users').doc(req.uid).collection('habits').doc(habitId);

    // Check for duplicate
    const existing = await ref.get();
    if (existing.exists) {
      return res.status(409).json({ success: false, error: "A habit with this name already exists" });
    }

    await ref.set({
      name: name.trim(),
      description: description ?? "",
      frequency: frequency ?? "daily",
      completedDates: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, habitId });
  } catch (e) {
    console.error("POST habit error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/habits/:id — update name, description, or frequency
app.put("/api/habits/:id", verifyToken, async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "Habit name is required" });

    const ref = db.collection('users').doc(req.uid).collection('habits').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, error: "Habit not found" });

    await ref.update({
      name: name.trim(),
      description: description ?? "",
      frequency: frequency ?? "daily",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (e) {
    console.error("PUT habit error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/habits/:id — remove a habit
app.delete("/api/habits/:id", verifyToken, async (req, res) => {
  try {
    const ref = db.collection('users').doc(req.uid).collection('habits').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, error: "Habit not found" });

    await ref.delete();
    res.json({ success: true });
  } catch (e) {
    console.error("DELETE habit error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/habits/:id/complete — toggle today's completion
app.post("/api/habits/:id/complete", verifyToken, async (req, res) => {
  try {
    const { date, completed } = req.body;
    if (!date) return res.status(400).json({ success: false, error: "Date is required" });

    const ref = db.collection('users').doc(req.uid).collection('habits').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, error: "Habit not found" });

    const update = completed
      ? { completedDates: admin.firestore.FieldValue.arrayUnion(date) }
      : { completedDates: admin.firestore.FieldValue.arrayRemove(date) };

    await ref.update(update);
    res.json({ success: true });
  } catch (e) {
    console.error("Complete habit error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
