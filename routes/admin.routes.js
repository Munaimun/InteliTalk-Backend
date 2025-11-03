import dotenv from "dotenv";
import { Router } from "express";
import { deleteUser, getUsers } from "../controllers/adminController.js";
import { getUser, signup, updateUser } from "../controllers/authController.js";
import {
  privateUploadController,
  publicUploadController,
  uploadPDF,
} from "../controllers/uploadController.js";
import { auth, isAdmin } from "../middlewares/auth.js";
dotenv.config();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations for user and system management
 */

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Access admin dashboard
 *     description: Retrieve admin dashboard with system overview and management options
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed admin dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 */
router.get("/", auth, isAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Admin Dashboard",
  });
});

/**
 * @swagger
 * /admin/signup:
 *   post:
 *     summary: Register new student
 *     description: Create a new student account (Admin only operation)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student account created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 */
router.post("/signup", auth, isAdmin, signup);

/**
 * @swagger
 * /admin/user:
 *   get:
 *     summary: Get all users
 *     description: Retrieve list of all registered users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 */
router.get("/user", auth, isAdmin, getUsers);

/**
 * @swagger
 * /admin/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed information of a specific user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 *       404:
 *         description: User not found
 */
router.get("/user/:id", auth, isAdmin, getUser);

/**
 * @swagger
 * /admin/user/{id}:
 *   put:
 *     summary: Update user information
 *     description: Modify user details and settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 *       404:
 *         description: User not found
 */
router.put("/user/:id", auth, isAdmin, updateUser);

/**
 * @swagger
 * /admin/user/{id}:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently remove a user from the system (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 *       404:
 *         description: User not found
 */
router.delete("/user/:id", auth, isAdmin, deleteUser);

/**
 * @swagger
 * /admin/public/upload/pdf:
 *   post:
 *     summary: Upload PDF to public storage
 *     description: Upload PDF documents to public accessible storage (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF uploaded successfully to public storage
 *       400:
 *         description: Invalid file format or missing file
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 */
router.post(
  "/public/upload/pdf",
  auth,
  isAdmin,
  uploadPDF,
  publicUploadController
);

/**
 * @swagger
 * /admin/private/upload/pdf:
 *   post:
 *     summary: Upload PDF to private storage
 *     description: Upload PDF documents to private secure storage (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF uploaded successfully to private storage
 *       400:
 *         description: Invalid file format or missing file
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - admin role required
 */
router.post(
  "/private/upload/pdf",
  auth,
  isAdmin,
  uploadPDF,
  privateUploadController
);

export default router;
