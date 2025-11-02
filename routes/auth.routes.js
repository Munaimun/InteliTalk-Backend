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
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization management
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user credentials and generate access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized - incorrect email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: User logout
 *     description: Invalidate user session and clear authentication token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/logout", logout);

/**
 * @swagger
 * /change-password:
 *   post:
 *     summary: Change user password
 *     description: Update authenticated user's password with new credentials
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data or passwords don't match
 *       401:
 *         description: Unauthorized - current password incorrect
 *       403:
 *         description: Access forbidden - authentication required
 *       500:
 *         description: Internal server error
 */
router.post("/change-password", auth, changePassword);

export default router;
