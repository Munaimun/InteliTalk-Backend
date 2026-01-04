// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { Worker } from "bullmq";
// import { writeFileSync, unlinkSync } from "fs";
// import { join } from "path";
// import https from "https";
// import http from "http";
// import { ChromaClient } from "./config/chromadb.config.js";
// import client from "./config/redis.config.js";

// console.log("🚀 Worker starting...");

// // Helper function to download file from URL
// const downloadFile = (url) => {
//   return new Promise((resolve, reject) => {
//     const protocol = url.startsWith('https') ? https : http;
    
//     protocol.get(url, (response) => {
//       if (response.statusCode !== 200) {
//         reject(new Error(`Failed to download file: ${response.statusCode}`));
//         return;
//       }

//       const chunks = [];
//       response.on('data', (chunk) => chunks.push(chunk));
//       response.on('end', () => resolve(Buffer.concat(chunks)));
//       response.on('error', reject);
//     }).on('error', reject);
//   });
// };

// const worker = new Worker(
//   "file-upload-queue",
//   async (job) => {
//     let tempFilePath = null;
//     try {
//       console.log("📦 Processing job:", job.id);
//       const data = job.data;
      
//       console.log("📥 Job data:", JSON.stringify(data, null, 2));
      
//       // Download file from Cloudinary
//       console.log("⬇️  Downloading file from:", data.cloudinaryUrl);
//       const fileBuffer = await downloadFile(data.cloudinaryUrl);
//       console.log("✅ Downloaded file size:", fileBuffer.length, "bytes");
      
//       // Create a temporary file path
//       const tempFileName = `temp-${Date.now()}-${data.fileName}`;
//       tempFilePath = join(process.cwd(), 'temp', tempFileName);
      
//       // Write buffer to temporary file (PDFLoader requires a file path)
//       writeFileSync(tempFilePath, fileBuffer);
//       console.log("💾 Temporary file created:", tempFilePath);
      
//       const loader = new PDFLoader(tempFilePath);
//       const docs = await loader.load();
//       console.log("📄 PDF loaded, pages found:", docs.length);

//       const splitter = new RecursiveCharacterTextSplitter({
//         chunkSize: 1000,
//         chunkOverlap: 50,
//       });
//       const splittedDocs = await splitter.splitDocuments(docs);
//       console.log("✂️  Documents split into chunks:", splittedDocs.length);
      
//       // Create embeddings instance
//       console.log("🤖 Starting embedding process...");
//       const embeddings = new HuggingFaceTransformersEmbeddings({
//         modelName: "sentence-transformers/all-mpnet-base-v2",
//         modelKwargs: { dtype: "float32", device: "cpu" },
//       });
//       console.log("✅ Embeddings model loaded");
      
//       const chromaClient = new ChromaClient(data.collectionName);
//       console.log("🔗 Chroma client created for collection:", data.collectionName);
      
//       const vectorStore = await Chroma.fromExistingCollection(
//         embeddings,
//         chromaClient
//       );
//       console.log("📚 Vector store initialized");

//       const cleanedDocs = splittedDocs.map((doc, index) => ({
//         pageContent: doc.pageContent,
//         metadata: {
//           id: `${data.collectionName}-${index}`,
//           source: data.cloudinaryUrl,
//           fileName: data.fileName,
//           cloudinaryPublicId: data.cloudinaryPublicId,
//           pageNumber: doc.metadata?.loc?.pageNumber ?? null,
//         },
//       }));
      
//       await vectorStore.addDocuments(cleanedDocs);
//       console.log(`✨ ${data.collectionName} upserted with ${cleanedDocs.length} documents.`);
      
//     } catch (error) {
//       console.error("❌ Error processing job:", error);
//       throw error;
//     } finally {
//       // Clean up temporary file
//       if (tempFilePath) {
//         try {
//           unlinkSync(tempFilePath);
//           console.log("🗑️  Temporary file deleted:", tempFilePath);
//         } catch (err) {
//           console.error("⚠️  Error deleting temporary file:", err);
//         }
//       }
//     }
//   },
//   { 
//     connection: client,
//     concurrency: 1, // Process one job at a time
//     autorun: true, // Auto start processing
//   }
// );

// // Add event listeners for better visibility
// worker.on('ready', () => {
//   console.log("✅ Worker is ready!");
// });

// worker.on('error', (err) => {
//   console.error("❌ Worker error:", err);
// });

// worker.on('failed', (job, err) => {
//   console.error(`❌ Job ${job.id} failed:`, err.message);
// });

// worker.on('completed', (job) => {
//   console.log(`✅ Job ${job.id} completed successfully`);
// });

// console.log("⏳ Worker listening on queue 'file-upload-queue'...");

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received, shutting down gracefully...');
//   await worker.close();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   console.log('SIGINT received, shutting down gracefully...');
//   await worker.close();
//   process.exit(0);
// });

// export default worker;
// worker.js
import fs from "fs";
import { join } from "path";
import https from "https";
import http from "http";
import mongoose from "mongoose";

import Job from "./models/job.model.js";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "./config/chromadb.config.js";

console.log("🚀 MongoDB Worker started");

// -------------------
// Helper: download file
// -------------------
const downloadFile = (url) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });

// -------------------
// Core job processor
// -------------------
async function processJob(job) {
  let tempFilePath;

  try {
    const data = job.payload;

    console.log(`📦 Processing job ${job._id}`);

    const buffer = await downloadFile(data.cloudinaryUrl);

    tempFilePath = join(
      process.cwd(),
      "temp",
      `temp-${Date.now()}-${data.fileName}`
    );

    fs.writeFileSync(tempFilePath, buffer);

    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });

    const chunks = await splitter.splitDocuments(docs);

    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "sentence-transformers/all-mpnet-base-v2",
      modelKwargs: { device: "cpu" },
    });

    const chromaClient = new ChromaClient(data.collectionName);

    const vectorStore = await Chroma.fromExistingCollection(
      embeddings,
      chromaClient
    );

    const cleanedDocs = chunks.map((doc, i) => ({
      pageContent: doc.pageContent,
      metadata: {
        id: `${data.collectionName}-${i}`,
        source: data.cloudinaryUrl,
        fileName: data.fileName,
        pageNumber: doc.metadata?.loc?.pageNumber ?? null,
      },
    }));

    await vectorStore.addDocuments(cleanedDocs);

    await Job.updateOne(
      { _id: job._id },
      { status: "completed" }
    );

    console.log(`✅ Job ${job._id} completed`);

  } catch (err) {
    console.error("❌ Job failed:", err.message);

    await Job.updateOne(
      { _id: job._id },
      {
        status: "failed",
        attempts: job.attempts + 1,
        error: err.message,
      }
    );

  } finally {
    if (tempFilePath) fs.unlinkSync(tempFilePath);
  }
}

const POLL_INTERVAL = 5000;

async function poll() {
  const job = await Job.findOneAndUpdate(
    {
      status: "pending",
      attempts: { $lt: 1 }, // 👈 your 1-retry limit
    },
    {
      status: "processing",
      lockedAt: new Date(),
    },
    {
      sort: { createdAt: 1 },
      new: true,
    }
  );

  if (!job) return;

  await processJob(job);
}

setInterval(poll, POLL_INTERVAL);

process.on("SIGTERM", async () => {
  console.log("SIGTERM received");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received");
  await mongoose.disconnect();
  process.exit(0);
});


export default worker;