import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { enqueuePdfJob } from "../enqueuePdfJob.js";

// --------------------
// Multer configuration
// --------------------
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fieldSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

const uploadPDF = upload.single("pdf");

// --------------------
// Cloudinary upload helper
// --------------------
const uploadToCloudinary = (buffer, fileName, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder,
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, "")}`,
        use_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// --------------------
// PUBLIC upload controller
// --------------------
const publicUploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    req.file.originalname,
    "public-pdfs"
  );

  // ✅ MongoDB job enqueue
  await enqueuePdfJob({
    fileName: req.file.originalname,
    cloudinaryUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    size: result.bytes,
    format: result.format,
    collectionName: "guest_collection",
  });

  res.status(200).json({
    message: "File uploaded successfully",
    fileName: req.file.originalname,
    url: result.secure_url,
    size: result.bytes,
  });
});

// --------------------
// PRIVATE upload controller
// --------------------
const privateUploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    req.file.originalname,
    "private-pdfs"
  );

  // ✅ MongoDB job enqueue
  await enqueuePdfJob({
    fileName: req.file.originalname,
    cloudinaryUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    size: result.bytes,
    format: result.format,
    collectionName: "student_collection",
  });

  res.status(200).json({
    message: "File uploaded successfully",
    fileName: req.file.originalname,
    url: result.secure_url,
    size: result.bytes,
  });
});

export { uploadPDF, publicUploadController, privateUploadController };
