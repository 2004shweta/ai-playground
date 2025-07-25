const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const auth = require("../middleware/auth");

// List sessions for user
router.get("/", auth, async (req, res) => {
  const sessions = await Session.find({ user: req.user.userId }).sort({
    updatedAt: -1,
  });
  res.json(sessions);
});

// Create session
router.post("/", auth, async (req, res) => {
  const { name, chat, jsx, css, uiState } = req.body;
  const session = await Session.create({
    user: req.user.userId,
    name,
    chat: chat || [],
    jsx: jsx || "",
    css: css || "",
    uiState: uiState || {},
  });
  res.json(session);
});

// Get session by id
router.get("/:id", auth, async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json(session);
});

// Update session
router.put("/:id", auth, async (req, res) => {
  const { name, chat, jsx, css, uiState } = req.body;
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, user: req.user.userId },
    { name, chat, jsx, css, uiState, updatedAt: Date.now() },
    { new: true },
  );
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json(session);
});

// Delete session
router.delete("/:id", auth, async (req, res) => {
  const session = await Session.findOneAndDelete({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

module.exports = router;
