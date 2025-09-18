// Jina embedding wrapper via REST
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JINA_API_KEY = process.env.JINA_API_KEY 
//|| "jina_522e7843214b4c29b942a35f293af0c00Lw2NQeCSXb6jXiCQh41dF56zHHS";
const JINA_URL = "https://api.jina.ai/v1/embeddings";
const MODEL = "jina-embeddings-v2-base-en"; // or v3 if available; change if needed

if (!JINA_API_KEY) {
  console.warn("JINA_API_KEY is not set. Embeddings will fail until you set it");
}

export async function getEmbedding(text) {
  if (!JINA_API_KEY) throw new Error("JINA_API_KEY missing in env");
  const body = { model: MODEL, input: [text] };
  const resp = await axios.post(JINA_URL, body, {
    headers: {
      Authorization: `Bearer ${JINA_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const emb = resp.data?.data?.[0]?.embedding;
  if (!emb) throw new Error("No embedding returned from Jina");
  return emb;
}
