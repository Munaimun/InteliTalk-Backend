import "dotenv/config";
import mongoose from "mongoose";

// Environment variable validation
const MONGO_URL = process.env.MONGODB_URL;

if (!MONGO_URL) {
  console.error("❌ MONGODB_URL environment variable is not defined!");
  console.error("Please check your .env file and ensure MONGODB_URL is set.");
  process.exit(1);
}

// Reconnection configuration
let reconnectionAttempts = 0;
let isShuttingDown = false;
const MAX_RECONNECTION_ATTEMPTS = 10;
const INITIAL_RECONNECTION_DELAY = 1000; // 1 second
const MAX_RECONNECTION_DELAY = 30000; // 30 seconds

// Connection event handlers
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected successfully!");
  console.log(`🔗 Connected to: ${mongoose.connection.name}`);
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
  // Trigger reconnection with exponential backoff
  if (!isShuttingDown) {
    handleReconnection();
  }
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
  // Reset reconnection attempts on successful reconnection
  reconnectionAttempts = 0;
});

// Graceful shutdown handlers
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT. Graceful shutdown...");
  await gracefulShutdown();
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM. Graceful shutdown...");
  await gracefulShutdown();
});

process.on("SIGUSR2", async () => {
  console.log("\n🔄 Received SIGUSR2. Graceful shutdown for restart...");
  await gracefulShutdown();
});

async function gracefulShutdown() {
  try {
    isShuttingDown = true; // Prevent reconnection attempts during shutdown
    await mongoose.connection.close();
    console.log("📴 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// Automatic reconnection with exponential backoff
async function handleReconnection() {
  if (isShuttingDown || reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
    if (reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      console.error(
        `❌ Maximum reconnection attempts (${MAX_RECONNECTION_ATTEMPTS}) reached. Giving up.`
      );
    }
    return;
  }

  reconnectionAttempts++;

  // Calculate delay with exponential backoff: delay = initial * 2^(attempts-1)
  const delay = Math.min(
    INITIAL_RECONNECTION_DELAY * Math.pow(2, reconnectionAttempts - 1),
    MAX_RECONNECTION_DELAY
  );

  console.log(
    `🔄 Attempting to reconnect to MongoDB (attempt ${reconnectionAttempts}/${MAX_RECONNECTION_ATTEMPTS}) in ${delay}ms...`
  );

  setTimeout(async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        // Only reconnect if disconnected
        await mongoose.connect(MONGO_URL);
        console.log("✅ MongoDB reconnected successfully!");
        reconnectionAttempts = 0; // Reset on successful reconnection
      }
    } catch (error) {
      console.error(
        `❌ Reconnection attempt ${reconnectionAttempts} failed:`,
        error.message
      );
      // The 'disconnected' event will trigger another reconnection attempt
    }
  }, delay);
}

export async function mongoConnect() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("📶 Already connected to MongoDB");
      return;
    }

    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(MONGO_URL);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    throw error;
  }
}

export async function mongoDisConnect() {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log("📴 Already disconnected from MongoDB");
      return;
    }

    console.log("🔄 Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("📴 MongoDB disconnected successfully");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
    throw error;
  }
}


