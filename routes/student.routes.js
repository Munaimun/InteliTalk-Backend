import dotenv from "dotenv";
import { Router } from "express";
import { getUserById, updateUser } from "../controllers/authController.js";
import { getChat, student } from "../controllers/studentController.js";
import { auth, isStudent } from "../middlewares/auth.js";
dotenv.config();

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management and chat operations
 */

/**
 * @swagger
 * /student:
 *   get:
 *     summary: Student Chat Dashboard
 *     description: Retrieve student chat dashboard information and available features
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved student dashboard
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
 *         description: Access forbidden - student role required
 */
router.get("/", auth, isStudent, student);

/**
 * @swagger
 * /student/message/{id}:
 *   get:
 *     summary: Retrieve chat messages
 *     description: Get chat conversation history by chat ID for authenticated students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier for the chat conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved chat messages
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
 *         description: Access forbidden - student role required
 *       404:
 *         description: Chat not found
 */
router.get("/message/:id", auth, isStudent, getChat);

/**
 * @swagger
 * /student/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve detailed information of a specific student
 *     tags: [Students]
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
router.get("/:id", auth, isStudent, getUserById);

/**
 * @swagger
 * /student/{id}:
 *   put:
 *     summary: Update student information
 *     description: Modify student details and settings
 *     tags: [Students]
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
 *         description: Student information updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - student role required
 *       404:
 *         description: Student not found
 */
router.put("/:id", auth, isStudent, updateUser);

export default router;
