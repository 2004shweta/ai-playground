require("dotenv").config();

console.log("=== COMPREHENSIVE ISSUE ANALYSIS ===");
console.log("=====================================");

// 1. Environment Analysis
console.log("\n1. ENVIRONMENT VARIABLES:");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("REDIS_URL:", process.env.REDIS_URL ? "SET" : "NOT SET");

if (process.env.MONGO_URI) {
  console.log("\nMONGO_URI Analysis:");
  console.log("- Length:", process.env.MONGO_URI.length);
  console.log("- Starts with:", process.env.MONGO_URI.substring(0, 20) + "...");
  console.log("- Contains 'mongodb.net':", process.env.MONGO_URI.includes('mongodb.net'));
  console.log("- Contains 'mongodb+srv':", process.env.MONGO_URI.includes('mongodb+srv'));
  console.log("- Contains 'mongodb://':", process.env.MONGO_URI.includes('mongodb://'));
  console.log("- Contains '?':", process.env.MONGO_URI.includes('?'));
  console.log("- Contains '&':", process.env.MONGO_URI.includes('&'));
}

// 2. Package Analysis
console.log("\n2. PACKAGE VERSIONS:");
try {
  const packageJson = require('./package.json');
  console.log("Mongoose version:", packageJson.dependencies.mongoose);
  console.log("Node.js version:", process.version);
  console.log("Platform:", process.platform);
  console.log("Architecture:", process.arch);
} catch (error) {
  console.log("Error reading package.json:", error.message);
}

// 3. Test Different Connection Methods
console.log("\n3. CONNECTION METHOD TESTS:");

// Test 1: Basic mongoose connection
console.log("\n--- Test 1: Basic Mongoose Connection ---");
const mongoose = require("mongoose");

try {
  console.log("Attempting basic mongoose connection...");
  mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground")
    .then(() => {
      console.log("✅ Basic mongoose connection SUCCESS!");
      return mongoose.disconnect();
    })
    .then(() => {
      console.log("Connection closed successfully");
    })
    .catch(err => {
      console.log("❌ Basic mongoose connection FAILED:");
      console.log("Error:", err.message);
      console.log("Error name:", err.name);
      console.log("Error code:", err.code);
    });
} catch (error) {
  console.log("❌ Basic mongoose connection ERROR:", error.message);
}

// Test 2: Native MongoDB driver
console.log("\n--- Test 2: Native MongoDB Driver ---");
try {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground");
  
  client.connect()
    .then(() => {
      console.log("✅ Native MongoDB driver connection SUCCESS!");
      return client.close();
    })
    .then(() => {
      console.log("Native connection closed successfully");
    })
    .catch(err => {
      console.log("❌ Native MongoDB driver connection FAILED:");
      console.log("Error:", err.message);
      console.log("Error name:", err.name);
      console.log("Error code:", err.code);
    });
} catch (error) {
  console.log("❌ Native MongoDB driver ERROR:", error.message);
}

// Test 3: Connection with minimal options
console.log("\n--- Test 3: Mongoose with Minimal Options ---");
try {
  const mongoose2 = require("mongoose");
  const options = {
    serverSelectionTimeoutMS: 10000,
  };
  
  mongoose2.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground", options)
    .then(() => {
      console.log("✅ Mongoose with minimal options SUCCESS!");
      return mongoose2.disconnect();
    })
    .then(() => {
      console.log("Minimal options connection closed successfully");
    })
    .catch(err => {
      console.log("❌ Mongoose with minimal options FAILED:");
      console.log("Error:", err.message);
      console.log("Error name:", err.name);
      console.log("Error code:", err.code);
    });
} catch (error) {
  console.log("❌ Mongoose with minimal options ERROR:", error.message);
}

// 4. Recommendations
console.log("\n4. RECOMMENDATIONS:");
console.log("- If MONGO_URI is not set, you need to set it in your environment");
console.log("- If MONGO_URI is set but connections fail, check the connection string format");
console.log("- For MongoDB Atlas, ensure the connection string includes username, password, and database name");
console.log("- Check if your IP address is whitelisted in MongoDB Atlas");
console.log("- Verify that the database user has the correct permissions");

console.log("\n=== ANALYSIS COMPLETE ==="); 