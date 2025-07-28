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

// Enable CORS with specific configuration
app.use(cors({
  origin: [
    'https://ai-playground-lyart.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection with retry logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
  };

  // Add SSL options only if connecting to MongoDB Atlas (cloud)
  if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb.net')) {
    mongoOptions.ssl = true;
    mongoOptions.sslValidate = false;
    mongoOptions.tlsAllowInvalidCertificates = true;
    mongoOptions.tlsAllowInvalidHostnames = true;
  }

  mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
    mongoOptions,
  ).catch(err => {
    console.error('MongoDB connection failed, retrying in 5 seconds...', err.message);
    console.error('Connection error details:', {
      name: err.name,
      code: err.code,
      reason: err.reason
    });
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  console.error("Error details:", {
    name: err.name,
    message: err.message,
    code: err.code,
    reason: err.reason
  });
});
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Redis connection with retry logic
console.log("Using Redis URL:", process.env.REDIS_URL);
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith("rediss://"),
    connectTimeout: 10000,
    lazyConnect: true,
  },
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('Redis server refused connection');
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      console.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    // Retry Redis connection after 5 seconds
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

app.set("redisClient", redisClient);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/sessions", sessionsRouter);
app.use("/ai", aiRouter);

module.exports = app;
