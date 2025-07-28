#!/usr/bin/env node

/**
 * MongoDB Connection Strategy Test
 * Tests multiple connection approaches for Render.com SSL issues
 */

const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔧 MongoDB Connection Strategy Test");
console.log("===================================");

if (!process.env.MONGO_URI) {
  console.log("❌ MONGO_URI not configured");
  process.exit(1);
}

// Connection strategies in order of preference
const strategies = [
  {
    name: "Standard Atlas (Secure)",
    options: {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      tls: true,
      retryWrites: true
    }
  },
  {
    name: "Render.com Optimized",
    options: {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 25000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      authSource: 'admin',
      retryWrites: true,
      maxPoolSize: 3,
      minPoolSize: 1
    }
  },
  {
    name: "Legacy SSL Support",
    options: {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      ssl: true,
      sslValidate: false,
      authSource: 'admin',
      retryWrites: true
    }
  },
  {
    name: "Minimal TLS",
    options: {
      serverSelectionTimeoutMS: 25000,
      connectTimeoutMS: 25000,
      tls: true,
      authSource: 'admin'
    }
  }
];

async function testStrategy(strategy) {
  console.log(`\n🧪 Testing: ${strategy.name}`);
  console.log("━".repeat(40));
  console.log("Options:", JSON.stringify(strategy.options, null, 2));
  
  try {
    console.log("⏳ Connecting...");
    await mongoose.connect(process.env.MONGO_URI, strategy.options);
    
    console.log("✅ Connection successful!");
    
    // Test database operations
    const admin = mongoose.connection.db.admin();
    const pingResult = await admin.ping();
    console.log("✅ Database ping:", pingResult);
    
    // Test collection access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Collections accessible: ${collections.length} found`);
    
    await mongoose.disconnect();
    console.log("✅ Disconnected cleanly");
    
    return strategy;
    
  } catch (error) {
    console.log("❌ Failed:", error.message);
    
    // Error categorization
    if (error.message.includes('tlsInsecure')) {
      console.log("   → SSL option conflict detected");
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log("   → SSL/TLS handshake issue");
    } else if (error.message.includes('authentication')) {
      console.log("   → Authentication problem");
    } else if (error.message.includes('timeout') || error.message.includes('selection')) {
      console.log("   → Network/timeout issue");
    }
    
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Silent cleanup
    }
    
    return null;
  }
}

async function findWorkingStrategy() {
  console.log("🚀 Testing connection strategies...\n");
  
  for (const strategy of strategies) {
    const result = await testStrategy(strategy);
    if (result) {
      console.log(`\n🎉 SUCCESS! "${result.name}" works perfectly!`);
      console.log("\n📋 Use these settings in your app.js:");
      console.log("```javascript");
      console.log("mongoOptions = " + JSON.stringify(result.options, null, 2));
      console.log("```");
      return true;
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n❌ All strategies failed!");
  console.log("\n🔧 Troubleshooting steps:");
  console.log("1. Check MongoDB Atlas cluster status");
  console.log("2. Verify network access settings (0.0.0.0/0)");
  console.log("3. Confirm database user permissions");
  console.log("4. Test connection string locally");
  
  return false;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Test interrupted');
  try {
    await mongoose.disconnect();
  } catch (e) {
    // Silent fail
  }
  process.exit(1);
});

// Run the test
findWorkingStrategy().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Unexpected error:', error.message);
  process.exit(1);
});
