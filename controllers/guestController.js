import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "../config/chromadb.config.js";
import { getEmbeddings } from "../config/embeddings.config.js";
import { openaiClient } from "../config/llm.config.js";
import { systemPrompt } from "../config/rag.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  ServiceUnavailableError,
  ValidationError,
} from "../middlewares/customErrors.js";
const chromaConfig = new ChromaClient("guest_collection");

const GROQ_MODEL_CANDIDATES = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-20b",
].filter(Boolean);

const buildFallbackAnswer = (question, contextDocs = []) => {
  const normalized = String(question).trim().toLowerCase();
  const isGreeting = /^(hi|hello|hey|assalamu alaikum|salam)\b/.test(
    normalized
  );

  if (isGreeting) {
    return "Hello! How can I help you today?";
  }

  if (Array.isArray(contextDocs) && contextDocs.length > 0) {
    const snippets = contextDocs
      .map((doc) => doc?.pageContent)
      .filter(Boolean)
      .slice(0, 2)
      .map((text) =>
        text.length > 280 ? `${text.slice(0, 280)}...` : text
      );

    if (snippets.length > 0) {
      return `I am currently having trouble generating a full AI response. Here is relevant information from the knowledge base:\n\n- ${snippets.join(
        "\n- "
      )}`;
    }
  }

  return "I am temporarily unable to generate an answer right now. Please try again in a moment.";
};

const generateWithModelFallback = async (question, systemPromptText) => {
  let lastError;

  for (const model of GROQ_MODEL_CANDIDATES) {
    try {
      const chatResult = await openaiClient.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: systemPromptText,
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

      const content = chatResult?.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Guest model fallback failed for ${model}:`, error.message);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new ServiceUnavailableError("No available LLM model could generate a response");
};

export const guest = asyncHandler(async (req, res) => {
  const question = req.query.question;

  if (!question) {
    throw new ValidationError("Question parameter is required");
  }

  let contextDocs = [];

  // Try context retrieval, but don't fail the entire request if vector retrieval is down.
  try {
    const embeddings = await getEmbeddings();
    const vectorStore = await Chroma.fromExistingCollection(
      embeddings,
      chromaConfig
    );

    const guestChain = vectorStore.asRetriever({
      k: 2,
    });

    if (!guestChain) {
      throw new ServiceUnavailableError("AI Service temporarily unavailable");
    }

    contextDocs = await guestChain.invoke(question);
  } catch (error) {
    console.warn("Guest context retrieval failed:", error.message);
  }

  const sysPrompt = systemPrompt(contextDocs);

  let finalAnswer;
  try {
    finalAnswer = await generateWithModelFallback(question, sysPrompt);
  } catch (error) {
    console.warn("Guest LLM generation failed, returning fallback answer:", error.message);
    finalAnswer = buildFallbackAnswer(question, contextDocs);
  }

  res.status(200).json({
    success: true,
    message: "Answer is given",
    ans: finalAnswer,
  });
});
