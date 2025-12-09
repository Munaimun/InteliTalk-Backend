import dotenv from "dotenv";
import { Router } from "express";
import { signup } from "../controllers/authController.js";
import {
    deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/teacherController.js";
import { auth, isTeacher } from "../middlewares/auth.js";
dotenv.config();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Teacher
 *   description: Operations related to teacher functionalities
 */

/**
 * @swagger
 * /teacher:
 *   get:
 *     summary: Access teacher dashboard
 *     description: Retrieve teacher dashboard with system overview and management options
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed teacher dashboard
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
 *         description: Access forbidden - teacher role required
 */
router.get("/", auth, isTeacher, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Teacher Dashboard",
  });
});

/**
 * @swagger
 * /teacher/student-signup:
 *   post:
 *     summary: Register new student
 *     description: Create a new student account (Teacher only operation)
 *     tags: [Teacher]
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
 *               - studentId
 *               - dept
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
 *               studentId:
 *                 type: string
 *               dept:
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
 *         description: Access forbidden - teacher role required
 */
router.post("/student-signup", auth, isTeacher, signup);

/**
 * @swagger
 * /teacher/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve list of all registered students (Teacher only)
 *     tags: [Teacher]
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
 *         description: Access forbidden - teacher role required
 */
router.get("/students", auth, isTeacher, getStudents);

/**
 * @swagger
 * /teacher/student/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve detailed information of a specific student (Teacher only)
 *     tags: [Teacher]
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
 *         description: Access forbidden - teacher role required
 *       404:
 *         description: User not found
 */
router.get("/student/:id", auth, isTeacher, getStudentById);

/**
 * @swagger
 * /teacher/student/{id}:
 *   put:
 *     summary: Update student information
 *     description: Modify student details and settings (Teacher only)
 *     tags: [Teacher]
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
 *         description: Access forbidden - teacher role required
 *       404:
 *         description: Student not found
 */
router.put("/student/:id", auth, isTeacher, updateStudent);

/**
 * @swagger
 * /teacher/student/{id}:
 *   delete:
 *     summary: Delete student account
 *     description: Permanently remove a student from the system (Teacher only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the student to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden - teacher role required
 *       404:
 *         description: Student not found
 */
router.delete("/student/:id", auth, isTeacher, deleteStudent);

export default router;
