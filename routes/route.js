import dotenv from "dotenv";
import express from "express";
import {
  changePassword,
  deleteUser,
  getChat,
  getUser,
  getUsers,
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/authController.js";
import { guest } from "../controllers/guestController.js";
import { student } from "../controllers/studentController.js";
import {
  privateUploadController,
  publicUploadController,
  uploadPDF,
} from "../controllers/uploadController.js";
import { auth, isAdmin, isStudent } from "../middlewares/auth.js";
dotenv.config();
const router = express.Router();

/**
 * @desc protected routes || middlewares or controller to handle it
 * @desc Student Dashboard
 * @route GET "http:localhost:5001/api/v1/student"
 */
router.get("/student", auth, isStudent, student);
/**
 * @desc protected routes || middlewares or controller to handle it
 * @desc Student Chat
 * @route GET "http:localhost:5001/api/v1/message/{{id}}"
 */
router.get("/message/:id", auth, isStudent, getChat);
/**
 * @desc Admin Dashboard
 * @route GET "http:localhost:5001/api/v1/admin"
 */
router.get("/admin", auth, isAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Admin Dashboard",
  });
});
/**
 * @desc SignUp page. Only Admin can register new Student
 * @field name,email,password,confirmPassword,role
 * @route POST "http://localhost:5001/api/v1/signup"
 */
router.post("/signup", auth, isAdmin, signup);
/**
 * @desc Get all user information. Only Admin can view this.
 * @route GET "http://localhost:5001/api/v1/user"
 */
router.get("/user", auth, isAdmin, getUsers);
/**
 * @desc GET Individual User Information. Only Admin can view this.
 * @route GET "http://localhost:5001/api/v1/user/{{id}}"
 */
router.get("/user/:id", auth, isAdmin, getUser);
/**
 * @desc Update user info.Only Admin can do this
 * @route PUT "http://localhost:5001/api/v1/user/{{id}}"
 */
router.put("/user/:id", auth, isAdmin, updateUser);
/**
 * @desc Delete user.Only Admin can do this
 * @route DELETE "http://localhost:5001/api/v1/user/{{id}}"
 */
router.delete("/user/:id", auth, isAdmin, deleteUser);
/**
 * @desc Guest Question Answer
 * @route GET "http://localhost:5001/api/v1/guest"
 */
router.get("/guest", guest);
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

/**
 * @desc Upload PDF
 * @route GET "http://localhost:5001/api/v1/public/upload/pdf"
 */
router.post("/public/upload/pdf", uploadPDF, publicUploadController);

/**
 * @desc Upload PDF
 * @route GET "http://localhost:5001/api/v1/private/upload/pdf"
 */
router.post("/private/upload/pdf", uploadPDF, privateUploadController);

export default router;
