import { Queue } from "bullmq";
import multer from "multer";
import client from "../config/redis.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const queue = new Queue("file-upload-queue", {
  connection: client,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const uploadPDF = upload.single("pdf");

const publicUploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Add file processing job to the queue
  await queue.add(
    "public-process-file",
    JSON.stringify({
      fileName: req.file.filename,
      destination: req.file.destination,
      path: req.file.path,
      collectionName: "guest_collection",
    })
  );
  res.status(200).json({ message: "File uploaded successfully" });
});

const privateUploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Add file processing job to the queue
  await queue.add(
    "private-process-file",
    JSON.stringify({
      fileName: req.file.filename,
      destination: req.file.destination,
      path: req.file.path,
      collectionName: "student_collection",
    })
  );
  res.status(200).json({ message: "File uploaded successfully" });
});

export { privateUploadController, publicUploadController, uploadPDF };
