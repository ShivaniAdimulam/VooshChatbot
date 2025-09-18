/**
 * Usage:
 * 1) Place `data/articles.json` in project root (see format below)
 * 2) Run: npm run embed-index
 *
 * articles.json format: [ { "id": "1", "title": "...", "url":"...", "content":"full text" }, ... ]
 *
 * This script:
 *  - chunks each article into small passages
 *  - calls Jina embedding for each passage
 *  - upserts points into Qdrant collection "news_articles"
 */

import fs from "fs";
import path from "path";
import { getEmbedding } from "../src/services/embeddings.js";
import { ensureCollection, upsertPoints } from "../src/services/qdrantService.js";
import { v4 as uuidv4 } from "uuid";

const DATA_FILE = path.resolve("data/articles.json");
const COLLECTION = "news_articles";
const BATCH_SIZE = 32;

function chunkText(text, maxChars = 1200, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + maxChars);
    chunks.push(chunk);
    i += maxChars - overlap;
  }
  return chunks;
}

async function run() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error("data/articles.json not found. Create it with a list of articles.");
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  console.log(`Indexing ${raw.length} articles...`);

  // ensure collection (we assume embedding size 768 for Jina v2; update if different)
  await ensureCollection(COLLECTION, 768);

  const pointsBuffer = [];
  let total = 0;
  for (const art of raw) {
    const chunks = chunkText(art.content || "", 1200, 200);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = await getEmbedding(chunk); // may rate limit -> consider batching
      const point = {
        id: uuidv4(),  // ✅ valid UUID
        vector,
        payload: {
          articleId: art.id,
          title: art.title || "",
          url: art.url || "",
          text: chunk,
        },
      };
      pointsBuffer.push(point);
      total++;

      if (pointsBuffer.length >= BATCH_SIZE) {
        await upsertPoints(COLLECTION, pointsBuffer.splice(0));
        console.log("Upserted batch. Total so far:", total);
      }
    }
  }
  if (pointsBuffer.length) await upsertPoints(COLLECTION, pointsBuffer);

  console.log("Done indexing. Total passages:", total);
}

run().catch(err => {
  console.error("Indexing failed:", err);
  process.exit(1);
});
