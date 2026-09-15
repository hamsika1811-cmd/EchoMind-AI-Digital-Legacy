const express = require("express");
const { v4: uuid } = require("uuid");
const { db, addAudit } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const grants = db.accessGrants.filter((g) => g.ownerId === req.userId);
  res.json({ grants });
});

router.post("/", (req, res) => {
  const {
    recipientName,
    recipientEmail,
    accessLevel,
    allowedCategories,
    allowedTags,
    releaseCondition,
    releaseDate,
  } = req.body || {};

  if (!recipientName || !recipientEmail || !accessLevel) {
    return res.status(400).json({ error: "Name, email, and access level are required." });
  }
  if (!/^\S+@\S+\.\S+$/.test(recipientEmail)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }

  const grant = {
    id: uuid(),
    ownerId: req.userId,
    recipientName,
    recipientEmail,
    accessLevel,
    allowedCategories: allowedCategories || [],
    allowedTags: allowedTags || [],
    releaseCondition: releaseCondition || "Immediate",
    releaseDate: releaseDate || null,
    status: releaseCondition === "Scheduled" || releaseCondition === "Event-based" ? "Scheduled" : "Active",
    createdAt: new Date().toISOString(),
  };
  db.accessGrants.push(grant);

  const user = db.users.find((u) => u.id === req.userId);
  addAudit({
    userId: req.userId,
    action: "Access Granted",
    actor: user?.name,
    resourceType: "access",
    resourceId: grant.id,
    description: `${user?.name} granted ${grant.recipientName} "${grant.accessLevel}" access`,
  });

  res.status(201).json({ grant });
});

router.put("/:id", (req, res) => {
  const grant = db.accessGrants.find((g) => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: "Access grant not found." });
  if (grant.ownerId !== req.userId) {
    return res.status(403).json({ error: "You don't have permission to modify this access grant." });
  }

  const { accessLevel, allowedCategories, allowedTags, releaseCondition, releaseDate, status } = req.body || {};
  if (accessLevel !== undefined) grant.accessLevel = accessLevel;
  if (allowedCategories !== undefined) grant.allowedCategories = allowedCategories;
  if (allowedTags !== undefined) grant.allowedTags = allowedTags;
  if (releaseCondition !== undefined) grant.releaseCondition = releaseCondition;
  if (releaseDate !== undefined) grant.releaseDate = releaseDate;
  if (status !== undefined) grant.status = status;

  const user = db.users.find((u) => u.id === req.userId);
  addAudit({
    userId: req.userId,
    action: "Access Updated",
    actor: user?.name,
    resourceType: "access",
    resourceId: grant.id,
    description: `${user?.name} updated access for ${grant.recipientName}`,
  });

  res.json({ grant });
});

router.delete("/:id", (req, res) => {
  const grant = db.accessGrants.find((g) => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: "Access grant not found." });
  if (grant.ownerId !== req.userId) {
    return res.status(403).json({ error: "You don't have permission to revoke this access grant." });
  }

  grant.status = "Revoked";

  const user = db.users.find((u) => u.id === req.userId);
  addAudit({
    userId: req.userId,
    action: "Access Revoked",
    actor: user?.name,
    resourceType: "access",
    resourceId: grant.id,
    description: `${user?.name} revoked ${grant.recipientName}'s access`,
  });

  res.json({ grant });
});

module.exports = router;
