const { MongoClient } = require('mongodb');
require("dotenv").config();

console.log("=== Simple MongoDB Connection Test ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");

if (process.env.MONGO_URI) {
  console.log("MONGO_URI length:", process.env.MONGO_URI.length);
  console.log("MONGO_URI starts with:", process.env.MONGO_URI.substring(0, 20) + "...");
}

const testSimpleConnection = async () => {
  try {
    console.log("\n--- Testing with MongoDB native driver ---");
    
    // Create a new client with NO options
    const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground");
    
    console.log("Connecting...");
    await client.connect();
    
    console.log("✅ Connection successful!");
    
    // Test a simple operation
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    await client.close();
    console.log("Connection closed successfully");
    
    return true;
    
  } catch (error) {
    console.log("❌ Connection failed:");
    console.log("Error:", error.message);
    console.log("Error name:", error.name);
    console.log("Error code:", error.code);
    
    return false;
  }
};

testSimpleConnection().then(success => {
  if (success) {
    console.log("\n✅ Simple connection test completed successfully!");
    process.exit(0);
  } else {
    console.log("\n❌ Simple connection test failed!");
    process.exit(1);
  }
}).catch(error => {
  console.error("Test error:", error);
  process.exit(1);
}); 