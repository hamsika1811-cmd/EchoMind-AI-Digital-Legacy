const express = require("express");
const { v4: uuid } = require("uuid");
const { db, addAudit } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function getUser(req) {
  return db.users.find((u) => u.id === req.userId);
}

// GET /api/memories — list current user's memories, with search/filter/sort
router.get("/", (req, res) => {
  const { search, category, mediaType, tag, sort } = req.query;
  let results = db.memories.filter((m) => m.userId === req.userId);

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.location || "").toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (category && category !== "All") {
    results = results.filter((m) => m.category === category);
  }
  if (mediaType && mediaType !== "All") {
    results = results.filter((m) => m.mediaType === mediaType);
  }
  if (tag) {
    results = results.filter((m) => m.tags.includes(tag));
  }

  results = [...results].sort((a, b) =>
    sort === "oldest" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
  );

  res.json({ memories: results });
});

// POST /api/memories — create
router.post("/", (req, res) => {
  const { title, description, date, category, tags, location, mediaType, mediaUrl, privacy } = req.body || {};
  if (!title || !date || !category) {
    return res.status(400).json({ error: "Title, date, and category are required." });
  }

  const memory = {
    id: uuid(),
    userId: req.userId,
    title,
    description: description || "",
    date,
    category,
    tags: Array.isArray(tags) ? tags : (tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    location: location || "",
    mediaType: mediaType || "text",
    mediaUrl: mediaUrl || null,
    privacy: privacy || "private",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.memories.push(memory);

  const user = getUser(req);
  addAudit({
    userId: req.userId,
    action: "Memory Created",
    actor: user?.name,
    resourceType: "memory",
    resourceId: memory.id,
    description: `${user?.name} preserved a new memory: "${memory.title}"`,
  });

  res.status(201).json({ memory });
});

// GET /api/memories/:id
router.get("/:id", (req, res) => {
  const memory = db.memories.find((m) => m.id === req.params.id);
  if (!memory) return res.status(404).json({ error: "Memory not found." });
  if (memory.userId !== req.userId) {
    return res.status(403).json({ error: "You don't have permission to access this memory." });
  }

  const user = getUser(req);
  addAudit({
    userId: req.userId,
    action: "Memory Viewed",
    actor: user?.name,
    resourceType: "memory",
    resourceId: memory.id,
    description: `${user?.name} viewed "${memory.title}"`,
  });

  res.json({ memory });
});

// PUT /api/memories/:id
router.put("/:id", (req, res) => {
  const memory = db.memories.find((m) => m.id === req.params.id);
  if (!memory) return res.status(404).json({ error: "Memory not found." });
  if (memory.userId !== req.userId) {
    return res.status(403).json({ error: "You don't have permission to edit this memory." });
  }

  const { title, description, date, category, tags, location, mediaType, mediaUrl, privacy } = req.body || {};
  if (title !== undefined) memory.title = title;
  if (description !== undefined) memory.description = description;
  if (date !== undefined) memory.date = date;
  if (category !== undefined) memory.category = category;
  if (tags !== undefined) {
    memory.tags = Array.isArray(tags) ? tags : (tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (location !== undefined) memory.location = location;
  if (mediaType !== undefined) memory.mediaType = mediaType;
  if (mediaUrl !== undefined) memory.mediaUrl = mediaUrl;
  if (privacy !== undefined) memory.privacy = privacy;
  memory.updatedAt = new Date().toISOString();

  const user = getUser(req);
  addAudit({
    userId: req.userId,
    action: "Memory Updated",
    actor: user?.name,
    resourceType: "memory",
    resourceId: memory.id,
    description: `${user?.name} updated "${memory.title}"`,
  });

  res.json({ memory });
});

// DELETE /api/memories/:id
router.delete("/:id", (req, res) => {
  const idx = db.memories.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Memory not found." });
  const memory = db.memories[idx];
  if (memory.userId !== req.userId) {
    return res.status(403).json({ error: "You don't have permission to delete this memory." });
  }

  db.memories.splice(idx, 1);

  const user = getUser(req);
  addAudit({
    userId: req.userId,
    action: "Memory Deleted",
    actor: user?.name,
    resourceType: "memory",
    resourceId: memory.id,
    description: `${user?.name} deleted "${memory.title}"`,
  });

  res.json({ success: true });
});

module.exports = router;
