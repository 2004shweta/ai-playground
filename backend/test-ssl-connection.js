const mongoose = require("mongoose");
const { MongoClient } = require('mongodb');
require("dotenv").config();

console.log("=== MongoDB SSL/TLS Connection Diagnostics ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("Node.js version:", process.version);
console.log("MongoDB driver version:", require('mongodb/package.json').version);
console.log("Mongoose version:", require('mongoose/package.json').version);

const testConnections = async () => {
  const baseUri = process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground";
  
  const connectionConfigs = [
    {
      name: "Standard Atlas connection",
      uri: baseUri,
      options: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        tls: true,
        retryWrites: true
      }
    },
    {
      name: "Relaxed TLS settings",
      uri: baseUri,
      options: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        retryWrites: true
      }
    },
    {
      name: "Native MongoDB client test",
      uri: baseUri,
      options: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true
      },
      useNative: true
    },
    {
      name: "Connection with explicit SSL parameters",
      uri: baseUri.includes('?') ? 
           `${baseUri}&ssl=true&sslValidate=false&connectTimeoutMS=30000` :
           `${baseUri}?ssl=true&sslValidate=false&connectTimeoutMS=30000`,
      options: {
        serverSelectionTimeoutMS: 10000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true
      }
    }
  ];

  for (const config of connectionConfigs) {
    console.log(`\n--- Testing ${config.name} ---`);
    console.log(`URI: ${config.uri.replace(/\/\/[^:]*:[^@]*@/, '//***:***@')}`);
    console.log(`Options:`, JSON.stringify(config.options, null, 2));
    
    try {
      if (config.useNative) {
        // Test with native MongoDB client
        const client = new MongoClient(config.uri, config.options);
        await client.connect();
        console.log(`✅ ${config.name} SUCCESS with native client!`);
        
        const admin = client.db().admin();
        const result = await admin.ping();
        console.log("Ping result:", result);
        
        await client.close();
        console.log("Native client connection closed successfully");
        return true;
      } else {
        // Test with Mongoose
        await mongoose.connect(config.uri, config.options);
        console.log(`✅ ${config.name} SUCCESS with Mongoose!`);
        
        // Test a simple operation
        const admin = mongoose.connection.db.admin();
        const result = await admin.ping();
        console.log("Ping result:", result);
        
        await mongoose.disconnect();
        console.log("Mongoose connection closed successfully");
        return true;
      }
      
    } catch (error) {
      console.log(`❌ ${config.name} FAILED:`);
      console.log("Error message:", error.message);
      console.log("Error name:", error.name);
      console.log("Error code:", error.code);
      console.log("Error cause:", error.cause?.message || 'N/A');
      
      if (error.reason) {
        console.log("Error reason:", {
          type: error.reason.type,
          servers: error.reason.servers ? Array.from(error.reason.servers.keys()) : 'N/A'
        });
      }
      
      // Try to disconnect if connected
      try {
        if (config.useNative) {
          // Native client cleanup is handled in the try block
        } else if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
        }
      } catch (disconnectError) {
        console.log("Disconnect error:", disconnectError.message);
      }
    }
  }
  
  return false; // All failed
};

// Additional network diagnostics
const runNetworkDiagnostics = () => {
  console.log("\n=== Network Diagnostics ===");
  
  // Check if we can resolve the hostname
  const dns = require('dns');
  const url = require('url');
  
  try {
    const parsed = new url.URL(process.env.MONGO_URI);
    const hostname = parsed.hostname;
    console.log("Hostname to resolve:", hostname);
    
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.log("❌ DNS resolution failed:", err.message);
      } else {
        console.log(`✅ DNS resolution successful: ${address} (IPv${family})`);
      }
    });
  } catch (e) {
    console.log("❌ Could not parse MongoDB URI for DNS test");
  }
};

const main = async () => {
  runNetworkDiagnostics();
  
  // Wait a bit for DNS lookup
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = await testConnections();
  
  if (success) {
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } else {
    console.log("\n❌ All connection attempts failed!");
    console.log("\nPossible solutions:");
    console.log("1. Check your IP is whitelisted in MongoDB Atlas");
    console.log("2. Verify your username/password are correct");
    console.log("3. Try connecting from a different network");
    console.log("4. Check if your network has firewall restrictions on port 27017");
    console.log("5. Contact MongoDB Atlas support if the issue persists");
    process.exit(1);
  }
};

main().catch(error => {
  console.error("Test error:", error);
  process.exit(1);
});
