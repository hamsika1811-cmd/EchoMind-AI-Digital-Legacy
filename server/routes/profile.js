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
  if (!user) return res.status(404).json({ error: "Profile not found." });
  res.json({ profile: sanitizeUser(user) });
});

router.put("/", (req, res) => {
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Profile not found." });

  const { name, bio, avatar, values, skills, legacyMessage } = req.body || {};
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (values !== undefined) user.values = values;
  if (skills !== undefined) user.skills = skills;
  if (legacyMessage !== undefined) user.legacyMessage = legacyMessage;

  addAudit({
    userId: req.userId,
    action: "Profile Updated",
    actor: user.name,
    resourceType: "profile",
    resourceId: user.id,
    description: `${user.name} updated their legacy profile`,
  });

  res.json({ profile: sanitizeUser(user) });
});

module.exports = router;
