const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const axios = require("axios");

// POST /ai/generate
router.post("/generate", auth, async (req, res) => {
  const { prompt, chat, code } = req.body;
  try {
    // Example: OpenRouter API (adjust as needed)
    const response = await axios.post(
      process.env.LLM_API_URL ||
        "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.LLM_MODEL || "openrouter/openai/gpt-3.5-turbo",
        messages: [
          ...(chat || []).map((m) => ({
            role: m.role === "ai" ? "assistant" : m.role,
            content: m.content,
          })),
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    res.json({ result: response.data });
  } catch (err) {
    // Improved error logging
    console.error(
      "AI request failed:",
      err.response?.data || err.message || err,
    );
    res
      .status(500)
      .json({
        error: "AI request failed",
        details: err.response?.data?.error?.message || err.message,
      });
  }
});

module.exports = router;
