const mongoose = require("mongoose");
require("dotenv").config();

console.log("=== MongoDB Connection Test ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");

const testConnections = async () => {
  const connectionStrings = [
    {
      name: "Default connection",
      uri: process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
      options: {}
    },
    {
      name: "With basic options",
      uri: process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
      options: {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }
    },
    {
      name: "With TLS options (if Atlas)",
      uri: process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
      options: {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      }
    }
  ];

  for (const connection of connectionStrings) {
    console.log(`\n--- Testing ${connection.name} ---`);
    
    try {
      await mongoose.connect(connection.uri, connection.options);
      console.log(`✅ ${connection.name} SUCCESS!`);
      
      // Test a simple query
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("Available collections:", collections.map(c => c.name));
      
      await mongoose.disconnect();
      console.log("Connection closed successfully");
      return true; // Success, exit early
      
    } catch (error) {
      console.log(`❌ ${connection.name} FAILED:`);
      console.log("Error:", error.message);
      console.log("Error name:", error.name);
      console.log("Error code:", error.code);
      
      // Try to disconnect if connected
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
        }
      } catch (disconnectError) {
        console.log("Disconnect error:", disconnectError.message);
      }
    }
  }
  
  return false; // All failed
};

testConnections().then(success => {
  if (success) {
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } else {
    console.log("\n❌ All connection attempts failed!");
    process.exit(1);
  }
}).catch(error => {
  console.error("Test error:", error);
  process.exit(1);
}); 