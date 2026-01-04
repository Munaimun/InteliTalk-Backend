// import dotenv from "dotenv";
// import { Redis } from "ioredis";

// dotenv.config();

// // Singleton instance - cached by Node.js module system
// let client = null;

// const createRedisClient = () => {
//   if (client) {
//     return client;
//   }

//   client = new Redis(process.env.REDIS_URL, {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: false,
//   });

//   client.on("error", (err) => console.error("Redis error:", err));
//   client.on("connect", () => console.log("Connected to Upstash Redis"));

//   // Test connection
//   (async () => {
//     try {
//       await client.set("test", "connection");
//       console.log("✓ Redis connection verified");
//     } catch (error) {
//       console.error("✗ Redis connection failed:", error);
//     }
//   })();

//   return client;
// };

// // Export the singleton instance
// export default createRedisClient();
