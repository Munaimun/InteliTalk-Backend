import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import validator from "validator";
import { userModel } from "../models/user.model.js";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  AppError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../middlewares/customErrors.js";
dotenv.config();

export let tempPass;
export const signup = asyncHandler(async (req, res) => {
  // getting student info
  let { name, email, studentId, dept, password, confirmPassword, role } =
    req.body;

  // check filed is empty or not
  let checkEmpty =
    validator.isEmpty(name) ||
    validator.isEmpty(email) ||
    validator.isEmpty(role) ||
    validator.isEmpty(dept);

  let passEmpty =
    validator.isEmpty(password) || validator.isEmpty(confirmPassword);

  if (passEmpty) {
    password = "123456";
    confirmPassword = "123456";
  }

  if (!validator.equals(password, confirmPassword)) {
    throw new ValidationError("Password and Confirm Password mismatch");
  }

  if (!validator.isLength(password, { min: 6, max: 32 })) {
    throw new ValidationError("Password must be between 6 and 32 characters");
  }

  tempPass = password;

  if (checkEmpty) {
    throw new ValidationError("All required fields must be filled");
  }

  // email validation
  if (!validator.isEmail(email)) {
    throw new ValidationError("Please provide a valid email address");
  }

  // checking email already registered or not
  const existingEmail = await userModel.findOne({ email });
  if (existingEmail) {
    throw new ConflictError("This email is already registered!");
  }

  if (role === "Student") {
    if (validator.isEmpty(studentId)) {
      throw new ValidationError("Student ID is required for students");
    }

    // checking studentid already registered or not
    const existingId = await userModel.findOne({ studentId });
    if (existingId) {
      throw new ConflictError("This student ID is already registered!");
    }
  }

  // hashing password
  const hashPass = await bcrypt.hash(password, 10);

  // creating user
  const user = await userModel.create({
    name,
    email,
    studentId,
    dept,
    password: hashPass,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  // getting info from request body
  const { email, password } = req.body;

  // validation
  if (validator.isEmpty(email) || validator.isEmpty(password)) {
    throw new ValidationError("Email and password are required");
  }

  // check email is valid or not
  if (!validator.isEmail(email)) {
    throw new ValidationError("Please provide a valid email address");
  }

  let user = await userModel.findOne({ email });
  // check email
  if (!user) {
    throw new NotFoundError("No user found with this email address");
  }

  // check password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AuthenticationError("Invalid email or password");
  }

  // create token
  const payload = {
    id: user._id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  user = user.toObject();
  user.token = token;
  user.password = undefined;

  const options = {
    expires: new Date(Date.now() + 30000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // creating cookie
  res.cookie("token", token, options).status(200).json({
    success: true,
    token,
    user,
    message: "User logged in successfully",
  });
});

// logout user
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

//  get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findOne({ _id: id });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const userData = {
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    dept: user.dept,
    role: user.role,
  };

  res.status(200).json({
    success: true,
    message: "User found",
    userData,
  });
});

// Update User
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, studentId, dept, role } = req.body;

  // checking input field is not empty
  const checkField =
    validator.isEmpty(name) ||
    validator.isEmpty(email) ||
    validator.isEmpty(dept);

  if (checkField) {
    throw new ValidationError("All required fields must be filled");
  }

  if (role === "Student") {
    if (validator.isEmpty(studentId)) {
      throw new ValidationError("Student ID is required for students");
    }
  }

  // checking valid email address
  if (!validator.isEmail(email)) {
    throw new ValidationError("Please provide a valid email address");
  }

  // define user variable
  let user;
  if (role === "Admin" || role === "Teacher") {
    // updating admin information
    user = await userModel.findOneAndUpdate(
      { _id: id },
      { name: name, email: email, dept: dept },
      { new: true }
    );
  }
   else {
    // updating student information
    user = await userModel.findOneAndUpdate(
      { _id: id },
      { name: name, email: email, studentId: studentId, dept: dept },
      { new: true }
    );
  }

  if (!user) {
    throw new NotFoundError("No user exists with this information");
  }

  res.status(200).json({
    success: true,
    message: "User information updated successfully",
    user,
  });
})

// change password
export const changePassword = asyncHandler(async (req, res) => {
  const { password, newPassword } = req.body;

  if (!password || !newPassword) {
    throw new ValidationError("Current password and new password are required");
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isCurrentPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );
  if (!isCurrentPasswordCorrect) {
    throw new AuthenticationError("Current password is incorrect");
  }

  const hashPass = await bcrypt.hash(newPassword, 10);
  const result = await userModel.findByIdAndUpdate(
    { _id: req.user.id },
    { password: hashPass },
    { new: true }
  );

  if (!result) {
    throw new AppError(
      "Password cannot be changed at this moment, please try again later",
      500
    );
  }

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
