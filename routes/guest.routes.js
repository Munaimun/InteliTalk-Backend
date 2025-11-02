import dotenv from "dotenv";
import { Router } from "express";
import { guest } from "../controllers/guestController.js";

dotenv.config();

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Guest
 *   description: Public access endpoints for guest users
 */

/**
 * @swagger
 * /guest:
 *   get:
 *     summary: Guest question and answer service
 *     description: Access public Q&A functionality without authentication
 *     tags: [Guest]
 *     parameters:
 *       - in: query
 *         name: question
 *         required: true
 *         description: The question to be asked to the AI system
 *         schema:
 *           type: string
 *           example: "What is machine learning?"
 *     responses:
 *       200:
 *         description: Successfully processed question and returned answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       example: "What is machine learning?"
 *                     answer:
 *                       type: string
 *                       example: "Machine learning is a subset of artificial intelligence..."
 *       400:
 *         description: Bad request - missing or invalid question parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Question parameter is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/", guest);

export default router;
