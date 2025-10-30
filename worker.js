import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Worker } from "bullmq";
import { ChromaClient } from "./config/chromadb.config.js";
import client from "./config/redis.config.js";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      console.log("Processing job:");
      const data = JSON.parse(job.data);
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 50,
      });
      const splittedDocs = await splitter.splitDocuments(docs);
      // Create embeddings instance
      console.log("embedding started");
      const embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "sentence-transformers/all-mpnet-base-v2",
        modelKwargs: { dtype: "float32", device: "cpu" },
      });
      const chromaClient = new ChromaClient(data.collectionName);
      console.log("Chroma client created:");
      const vectorStore = await Chroma.fromExistingCollection(
        embeddings,
        chromaClient
      );

      console.log("Vector store already created:");
      const cleanedDocs = splittedDocs.map((doc, index) => ({
        pageContent: doc.pageContent,
        metadata: {
          id: `${data.collectionName}-${index}`,
          source: data.path,
          pageNumber: doc.metadata?.loc?.pageNumber ?? null,
        },
      }));
      await vectorStore.addDocuments(cleanedDocs);
      console.log(`${data.collectionName} upserted with new documents.`);
    } catch (error) {
      console.error("Error processing job:", error);
    }
  },
  { connection: client }
);
