console.log("SERVER FILE STARTED");

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

app.get("/health", (req, res) => {
  console.log("Health endpoint hit");
  res.json({ status: "backend alive" });
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
  console.log("Frontend available at http://localhost:3000");
});