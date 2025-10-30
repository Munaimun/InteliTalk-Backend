import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
const llm = () => {

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables");
  }
  try {
    const llm = new ChatGroq({
      apiKey,
      modelName: "openai/gpt-oss-20b",
      temperature: 0.5,
      model: "openai/gpt-oss-20b",
    });

    return llm;
  } catch (error) {
    console.error("Failed to initialize LLM:", error);
    throw new Error("LLM initialization failed");
  }
};

const openaiClient = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

export { llm, openaiClient };
