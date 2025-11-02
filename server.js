import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { mongoConnect } from "./config/db.js";
import {
  errorhandler,
  globalErrorHandler,
} from "./middlewares/errorHandler.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import guestRouter from "./routes/guest.routes.js";
import studentRouter from "./routes/student.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";
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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
app.use("/api/v1", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/guest", guestRouter);

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
