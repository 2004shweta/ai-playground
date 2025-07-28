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

// Add health check endpoint before database middleware
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      state: dbStateNames[dbState] || 'unknown',
      connected: dbState === 1
    },
    uptime: process.uptime()
  });
});

// Database connection check middleware (more lenient)
app.use((req, res, next) => {
  // Skip database check for health and static endpoints
  if (req.path === '/health' || req.path === '/test' || req.path === '/' || req.path.startsWith('/public')) {
    return next();
  }
  
  // Only check for critical database operations
  const dbRequired = req.path.includes('/auth') || req.path.includes('/sessions') || req.path.includes('/users');
  
  if (dbRequired && mongoose.connection.readyState !== 1) {
    console.log(`Database not ready for ${req.path}. State: ${mongoose.connection.readyState}`);
    return res.status(503).json({ 
      error: "Database connection error. Please try again in 5 seconds.",
      retryAfter: 5,
      dbState: mongoose.connection.readyState
    });
  }
  
  next();
});

// MongoDB connection with improved retry logic
let isConnected = false;
let connectionAttempts = 0;
const maxRetryAttempts = 15; // Increased max attempts

const connectWithRetry = () => {
  if (connectionAttempts >= maxRetryAttempts) {
    console.error(`Failed to connect to MongoDB after ${maxRetryAttempts} attempts. Continuing without database...`);
    return;
  }

  console.log(`Attempting to connect to MongoDB (attempt ${connectionAttempts + 1}/${maxRetryAttempts})...`);
  connectionAttempts++;
  
  // Detect if we're on Render.com or other cloud platforms
  const isRenderPlatform = process.env.RENDER || process.env.NODE_ENV === 'production';
  
  // Progressive connection options - optimized for Render.com
  let mongoOptions = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 25000,
    bufferCommands: false,
    maxPoolSize: 3,
    minPoolSize: 1,
  };
  
  // Handle MongoDB Atlas connections with cloud platform considerations
  if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb.net')) {
    mongoOptions.tls = true;
    mongoOptions.retryWrites = true;
    
    // Render.com specific SSL/TLS optimizations
    if (isRenderPlatform || connectionAttempts > 2) {
      // Use either tlsInsecure OR tlsAllowInvalidCertificates, not both
      mongoOptions.tlsAllowInvalidCertificates = true;
      mongoOptions.tlsAllowInvalidHostnames = true;
      mongoOptions.authSource = 'admin';
      console.log('Using cloud platform optimized SSL settings...');
    }
    
    // Additional Render.com specific settings
    if (isRenderPlatform) {
      mongoOptions.directConnection = false;
      mongoOptions.replicaSet = undefined; // Let driver auto-discover
      console.log('Applying Render.com specific connection settings...');
    }
  }
  
  // Special handling for Render.com TLS issues
  let connectionString = process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground";
  
  if (isRenderPlatform && connectionAttempts > 5) {
    console.log('Attempting alternative connection method for Render.com...');
    mongoOptions = {
      ...mongoOptions,
      tls: false, // Disable TLS entirely for this fallback
      ssl: false,
      useUnifiedTopology: true,
      useNewUrlParser: true
    };
    
    // Remove conflicting SSL options
    delete mongoOptions.tlsAllowInvalidCertificates;
    delete mongoOptions.tlsAllowInvalidHostnames;
    delete mongoOptions.tlsInsecure;
    
    // Note: This fallback may not work with Atlas clusters that require SSL
    // But we'll try it as a last resort for Render.com TLS issues
    if (connectionString.includes('mongodb+srv://')) {
      console.log('Note: Attempting non-SRV connection as fallback...');
    }
  }
  
  console.log("Connecting with options:", JSON.stringify(mongoOptions, null, 2));

  mongoose.connect(connectionString, mongoOptions)
    .then(() => {
    console.log('✅ MongoDB connection successful!');
    isConnected = true;
    connectionAttempts = 0; // Reset counter on success
  }).catch(err => {
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}):`, err.message);
    console.error('Connection error details:', {
      name: err.name,
      code: err.code,
      reason: err.reason?.message || err.reason,
      codeName: err.codeName
    });
    isConnected = false;
    
    // Faster retry strategy for cloud platforms
    let retryDelay;
    if (isRenderPlatform) {
      // Render.com specific: faster retries since cold starts are common
      if (connectionAttempts <= 5) {
        retryDelay = 1000; // 1 second for first 5 attempts
      } else if (connectionAttempts <= 10) {
        retryDelay = 3000; // 3 seconds for next 5 attempts  
      } else {
        retryDelay = 8000; // 8 seconds for remaining attempts
      }
    } else {
      // Local/other environments
      if (connectionAttempts <= 3) {
        retryDelay = 2000; // 2 seconds for first few attempts
      } else if (connectionAttempts <= 6) {
        retryDelay = 5000; // 5 seconds for middle attempts
      } else {
        retryDelay = 10000; // 10 seconds for later attempts
      }
    }
    
    console.log(`Retrying in ${retryDelay}ms...`);
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

// Redis connection with improved error handling
console.log("Redis URL configured:", process.env.REDIS_URL ? "YES" : "NO");

let redisClient;
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith("rediss://"),
      connectTimeout: 15000,
      lazyConnect: true,
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.log("Redis max reconnection attempts reached");
          return false; // Stop trying to reconnect
        }
        return Math.min(retries * 50, 500);
      }
    }
  });

  redisClient.on('error', (err) => {
    console.log('Redis Client Error (non-fatal):', err.message);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
  });

  redisClient.on('end', () => {
    console.log('Redis connection ended');
  });

} catch (error) {
  console.error("Redis client creation failed:", error.message);
  redisClient = null;
}

const connectRedis = async () => {
  if (!redisClient || !process.env.REDIS_URL) {
    console.log("Redis not configured or client not available, skipping...");
    return;
  }
  
  try {
    await redisClient.connect();
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.error("❌ Redis connection failed (non-fatal):", error.message);
    // Don't retry aggressively - Redis is optional for basic functionality
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
