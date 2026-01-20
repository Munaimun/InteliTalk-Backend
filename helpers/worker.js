import fs from "fs";
import { join } from "path";
import https from "https";
import http from "http";
import mongoose from "mongoose";

import { mongoConnect } from "../config/db.js";
import { getEmbeddings } from "../config/embeddings.config.js";
import Job from "../models/job.model.js";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "../config/chromadb.config.js";

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

    const tempDir = join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = join(tempDir, `temp-${Date.now()}-${data.fileName}`);

    fs.writeFileSync(tempFilePath, buffer);

    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });

    const chunks = await splitter.splitDocuments(docs);

    // Use singleton embeddings instance (loaded once at worker startup)
    const embeddings = await getEmbeddings();

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
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error("⚠️ Error deleting temp file:", err.message);
      }
    }
  }
}

const POLL_INTERVAL = 5000;

// Connect to MongoDB and start polling
(async () => {
  try {
    await mongoConnect();
    console.log("✅ Worker connected to MongoDB");
    setInterval(poll, POLL_INTERVAL);
    // Run immediately on start
    poll();
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
})();

async function poll() {
  try {
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
  } catch (err) {
    console.error("❌ Poll error:", err.message);
  }
}

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