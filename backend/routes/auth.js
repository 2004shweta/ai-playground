const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });
    res.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
      return res.status(503).json({ error: "Database connection error. Please try again." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
      return res.status(503).json({ error: "Database connection error. Please try again." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
