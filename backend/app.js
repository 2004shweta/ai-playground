var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, '.env') });

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
    'http://localhost:3001',
    'http://localhost:3002'
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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Database connection check middleware
app.use((req, res, next) => {
  // Skip database check for health and test endpoints
  if (req.path === '/health' || req.path === '/test' || req.path === '/') {
    return next();
  }
  
  // Check if MongoDB is connected
  if (!isConnected && mongoose.connection.readyState !== 1) {
    console.log(`Database not ready. State: ${mongoose.connection.readyState}`);
    return res.status(503).json({ 
      error: "Database connection not ready. Please try again in a few moments.",
      retryAfter: 5
    });
  }
  
  next();
});

// MongoDB connection with retry logic
let isConnected = false;
let connectionAttempts = 0;
const maxRetryAttempts = 10;

const connectWithRetry = () => {
  if (connectionAttempts >= maxRetryAttempts) {
    console.error(`Failed to connect to MongoDB after ${maxRetryAttempts} attempts. Giving up.`);
    return;
  }

  console.log(`Attempting to connect to MongoDB (attempt ${connectionAttempts + 1}/${maxRetryAttempts})...`);
  connectionAttempts++;
  
  // Enhanced connection options to handle SSL/TLS issues
  const mongoOptions = {
    // Connection timeout settings
    serverSelectionTimeoutMS: 30000, // Increased timeout
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    
    // Buffer settings (corrected option name)
    bufferCommands: false,
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 1,
    
    // SSL/TLS settings for Atlas connections
    tls: true,
    tlsInsecure: false, // Keep secure but try different approaches
    
    // Additional stability options
    heartbeatFrequencyMS: 10000,
    serverMonitoringMode: 'auto'
  };

  // For production environments, try relaxed TLS settings if standard fails
  if (process.env.NODE_ENV === 'production' || connectionAttempts > 3) {
    mongoOptions.tlsAllowInvalidCertificates = true;
    mongoOptions.tlsAllowInvalidHostnames = true;
    console.log('Using relaxed TLS settings due to connection issues...');
  }

  console.log("Connection options:", mongoOptions);
  console.log("MONGO_URI type:", typeof process.env.MONGO_URI);
  console.log("MONGO_URI length:", process.env.MONGO_URI ? process.env.MONGO_URI.length : 0);

  mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
    mongoOptions,
  ).then(() => {
    console.log('MongoDB connection successful!');
    isConnected = true;
    connectionAttempts = 0; // Reset counter on success
  }).catch(err => {
    console.error('MongoDB connection failed, retrying in 10 seconds...', err.message);
    console.error('Connection error details:', {
      name: err.name,
      code: err.code,
      reason: err.reason,
      codeName: err.codeName
    });
    isConnected = false;
    
    // Exponential backoff: wait longer between retries
    const retryDelay = Math.min(10000 * Math.pow(1.5, connectionAttempts - 1), 60000);
    setTimeout(connectWithRetry, retryDelay);
  });
};

connectWithRetry();
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
  isConnected = true;
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  console.error("Error details:", {
    name: err.name,
    message: err.message,
    code: err.code,
    reason: err.reason
  });
  isConnected = false;
});
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
  isConnected = false;
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
