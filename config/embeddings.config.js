import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

/**
 * Singleton pattern for HuggingFace embeddings model.
 * The model is loaded once at startup and reused across all requests
 * to avoid expensive re-initialization on every request.
 */

let embeddingsInstance = null;
let isInitializing = false;
let initPromise = null;

const MODEL_CONFIG = {
  modelName: "sentence-transformers/all-mpnet-base-v2",
  modelKwargs: { dtype: "float32", device: "cpu" },
};

/**
 * Get the singleton embeddings instance.
 * Thread-safe initialization ensures the model is only loaded once.
 * @returns {Promise<HuggingFaceTransformersEmbeddings>}
 */
export const getEmbeddings = async () => {
  // Return existing instance if available
  if (embeddingsInstance) {
    return embeddingsInstance;
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // Start initialization
  isInitializing = true;
  initPromise = initializeEmbeddings();

  try {
    embeddingsInstance = await initPromise;
    return embeddingsInstance;
  } finally {
    isInitializing = false;
  }
};

/**
 * Initialize the embeddings model
 * @returns {Promise<HuggingFaceTransformersEmbeddings>}
 */
const initializeEmbeddings = async () => {
  console.log("🔄 Initializing HuggingFace embeddings model...");
  const startTime = Date.now();

  try {
    const embeddings = new HuggingFaceTransformersEmbeddings(MODEL_CONFIG);

    // Pre-warm the model by generating a test embedding
    await embeddings.embedQuery("warmup");

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Embeddings model initialized successfully in ${duration}s`);

    return embeddings;
  } catch (error) {
    console.error("❌ Failed to initialize embeddings model:", error);
    throw error;
  }
};

/**
 * Pre-initialize embeddings at server startup (optional but recommended)
 */
export const preloadEmbeddings = async () => {
  try {
    await getEmbeddings();
    console.log("✅ Embeddings pre-loaded and ready for requests");
  } catch (error) {
    console.error("⚠️ Failed to pre-load embeddings:", error.message);
    // Don't throw - allow server to start, embeddings will load on first request
  }
};
