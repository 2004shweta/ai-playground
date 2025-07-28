#!/usr/bin/env node

const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔍 Quick Database Connection Test");
console.log("=====================================");

// Check environment variables
console.log("✅ Environment Check:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? 'configured' : 'NOT SET'}`);

if (!process.env.MONGO_URI) {
  console.log("❌ MONGO_URI is not set!");
  console.log("   Please set your MongoDB connection string in the environment variables.");
  console.log("   For Render.com, add it in your service's Environment Variables.");
  process.exit(1);
}

const testConnection = async () => {
  console.log("\n🚀 Testing Connection...");
  
  try {
    // Simple connection with minimal options
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log("✅ Database connected successfully!");
    
    // Test a simple operation
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log("✅ Database ping successful:", result);
    
    // List collections to verify access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log("✅ Disconnected successfully");
    
    console.log("\n🎉 All tests passed! Database connection is working.");
    process.exit(0);
    
  } catch (error) {
    console.log("\n❌ Connection failed:");
    console.log(`   Error: ${error.message}`);
    console.log(`   Name: ${error.name}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log("\n💡 Troubleshooting tips:");
      console.log("   1. Check if your MongoDB Atlas cluster is running");
      console.log("   2. Verify your IP address is whitelisted (0.0.0.0/0 for all IPs)");
      console.log("   3. Ensure your database user has proper permissions");
      console.log("   4. Check if the connection string includes the correct password");
    }
    
    if (error.message.includes('authentication')) {
      console.log("\n💡 Authentication issue:");
      console.log("   - Check your database username and password");
      console.log("   - Ensure the user exists in the correct database");
    }
    
    process.exit(1);
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await mongoose.disconnect();
  process.exit(0);
});

testConnection();
