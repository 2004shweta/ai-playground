const mongoose = require("mongoose");
require("dotenv").config();

console.log("Testing MongoDB connection...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");

const testConnection = async () => {
  try {
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    // Add SSL options only if connecting to MongoDB Atlas (cloud)
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb.net')) {
      mongoOptions.ssl = true;
      mongoOptions.sslValidate = false;
      mongoOptions.tlsAllowInvalidCertificates = true;
      mongoOptions.tlsAllowInvalidHostnames = true;
    }

    console.log("Connection options:", mongoOptions);

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/ai-playground",
      mongoOptions,
    );

    console.log("✅ MongoDB connected successfully!");
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log("✅ Connection test completed successfully!");
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
  }
};

testConnection(); 