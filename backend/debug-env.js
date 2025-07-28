require("dotenv").config();

console.log("=== Environment Variables Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("REDIS_URL:", process.env.REDIS_URL ? "SET" : "NOT SET");

if (process.env.MONGO_URI) {
  console.log("\n=== MongoDB URI Analysis ===");
  const mongoUri = process.env.MONGO_URI;
  console.log("URI length:", mongoUri.length);
  console.log("Is Atlas (mongodb.net):", mongoUri.includes('mongodb.net'));
  console.log("Has SSL (mongodb+srv):", mongoUri.includes('mongodb+srv'));
  console.log("First 50 chars:", mongoUri.substring(0, 50) + "...");
}

console.log("\n=== JWT Secret Analysis ===");
if (process.env.JWT_SECRET) {
  console.log("JWT_SECRET length:", process.env.JWT_SECRET.length);
  console.log("First 10 chars:", process.env.JWT_SECRET.substring(0, 10) + "...");
} else {
  console.log("JWT_SECRET is not set - this will cause authentication to fail!");
}

console.log("\n=== Redis URL Analysis ===");
if (process.env.REDIS_URL) {
  console.log("Redis URL length:", process.env.REDIS_URL.length);
  console.log("Is SSL (rediss://):", process.env.REDIS_URL.includes('rediss://'));
  console.log("First 30 chars:", process.env.REDIS_URL.substring(0, 30) + "...");
} else {
  console.log("REDIS_URL is not set");
}

console.log("\n=== Recommendations ===");
if (!process.env.JWT_SECRET) {
  console.log("❌ JWT_SECRET is missing - this is required for authentication");
}
if (!process.env.MONGO_URI) {
  console.log("❌ MONGO_URI is missing - this is required for database connection");
}
if (!process.env.REDIS_URL) {
  console.log("⚠️  REDIS_URL is missing - this may cause session issues");
}

console.log("\n=== End Debug ==="); 