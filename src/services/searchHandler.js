import { getEmbedding } from "./embeddings.js";
import { searchCollection } from "./qdrantService.js";

/**
 * retrieveTopK(query, k)
 * returns array of passages: [{ text, title, url, score, id }]
 */
export async function retrieveTopK(query, k = 5) {
  const qvec = await getEmbedding(query);
  const results = await searchCollection("news_articles", qvec, k);
  // transform
  return results.map(r => ({
    id: r.id,
    score: r.score,
    text: r.payload?.text || "",
    title: r.payload?.title || "",
    url: r.payload?.url || "",
  }));
}
