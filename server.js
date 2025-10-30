import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mongoConnect } from "./config/db.js";
import {
  errorhandler,
  globalErrorHandler,
} from "./middlewares/errorHandler.js";
import router from "./routes/route.js";
dotenv.config();
// import job from './cron.js';

const app = express();
const PORT = process.env.PORT || 5001;
// job.start();
// middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  legacyHeaders: false,
  standardHeaders: true,
  message: "Too many request,Please try agin 15 minutes later",
  validate: {
    xForwardedForHeader: false,
  },
});
app.use(helmet());
app.use("/api/v1/login", limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
//  route mount
app.use("/api/v1", router);

// const __dirname = path.join(path.resolve(), "..");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
if (process.env.NODE_ENV === "production") {
  // set static folder
  app.use(express.static(path.join(rootDir, "client", "dist")));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.resolve(rootDir, "client", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Api is running");
  });
}

// Handle undefined routes
app.use("/api", (req, res, next) => {
  // Check if response hasn't been sent (route not found)
  if (!res.headersSent) {
    errorhandler(req, res, next);
  }
});

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// server active
async function startServer() {
  await mongoConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
