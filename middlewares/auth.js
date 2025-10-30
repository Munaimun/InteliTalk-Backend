import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import { AuthenticationError, AuthorizationError } from "./customErrors.js";

export const auth = asyncHandler(async (req, res, next) => {
  // token retrieve from cookies or header
  const authHeader = req.header("Authorization");
  const token =
    req.cookies.token ||
    (authHeader && authHeader.replace("Bearer", "").trim());

  if (!token) {
    throw new AuthenticationError("Access token is missing");
  }

  // verifying token
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = payload;
  next();
});

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    throw new AuthorizationError("Admin access required");
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user.role !== "Student") {
    throw new AuthorizationError("Student access required");
  }
  next();
};
