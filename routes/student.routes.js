import dotenv from "dotenv";
import { Router } from "express";
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
 * /api/v1/student:
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
router.get("/student", auth, isStudent, student);

/**
 * @swagger
 * /api/v1/message/{id}:
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

export default router;
