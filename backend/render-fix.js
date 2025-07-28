#!/usr/bin/env node

/**
 * Render.com MongoDB Connection Fix
 * Special script to test and fix MongoDB connections on Render.com
 */

const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔧 Render.com MongoDB Connection Fix");
console.log("=====================================");

// Enhanced connection function specifically for Render.com
async function testRenderConnection() {
  if (!process.env.MONGO_URI) {
    console.log("❌ MONGO_URI not configured");
    return false;
  }

  console.log("🔍 Analyzing connection string...");
  const mongoUri = process.env.MONGO_URI;
  console.log(`   Type: ${mongoUri.includes('mongodb+srv://') ? 'SRV (Atlas)' : 'Standard'}`);
  console.log(`   Host: ${mongoUri.includes('mongodb.net') ? 'MongoDB Atlas' : 'Other'}`);

  // Test different connection strategies
  const strategies = [
    {
      name: "Standard Atlas Connection",
      options: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        tls: true
      }
    },
    {
      name: "Render.com Optimized (Permissive SSL)",
      options: {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        authSource: 'admin',
        retryWrites: true
      }
    },
    {
      name: "Render.com Alternative (Legacy SSL)",
      options: {
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
        ssl: true,
        sslValidate: false,
        authSource: 'admin',
        retryWrites: true
      }
    }
  ];

  for (const strategy of strategies) {
    console.log(`\n🧪 Testing: ${strategy.name}`);
    console.log("Options:", JSON.stringify(strategy.options, null, 2));
    
    try {
      await mongoose.connect(mongoUri, strategy.options);
      
      console.log("✅ Connection successful!");
      
      // Test a simple operation
      const admin = mongoose.connection.db.admin();
      await admin.ping();
      console.log("✅ Database ping successful!");
      
      await mongoose.disconnect();
      console.log("✅ Disconnected successfully");
      
      console.log(`\n🎉 SUCCESS: "${strategy.name}" works!`);
      console.log("\n📋 Recommended settings for app.js:");
      console.log("mongoOptions = " + JSON.stringify(strategy.options, null, 2));
      
      return true;
      
    } catch (error) {
      console.log("❌ Failed:", error.message);
      
      if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.log("   → SSL/TLS issue detected");
      }
      if (error.message.includes('authentication')) {
        console.log("   → Authentication issue detected");
      }
      if (error.message.includes('timeout') || error.message.includes('selection')) {
        console.log("   → Timeout/network issue detected");
      }
      
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Silent fail
      }
    }
  }
  
  console.log("\n❌ All connection strategies failed");
  console.log("\n🔧 Troubleshooting recommendations:");
  console.log("1. Check MongoDB Atlas cluster status");
  console.log("2. Verify Network Access settings (allow 0.0.0.0/0)");
  console.log("3. Check database user permissions");
  console.log("4. Ensure connection string is correct");
  
  return false;
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Test interrupted');
  try {
    await mongoose.disconnect();
  } catch (e) {
    // Silent fail
  }
  process.exit(1);
});

testRenderConnection().then(success => {
  process.exit(success ? 0 : 1);
});
