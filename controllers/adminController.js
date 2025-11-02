import dotenv from "dotenv";
import { userModel } from "../models/user.model.js";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { NotFoundError } from "../middlewares/customErrors.js";
dotenv.config();

//  get all users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find({});

  if (!users || users.length === 0) {
    throw new NotFoundError("No users found");
  }

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    user: users,
  });
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // delete user
  const user = await userModel.findByIdAndDelete({ _id: id });

  if (!user) {
    throw new NotFoundError("No user exists with this information");
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
