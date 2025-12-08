import { Queue } from "bullmq";
import multer from "multer";
import {Readable} from "stream";
import cloudinary from "../config/cloudinary.config.js";
import client from "../config/redis.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const queue = new Queue("file-upload-queue", {
  connection: client,
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   },
// });

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, limits:{
  fieldSize: 10 * 1024 * 1024
},fileFilter: (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  }else
  {
    cb(new Error("Only PDF files are allowed"));
  }
}});

const uploadPDF = upload.single("pdf");

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, fileName, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // For PDFs
        folder: folder,
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`, // Remove extension
        use_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};



const publicUploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try{
     // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'public-pdfs'
    );
      // Add file processing job to the queue
  await queue.add(
    "public-process-file",
    {
      fileName: req.file.originalname,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      size: result.bytes,
      format: result.format,
      collectionName: "guest_collection",
    }
  );
  res.status(200).json({ 
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      url: result.secure_url,
      size: result.bytes
    });
  }catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ 
      message: "Failed to upload file to cloud storage",
      error: error.message 
    });
  }

 
});

const privateUploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
    try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'private-pdfs'
    );

    // Add file processing job to the queue
    await queue.add(
      "private-process-file",
      {
        fileName: req.file.originalname,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        size: result.bytes,
        format: result.format,
        collectionName: "student_collection",
      }
    );

    res.status(200).json({ 
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      url: result.secure_url,
      size: result.bytes
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ 
      message: "Failed to upload file to cloud storage",
      error: error.message 
    });
  }
});

export { privateUploadController, publicUploadController, uploadPDF };
