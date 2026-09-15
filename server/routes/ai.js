const express = require("express");
const { v4: uuid } = require("uuid");
const { db, addAudit } = require("../data/store");
const { requireAuth } = require("../middleware/auth");
const { queryMemories } = require("../services/memorySearch");

const router = express.Router();
router.use(requireAuth);

const DISCLOSURE =
  "EchoMind AI is generating a reconstruction from preserved memories. It is not the actual person.";

router.post("/query", (req, res) => {
  const { question, conversationId } = req.body || {};
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Please enter a question." });
  }

  const user = db.users.find((u) => u.id === req.userId);
  const myMemories = db.memories.filter((m) => m.userId === req.userId);
  const { answer, sources } = queryMemories(question, myMemories);
  const convoId = conversationId || uuid();

  const userMessage = {
    id: uuid(),
    userId: req.userId,
    conversationId: convoId,
    role: "user",
    message: question,
    sources: [],
    timestamp: new Date().toISOString(),
  };
  const aiMessage = {
    id: uuid(),
    userId: req.userId,
    conversationId: convoId,
    role: "assistant",
    message: answer,
    sources,
    timestamp: new Date().toISOString(),
  };
  db.chatMessages.push(userMessage, aiMessage);

  addAudit({
    userId: req.userId,
    action: "AI Question Asked",
    actor: user?.name,
    resourceType: "chat",
    resourceId: aiMessage.id,
    description: `${user?.name} asked EchoMind AI "${question}"`,
  });

  res.json({ conversationId: convoId, answer, sources, disclosure: DISCLOSURE });
});

router.get("/history", (req, res) => {
  const history = db.chatMessages
    .filter((m) => m.userId === req.userId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json({ history, disclosure: DISCLOSURE });
});

router.delete("/history", (req, res) => {
  db.chatMessages = db.chatMessages.filter((m) => m.userId !== req.userId);
  res.json({ success: true });
});

module.exports = router;
