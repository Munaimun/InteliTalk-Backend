import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { mongoConnect } from "./config/db.js";
import swaggerSpec from "./docs/swagger.js";
import {
  errorhandler,
  globalErrorHandler,
} from "./middlewares/errorHandler.js";
import adminRouter from "./routes/admin.routes.js";
import teacherRouter from "./routes/teacher.routes.js";
import authRouter from "./routes/auth.routes.js";
import guestRouter from "./routes/guest.routes.js";
import studentRouter from "./routes/student.routes.js";
import "./task.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();
const BASE_URL = "/api/v1";

// middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per IP
  legacyHeaders: false,
  standardHeaders: "draft-7",
  skipSuccessfulRequests: true, // Only count failed login attempts
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts from this IP. Please try again after 15 minutes.",
      remainingTime: "15 minutes"
    });
  },
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(`${BASE_URL}/login`, loginLimiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
// logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Route mount with base URL
app.use(BASE_URL, authRouter);
app.use(`${BASE_URL}/admin`, adminRouter);
app.use(`${BASE_URL}/teacher`, teacherRouter);
app.use(`${BASE_URL}/student`, studentRouter);
app.use(`${BASE_URL}/guest`, guestRouter);

app.get("/", (req, res) => {
  res.send("Welcome to InteliTalk API Server");
});

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
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error(`Server failed to start:`, error);
    process.exit(1);
  }
}

startServer();
