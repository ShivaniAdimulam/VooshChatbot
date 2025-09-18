import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const KEY =process.env.GEMINI_API_KEY 
//||"AIzaSyDDZkmlVlX-ek3I1J0mGuKlaFhOAVdFvF4";
const GEMINI_API_URL =process.env.GEMINI_API_URL 
//|| "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDDZkmlVlX-ek3I1J0mGuKlaFhOAVdFvF4";

export async function askGemini(userQuestion, contexts = []) {
  // contexts: array of { text, title, url }
  const contextText = contexts
    .map((c, i) => `--[${i + 1}] ${c.title || c.url || ""}\n${c.text}\n`)
    .join("\n");

  const prompt = `You are a helpful assistant. Use the following passages from news articles to answer the question.\n\n${contextText}\nQuestion: ${userQuestion}\nAnswer:`;

  if (!KEY) {
    // offline/demo fallback
    return `**Demo mode (no GEMINI_API_KEY).** Would answer to: "${userQuestion}".\nContext provided (${contexts.length} passages).`;
  }

  try {
    const resp = await axios.post(
      `${GEMINI_API_URL}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    // Extract answer safely
    return (
      resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(resp.data)
    );
  } catch (err) {
    console.error("Gemini call failed:", err.response?.data || err.message);
    throw err;
  }
}
