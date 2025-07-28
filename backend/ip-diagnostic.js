#!/usr/bin/env node

/**
 * MongoDB Atlas IP Whitelist Diagnostic
 * Helps diagnose and verify IP whitelisting issues
 */

const mongoose = require("mongoose");
const https = require('https');
require("dotenv").config();

console.log("🔍 MongoDB Atlas IP Whitelist Diagnostic");
console.log("==========================================");

// Get current public IP
function getCurrentIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const ip = JSON.parse(data).ip;
          resolve(ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runDiagnostic() {
  console.log("📊 Environment Information");
  console.log("-".repeat(30));
  
  // Check environment
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`RENDER: ${process.env.RENDER || 'not detected'}`);
  console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'configured' : 'NOT SET'}`);
  
  // Get current IP
  try {
    const currentIP = await getCurrentIP();
    console.log(`Current IP: ${currentIP}`);
  } catch (error) {
    console.log(`Current IP: Unable to detect (${error.message})`);
  }
  
  if (!process.env.MONGO_URI) {
    console.log("\n❌ MONGO_URI not configured");
    return false;
  }
  
  console.log("\n🔗 Connection String Analysis");
  console.log("-".repeat(30));
  const mongoUri = process.env.MONGO_URI;
  console.log(`Type: ${mongoUri.includes('mongodb+srv://') ? 'SRV (Atlas)' : 'Standard'}`);
  console.log(`Host: ${mongoUri.includes('mongodb.net') ? 'MongoDB Atlas' : 'Other'}`);
  
  if (mongoUri.includes('mongodb.net')) {
    console.log("\n✅ MongoDB Atlas detected");
    console.log("\n🛠️  Network Access Fix Steps:");
    console.log("1. Go to https://cloud.mongodb.com/");
    console.log("2. Select your project");
    console.log("3. Click 'Network Access' in left sidebar");
    console.log("4. Click '+ ADD IP ADDRESS'");
    console.log("5. Select 'Allow Access from Anywhere'");
    console.log("6. Click 'Confirm'");
    console.log("7. Wait 2-3 minutes for changes to propagate");
  }
  
  console.log("\n🧪 Testing Connection");
  console.log("-".repeat(30));
  
  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  };
  
  try {
    console.log("⏳ Attempting connection...");
    await mongoose.connect(mongoUri, connectionOptions);
    
    console.log("✅ Connection successful!");
    console.log("✅ IP whitelisting is working correctly");
    
    // Test database operations
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log("✅ Database ping successful");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected cleanly");
    
    console.log("\n🎉 All checks passed! Your database connection is working.");
    console.log("Your 503 errors should be resolved now.");
    
    return true;
    
  } catch (error) {
    console.log("❌ Connection failed:");
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('access')) {
      console.log("\n🚨 IP WHITELISTING ISSUE CONFIRMED");
      console.log("\n💡 Fix this by:");
      console.log("   1. Adding 0.0.0.0/0 to MongoDB Atlas Network Access");
      console.log("   2. Or adding Render.com IP ranges:");
      console.log("      - 44.230.48.0/27");
      console.log("      - 3.101.177.48/29");
      console.log("      - 3.101.177.56/29");
      console.log("      - 44.230.48.32/27");
    } else if (error.message.includes('authentication')) {
      console.log("\n🔐 Authentication issue:");
      console.log("   - Check database username/password");
      console.log("   - Verify user has proper permissions");
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log("\n🔒 SSL/TLS issue:");
      console.log("   - This may be resolved after fixing IP whitelisting");
    }
    
    return false;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Diagnostic interrupted');
  try {
    await mongoose.disconnect();
  } catch (e) {
    // Silent fail
  }
  process.exit(1);
});

runDiagnostic().then(success => {
  if (success) {
    console.log("\n✅ Diagnostic completed successfully!");
    process.exit(0);
  } else {
    console.log("\n❌ Issues found - follow the fix steps above");
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Unexpected error:', error.message);
  process.exit(1);
});
