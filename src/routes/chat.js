import express from "express";
import { v4 as uuidv4 } from "uuid";
import { retrieveTopK } from "../services/searchHandler.js";
import { askGemini } from "../services/geminiService.js";
import { pushMessage, getHistory, resetSession } from "../services/redisClient.js";

const router = express.Router();

router.post("/session", (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

router.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    console.log(req.body,"body---->>>")
    if (!message) return res.status(400).json({ error: "message required" });
    const sid = sessionId || uuidv4();
    // push user message
    await pushMessage(sid, { role: "user", content: message, ts: Date.now() });

    // retrieve top-k contexts
    const contexts = await retrieveTopK(message, 5);

    // ask gemini
    const answer = await askGemini(message, contexts);

    // push assistant message
    await pushMessage(sid, { role: "assistant", content: answer, ts: Date.now() });

    res.json({ sessionId: sid, answer, contexts });
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ error: err.message || "server error" });
  }
});

router.get("/session/:id/history", async (req, res) => {
  const { id } = req.params;
  const history = await getHistory(id);
  res.json({ sessionId: id, history });
});

router.delete("/session/:id/reset", async (req, res) => {
  const { id } = req.params;
  await resetSession(id);
  res.json({ sessionId: id, reset: true });
});

export default router;
