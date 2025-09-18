import qdrant from "./qdrantClient.js";

/**
 * ensureCollection(collectionName, vectorSize)
 * upsertPoints(collectionName, pointsArray)
 * search(collectionName, queryVector, k)
 */

export async function ensureCollection(name, size = 768) {
  // create collection if not exists
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === name);
    if (!exists) {
      await qdrant.createCollection(name, {
        vectors: { size, distance: "Cosine" },
      });
      console.log("Qdrant collection created:", name);
    } else {
      // console.log("Collection exists:", name);
    }
  } catch (err) {
    console.error("Error creating/reading collection:", err.message || err);
  }
}

// export async function upsertPoints(collectionName, points) {
//   // points: [{id, vector, payload}, ...]
//   await qdrant.upsert(collectionName, { points });
// }
import { v4 as uuidv4 } from "uuid";

export async function upsertPoints(collectionName, points) {
  // Ensure each point has a valid ID
  const validPoints = points.map(p => ({
    id: p.id && (typeof p.id === "number" || typeof p.id === "string") 
        ? p.id 
        : uuidv4(),  // fallback to UUID if invalid
    vector: p.vector,
    payload: p.payload,
  }));

  await qdrant.upsert(collectionName, { points: validPoints });
}

export async function searchCollection(collectionName, vector, limit = 5) {
  const res = await qdrant.search(collectionName, {
    vector,
    limit,
    with_payload: true,
  });
  return res; // each item: { id, payload, score }
}
