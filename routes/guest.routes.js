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
 * /api/v1/guest:
 *   get:
 *     summary: Guest question and answer service
 *     description: Access public Q&A functionality without authentication
 *     tags: [Guest]
 *     responses:
 *       200:
 *         description: Successfully accessed guest service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get("/guest", guest);

export default router;
