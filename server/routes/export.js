const express = require("express");
const { db, addAudit } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

router.get("/", (req, res) => {
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Account not found." });

  const memories = db.memories.filter((m) => m.userId === req.userId);
  const grants = db.accessGrants.filter((g) => g.ownerId === req.userId);

  const archive = {
    exportedAt: new Date().toISOString(),
    profile: sanitizeUser(user),
    memories,
    accessGrants: grants,
    summary: {
      totalMemories: memories.length,
      totalTrustedPeople: grants.length,
    },
  };

  addAudit({
    userId: req.userId,
    action: "Export Generated",
    actor: user.name,
    resourceType: "export",
    resourceId: user.id,
    description: `${user.name} generated a Legacy Archive export`,
  });

  res.json({ archive });
});

module.exports = router;
