const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Signup
router.post("/signup", async (req, res) => {
  console.log("Signup request received:", { email: req.body.email, hasPassword: !!req.body.password });
  
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  
  try {
    console.log("Checking for existing user...");
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("User already exists:", email);
      return res.status(409).json({ error: "Email already registered" });
    }
    
    console.log("Hashing password...");
    const hash = await bcrypt.hash(password, 10);
    
    console.log("Creating new user...");
    const user = await User.create({ email, password: hash });
    console.log("User created successfully:", user._id);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
      return res.status(503).json({ error: "Database connection error. Please try again." });
    }
    
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation error: " + err.message });
    }
    
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("Login request received:", { email: req.body.email, hasPassword: !!req.body.password });
  
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  try {
    console.log("Looking up user...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    console.log("Comparing passwords...");
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    console.log("Generating JWT token...");
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set!");
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    
    console.log("Login successful for user:", email);
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
      return res.status(503).json({ error: "Database connection error. Please try again." });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(500).json({ error: "Token generation error" });
    }
    
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;
