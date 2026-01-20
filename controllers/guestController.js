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

export const guest = asyncHandler(async (req, res) => {
  const question = req.query.question;

  if (!question) {
    throw new ValidationError("Question parameter is required");
  }

  // Use singleton embeddings instance (loaded once at startup)
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
  const ans = await guestChain.invoke(question);

  const sysPrompt = systemPrompt(ans);

  const chatResult = await openaiClient.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: sysPrompt,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  res.status(200).json({
    success: true,
    message: "Answer is given",
    ans: chatResult.choices[0].message.content,
  });
});
