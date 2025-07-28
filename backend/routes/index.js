var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

/* GET home page. */
router.get("/", function (req, res) {
  res.send("Backend is live!");
});

/* GET health check. */
router.get("/health", function (req, res) {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus[dbState] || "unknown",
      readyState: dbState
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "not set",
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasRedisUrl: !!process.env.REDIS_URL
    }
  });
});

/* GET test endpoint for debugging */
router.get("/test", function (req, res) {
  res.json({
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    mongoose: {
      readyState: mongoose.connection.readyState,
      models: Object.keys(mongoose.models)
    }
  });
});

module.exports = router;
