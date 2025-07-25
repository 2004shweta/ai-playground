const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  chat: { type: Array, default: [] },
  jsx: { type: String, default: "" },
  css: { type: String, default: "" },
  uiState: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", SessionSchema);
