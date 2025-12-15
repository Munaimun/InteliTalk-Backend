import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "../config/chromadb.config.js";
import { openaiClient } from "../config/llm.config.js";
import { systemPrompt } from "../config/rag.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  ServiceUnavailableError,
  ValidationError,
  NotFoundError,
} from "../middlewares/customErrors.js";
import { chatModel } from "../models/chat.model.js";

const chromaConfig = new ChromaClient("student_collection");

export const student = asyncHandler(async (req, res) => {
  const question = req.query.question;

  if (!question) {
    throw new ValidationError("Question parameter is required");
  }

  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "sentence-transformers/all-mpnet-base-v2",
    modelKwargs: { dtype: "float32", device: "cpu" },
  });
  const vectorStore = await Chroma.fromExistingCollection(
    embeddings,
    chromaConfig
  );

  const studentChain = vectorStore.asRetriever({
    k: 2,
  });
  if (!studentChain) {
    throw new ServiceUnavailableError("AI Service temporarily unavailable");
  }
  const ans = await studentChain.invoke(question);

  const sysPrompt = systemPrompt(ans);

  const chatResult = await openaiClient.chat.completions.create({
    model: "gpt-4",
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

  // saving chat info into database
  const chatSave = await chatModel.create({
    question,
    answer: chatResult.choices[0].message.content,
    author: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Answer is given",
    ans: chatResult.choices[0].message.content,
    chatSave,
  });
});

// get chats
export const getChat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chats = await chatModel.find({ author: id }).populate("author", "_id");

  if (!chats || chats.length === 0) {
    throw new NotFoundError("No chats found for this user");
  }

  res.status(200).json({
    success: true,
    message: "Chats found",
    chats,
  });
});
