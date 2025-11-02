import cluster from "cluster";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { cpus } from "os";
import swaggerUi from "swagger-ui-express";
import { mongoConnect } from "./config/db.js";
import swaggerSpec from "./docs/swagger.js";
import {
  errorhandler,
  globalErrorHandler,
} from "./middlewares/errorHandler.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import guestRouter from "./routes/guest.routes.js";
import studentRouter from "./routes/student.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Starting ${numCPUs} worker processes...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    console.log("Starting a new worker...");
    cluster.fork();
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log(
      "Primary process received SIGTERM, shutting down gracefully..."
    );
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });

  process.on("SIGINT", () => {
    console.log("Primary process received SIGINT, shutting down gracefully...");
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });
} else {
  // Worker process
  const app = express();
  const BASE_URL = "/api/v1";

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

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(helmet());
  app.use(`${BASE_URL}/login`, limiter);
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );
  app.use(cookieParser());

  // Route mount with base URL
  app.use(BASE_URL, authRouter);
  app.use(`${BASE_URL}/admin`, adminRouter);
  app.use(`${BASE_URL}/student`, studentRouter);
  app.use(`${BASE_URL}/guest`, guestRouter);

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
    try {
      await mongoConnect();
      app.listen(PORT, () => {
        console.log(
          `Worker ${process.pid} is running on http://localhost:${PORT}`
        );
        console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      });
    } catch (error) {
      console.error(`Worker ${process.pid} failed to start:`, error);
      process.exit(1);
    }
  }

  // Graceful shutdown for worker
  process.on("SIGTERM", () => {
    console.log(
      `Worker ${process.pid} received SIGTERM, shutting down gracefully...`
    );
    process.exit(0);
  });

  startServer();
}
