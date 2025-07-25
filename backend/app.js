var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const sessionsRouter = require("./routes/sessions");
const aiRouter = require("./routes/ai");

const app = express();

// Enable CORS
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Redis connection
console.log("Using Redis URL:", process.env.REDIS_URL);
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith("rediss://"),
  },
});
redisClient
  .connect()
  .then(() => {
    console.log("Redis connected");
  })
  .catch(console.error);

app.set("redisClient", redisClient);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/sessions", sessionsRouter);
app.use("/ai", aiRouter);

module.exports = app;
