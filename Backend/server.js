console.log("SERVER FILE STARTED");

require('dotenv').config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const path = require("path");
const { admin, db, auth } = require('./firebase');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

app.get("/health", (req, res) => {
  console.log("Health endpoint hit");
  res.json({ status: "backend alive" });
});

// SIGNUP endpoint
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    console.log("Signup request received:", { email, username });

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: "Password must be at least 8 characters" 
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: username,
    });

    console.log("User created in Firebase Auth:", userRecord.uid);

    // Save additional user data to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      username: username,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("User data saved to Firestore");

    res.json({ 
      success: true, 
      message: "User created successfully",
      uid: userRecord.uid 
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// LOGIN endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request received:", { email });

    // Note: Firebase Admin SDK doesn't have a built-in way to verify passwords
    // For login, you should use Firebase Auth on the frontend
    // This endpoint is mainly for demonstration
    
    const user = await auth.getUserByEmail(email);
    
    res.json({ 
      success: true, 
      message: "User found",
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ 
      success: false, 
      error: "Invalid credentials" 
    });
  }
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
  console.log("Frontend available at http://localhost:3000");
});