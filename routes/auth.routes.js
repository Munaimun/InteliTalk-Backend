import dotenv from "dotenv";
import { Router } from "express";

import {
  changePassword,
  login,
  logout,
} from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";
dotenv.config();
const router = Router();

/**
 * @desc Login
 * @field email,password
 * @route GET "http://localhost:5001/api/v1/login"
 */
router.post("/login", login);

/**
 * @desc Logout
 * @route GET "http://localhost:5001/api/v1/logout"
 */
router.post("/logout", logout);

/**
 * @desc Reset Password
 * @route GET "http://localhost:5001/api/v1/reset-password"
 */
router.post("/change-password", auth, changePassword);

export default router;
