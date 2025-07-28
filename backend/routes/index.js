// var express = require("express");
// var router = express.Router();

// /* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

// module.exports = router;
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
    }
  });
});

module.exports = router;
