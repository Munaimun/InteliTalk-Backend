import { asyncHandler } from "../middlewares/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import validator from "validator";
import mongoose from "mongoose";
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from "../middlewares/customErrors.js";

const getStudents = asyncHandler(async (req, res) => {
  // Get teacher's information to filter students by department
  const teacher = await userModel.findById(req.user.id);
  
  if (!teacher) {
    throw new NotFoundError("Teacher not found");
  }

  // Extract pagination and sorting parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "name";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  // Use aggregation to find students from the same department
  const students = await userModel.aggregate([
    {
      $match: {
        role: "Student",
        dept: teacher.dept, // Filter by teacher's department
      },
    },
    {
      $sort: { [sortBy]: sortOrder },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        password: 0, // Exclude password field
      },
    },
  ]);

  // Get total count for pagination
  const totalCount = await userModel.countDocuments({
    role: "Student",
    dept: teacher.dept,
  });

  return res.status(200).json({
    success: true,
    data: students,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalStudents: totalCount,
      studentsPerPage: limit,
    },
  });
});

const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get teacher's information to verify department access
  const teacher = await userModel.findById(req.user.id);
  
  if (!teacher) {
    throw new NotFoundError("Teacher not found");
  }

  // Use aggregation to find student and verify department match
  const students = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        role: "Student",
        dept: teacher.dept, // Ensure student is from teacher's department
      },
    },
    {
      $project: {
        password: 0, // Exclude password
      },
    },
  ]);

  const student = students[0];

  if (!student) {
    throw new NotFoundError(
      "Student not found or does not belong to your department"
    );
  }

  return res.status(200).json({
    success: true,
    data: student,
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, studentId, dept } = req.body;

  // Get teacher's information to verify department access
  const teacher = await userModel.findById(req.user.id);
  
  if (!teacher) {
    throw new NotFoundError("Teacher not found");
  }

  // checking input field is not empty
  const checkField =
    validator.isEmpty(name) ||
    validator.isEmpty(email) ||
    validator.isEmpty(dept) ||
    validator.isEmpty(studentId);

  if (checkField) {
    throw new ValidationError("All required fields must be filled");
  }

  // checking valid email address
  if (!validator.isEmail(email)) {
    throw new ValidationError("Please provide a valid email address");
  }

  // Verify student exists and belongs to teacher's department using aggregation
  const existingStudents = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        role: "Student",
        dept: teacher.dept,
      },
    },
  ]);

  if (existingStudents.length === 0) {
    throw new AuthorizationError(
      "Student not found or does not belong to your department"
    );
  }

  // Ensure updated department matches teacher's department
  if (dept !== teacher.dept) {
    throw new AuthorizationError(
      "You can only update students within your department"
    );
  }

  const updatedStudent = await userModel.findOneAndUpdate(
    { _id: id, role: "Student", dept: teacher.dept },
    { name: name, email: email, studentId: studentId, dept: dept },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedStudent) {
    throw new NotFoundError("Student update failed");
  }

  return res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: updatedStudent,
  });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get teacher's information to verify department access
  const teacher = await userModel.findById(req.user.id);
  
  if (!teacher) {
    throw new NotFoundError("Teacher not found");
  }

  // Use aggregation to verify student exists and belongs to teacher's department
  const students = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        role: "Student",
        dept: teacher.dept,
      },
    },
  ]);

  if (students.length === 0) {
    throw new AuthorizationError(
      "Student not found or does not belong to your department"
    );
  }

  const deletedStudent = await userModel.findOneAndDelete({
    _id: id,
    role: "Student",
    dept: teacher.dept,
  });

  if (!deletedStudent) {
    throw new NotFoundError("Failed to delete student");
  }

  return res.status(200).json({
    success: true,
    message: "Student deleted successfully",
    data: {
      deletedStudentId: id,
      name: deletedStudent.name,
    },
  });
});


// Get department statistics using aggregation
const getDepartmentStats = asyncHandler(async (req, res) => {
  // Get teacher's information
  const teacher = await userModel.findById(req.user.id);
  
  if (!teacher) {
    throw new NotFoundError("Teacher not found");
  }

  // Use aggregation to get comprehensive department statistics
  const stats = await userModel.aggregate([
    {
      $match: {
        role: "Student",
        dept: teacher.dept,
      },
    },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        recentStudents: [
          { $sort: { _id: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: 1,
              email: 1,
              studentId: 1,
              dept: 1,
            },
          },
        ],
        departmentInfo: [
          {
            $group: {
              _id: "$dept",
              totalStudents: { $sum: 1 },
              students: {
                $push: {
                  name: "$name",
                  studentId: "$studentId",
                  email: "$email",
                },
              },
            },
          },
        ],
      },
    },
  ]);

  const result = stats[0];
  const totalStudents = result.totalCount[0]?.count || 0;

  return res.status(200).json({
    success: true,
    data: {
      department: teacher.dept,
      totalStudents: totalStudents,
      recentStudents: result.recentStudents,
      departmentInfo: result.departmentInfo[0] || {},
    },
  });
});

export { getStudents, getStudentById, updateStudent, deleteStudent, getDepartmentStats };