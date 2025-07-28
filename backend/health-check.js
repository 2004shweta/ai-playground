#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Verifies that all services are properly configured and running
 */

const mongoose = require("mongoose");
require("dotenv").config();

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(chalk.bold("\n🔍 AI Playground Deployment Health Check"));
console.log("=".repeat(50));

let hasErrors = false;

// Environment Variables Check
console.log(chalk.bold("\n📋 Environment Variables"));
console.log("-".repeat(25));

const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
const optionalVars = ['REDIS_URL', 'NODE_ENV'];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(chalk.green(`✅ ${varName}: configured`));
  } else {
    console.log(chalk.red(`❌ ${varName}: NOT SET (required)`));
    hasErrors = true;
  }
});

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(chalk.green(`✅ ${varName}: configured`));
  } else {
    console.log(chalk.yellow(`⚠️  ${varName}: not set (optional)`));
  }
});

// Database Connection Test
console.log(chalk.bold("\n🗄️  Database Connection"));
console.log("-".repeat(25));

async function testDatabase() {
  if (!process.env.MONGO_URI) {
    console.log(chalk.red("❌ Cannot test database - MONGO_URI not set"));
    return false;
  }

  try {
    console.log(chalk.blue("🔄 Connecting to MongoDB..."));
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log(chalk.green("✅ MongoDB connection successful"));
    
    // Test ping
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log(chalk.green("✅ Database ping successful"));
    
    // Test collections access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(chalk.green(`✅ Found ${collections.length} collections`));
    
    await mongoose.disconnect();
    console.log(chalk.green("✅ Disconnected successfully"));
    
    return true;
    
  } catch (error) {
    console.log(chalk.red("❌ Database connection failed:"));
    console.log(chalk.red(`   ${error.message}`));
    
    if (error.name === 'MongoServerSelectionError') {
      console.log(chalk.yellow("\n💡 Common issues:"));
      console.log("   • MongoDB Atlas cluster is paused or stopped");
      console.log("   • Network access not configured (add 0.0.0.0/0)");
      console.log("   • Incorrect connection string or credentials");
      console.log("   • Firewall blocking the connection");
    }
    
    return false;
  }
}

// JWT Secret Validation
console.log(chalk.bold("\n🔐 JWT Configuration"));
console.log("-".repeat(25));

function testJWT() {
  if (!process.env.JWT_SECRET) {
    console.log(chalk.red("❌ JWT_SECRET not configured"));
    return false;
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    console.log(chalk.yellow("⚠️  JWT_SECRET is less than 32 characters (recommended minimum)"));
  } else {
    console.log(chalk.green("✅ JWT_SECRET properly configured"));
  }
  
  return true;
}

// Port Configuration
console.log(chalk.bold("\n🌐 Server Configuration"));
console.log("-".repeat(25));

function testServerConfig() {
  const port = process.env.PORT || 3000;
  console.log(chalk.green(`✅ Server will run on port: ${port}`));
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(chalk.green(`✅ Environment: ${nodeEnv}`));
  
  return true;
}

// Main execution
async function runHealthCheck() {
  try {
    const jwtOk = testJWT();
    const serverOk = testServerConfig();
    const dbOk = await testDatabase();
    
    console.log(chalk.bold("\n📊 Summary"));
    console.log("=".repeat(50));
    
    if (hasErrors || !dbOk || !jwtOk) {
      console.log(chalk.red("❌ Health check FAILED"));
      console.log(chalk.yellow("\n🔧 Action required:"));
      
      if (hasErrors) {
        console.log("   • Set missing environment variables");
      }
      if (!dbOk) {
        console.log("   • Fix database connection issues");
      }
      if (!jwtOk) {
        console.log("   • Configure JWT_SECRET");
      }
      
      console.log(chalk.yellow("\n📚 For Render.com deployment:"));
      console.log("   1. Go to your service dashboard");
      console.log("   2. Navigate to Environment section");
      console.log("   3. Add the missing environment variables");
      console.log("   4. Redeploy the service");
      
      process.exit(1);
    } else {
      console.log(chalk.green("✅ All checks passed! Deployment should work correctly."));
      console.log(chalk.blue("\n🚀 Your AI Playground backend is ready to go!"));
      process.exit(0);
    }
    
  } catch (error) {
    console.log(chalk.red("\n💥 Unexpected error during health check:"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n⏹️  Health check interrupted'));
  try {
    await mongoose.disconnect();
  } catch (e) {
    // Silent fail
  }
  process.exit(1);
});

runHealthCheck();
