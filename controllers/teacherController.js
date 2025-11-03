import { asyncHandler } from "../middlewares/asyncHandler.js";

const getStudents = asyncHandler(async (req, res) => {
  const students = await userModel.find({ role: "Student" });
  return res.status(200).json({
    success: true,
    data: students,
  });
});

const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await userModel.findById(id);
  if (!student || student.role !== "Student") {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }
  return res.status(200).json({
    success: true,
    data: student,
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, studentId, dept } = req.body;
  const student = await getStudentById(id);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
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

  const updatedStudent = await userModel.findOneAndUpdate(
    { _id: id, role: "Student" },
    { name: name, email: email, studentId: studentId, dept: dept },
    { new: true }
  );

  if (!updatedStudent) {
    return res.status(404).json({
      success: false,
      message: "Student update failed",
    });
  }

  return res.status(200).json({
    success: true,
    data: student,
  });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await getStudentById(id);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  const deletedStudent = await userModel.findByIdAndDelete(id);
  if (!deletedStudent) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete student",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});


export { getStudents, getStudentById, updateStudent, deleteStudent };