import dotenv from "dotenv";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { guest } from "../controllers/guestController.js";

dotenv.config();

const router = Router();

// Rate limiter for guest route: 10 questions per day per IP
const guestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  limit: 10, // 10 requests per IP per day
  legacyHeaders: false,
  standardHeaders: "draft-7",
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Daily question limit reached. You can ask up to 10 questions per day as a guest.",
      remainingTime: "24 hours"
    });
  },
});

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
 *     description: Access public Q&A functionality without authentication (Limited to 10 questions per day per IP)
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
 *       429:
 *         description: Too many requests - daily limit exceeded
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
 *                   example: "Daily question limit reached. You can ask up to 10 questions per day as a guest."
 *                 remainingTime:
 *                   type: string
 *                   example: "24 hours"
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
router.get("/", guestLimiter, guest);

export default router;
