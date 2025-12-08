import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Worker } from "bullmq";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import https from "https";
import http from "http";
import { ChromaClient } from "./config/chromadb.config.js";
import client from "./config/redis.config.js";

console.log("🚀 Worker starting...");

// Helper function to download file from URL
const downloadFile = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    let tempFilePath = null;
    try {
      console.log("📦 Processing job:", job.id);
      const data = job.data;
      
      console.log("📥 Job data:", JSON.stringify(data, null, 2));
      
      // Download file from Cloudinary
      console.log("⬇️  Downloading file from:", data.cloudinaryUrl);
      const fileBuffer = await downloadFile(data.cloudinaryUrl);
      console.log("✅ Downloaded file size:", fileBuffer.length, "bytes");
      
      // Create a temporary file path
      const tempFileName = `temp-${Date.now()}-${data.fileName}`;
      tempFilePath = join(process.cwd(), 'temp', tempFileName);
      
      // Write buffer to temporary file (PDFLoader requires a file path)
      writeFileSync(tempFilePath, fileBuffer);
      console.log("💾 Temporary file created:", tempFilePath);
      
      const loader = new PDFLoader(tempFilePath);
      const docs = await loader.load();
      console.log("📄 PDF loaded, pages found:", docs.length);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 50,
      });
      const splittedDocs = await splitter.splitDocuments(docs);
      console.log("✂️  Documents split into chunks:", splittedDocs.length);
      
      // Create embeddings instance
      console.log("🤖 Starting embedding process...");
      const embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "sentence-transformers/all-mpnet-base-v2",
        modelKwargs: { dtype: "float32", device: "cpu" },
      });
      console.log("✅ Embeddings model loaded");
      
      const chromaClient = new ChromaClient(data.collectionName);
      console.log("🔗 Chroma client created for collection:", data.collectionName);
      
      const vectorStore = await Chroma.fromExistingCollection(
        embeddings,
        chromaClient
      );
      console.log("📚 Vector store initialized");

      const cleanedDocs = splittedDocs.map((doc, index) => ({
        pageContent: doc.pageContent,
        metadata: {
          id: `${data.collectionName}-${index}`,
          source: data.cloudinaryUrl,
          fileName: data.fileName,
          cloudinaryPublicId: data.cloudinaryPublicId,
          pageNumber: doc.metadata?.loc?.pageNumber ?? null,
        },
      }));
      
      await vectorStore.addDocuments(cleanedDocs);
      console.log(`✨ ${data.collectionName} upserted with ${cleanedDocs.length} documents.`);
      
    } catch (error) {
      console.error("❌ Error processing job:", error);
      throw error;
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          unlinkSync(tempFilePath);
          console.log("🗑️  Temporary file deleted:", tempFilePath);
        } catch (err) {
          console.error("⚠️  Error deleting temporary file:", err);
        }
      }
    }
  },
  { 
    connection: client,
    concurrency: 1, // Process one job at a time
    autorun: true, // Auto start processing
  }
);

// Add event listeners for better visibility
worker.on('ready', () => {
  console.log("✅ Worker is ready!");
});

worker.on('error', (err) => {
  console.error("❌ Worker error:", err);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

console.log("⏳ Worker listening on queue 'file-upload-queue'...");

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

export default worker;