const express = require("express");
const { v4: uuid } = require("uuid");
const { db, addAudit } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function isReleased(grant) {
  if (grant.status !== "Active") return false;

  if (grant.releaseCondition === "Scheduled") {
    if (!grant.releaseDate) return false;
    return new Date(grant.releaseDate) <= new Date();
  }

  // Event-based grants remain unavailable until explicitly activated.
  if (grant.releaseCondition === "Event-based") return false;

  return true;
}

// Grants created by the signed-in user.
router.get("/", (req, res) => {
  const grants = db.accessGrants
    .filter((g) => g.ownerId === req.userId)
    .map((g) => ({
      ...g,
      recipientId:
        g.recipientId ||
        db.users.find(
          (u) =>
            u.email.toLowerCase() ===
            (g.recipientEmail || "").toLowerCase()
        )?.id ||
        null,
    }));

  res.json({ grants });
});

// Grants shared with the signed-in recipient.
router.get("/incoming", (req, res) => {
  const recipient = db.users.find((u) => u.id === req.userId);

  if (!recipient) {
    return res.status(404).json({ error: "Account not found." });
  }

  const grants = db.accessGrants
    .filter((g) => {
      const emailMatches =
        (g.recipientEmail || "").toLowerCase() ===
        recipient.email.toLowerCase();

      return (
        g.ownerId !== req.userId &&
        (g.recipientId === req.userId || emailMatches)
      );
    })
    .map((g) => {
      const owner = db.users.find((u) => u.id === g.ownerId);

      return {
        ...g,
        ownerName: owner?.name || "EchoMind user",
        released: isReleased(g),
      };
    });

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
    return res.status(400).json({
      error: "Name, email, and access level are required.",
    });
  }

  const email = recipientEmail.trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }

  const allowedLevels = [
    "View Only",
    "Memory Chat",
    "Full Legacy Access",
  ];

  if (!allowedLevels.includes(accessLevel)) {
    return res.status(400).json({ error: "Invalid access level." });
  }

  if (email === db.users.find((u) => u.id === req.userId)?.email.toLowerCase()) {
    return res.status(400).json({
      error: "You cannot grant legacy access to your own account.",
    });
  }

  const condition = releaseCondition || "Immediate";

  if (!["Immediate", "Scheduled", "Event-based"].includes(condition)) {
    return res.status(400).json({ error: "Invalid release condition." });
  }

  if (condition === "Scheduled" && !releaseDate) {
    return res.status(400).json({
      error: "Please select a release date for scheduled access.",
    });
  }

  const recipient = db.users.find(
    (u) => u.email.toLowerCase() === email
  );

  const grant = {
    id: uuid(),
    ownerId: req.userId,
    recipientId: recipient?.id || null,
    recipientName: recipientName.trim(),
    recipientEmail: email,
    accessLevel,
    allowedCategories: Array.isArray(allowedCategories)
      ? allowedCategories
      : [],
    allowedTags: Array.isArray(allowedTags) ? allowedTags : [],
    releaseCondition: condition,
    releaseDate: releaseDate || null,
    status: condition === "Immediate" ? "Active" : "Scheduled",
    createdAt: new Date().toISOString(),
  };

  db.accessGrants.push(grant);

  const owner = db.users.find((u) => u.id === req.userId);

  addAudit({
    userId: req.userId,
    action: "Access Granted",
    actor: owner?.name,
    resourceType: "access",
    resourceId: grant.id,
    description: `${owner?.name} granted ${grant.recipientName} "${grant.accessLevel}" access`,
  });

  res.status(201).json({
    grant: {
      ...grant,
      recipientId: recipient?.id || null,
    },
  });
});

router.put("/:id", (req, res) => {
  const grant = db.accessGrants.find((g) => g.id === req.params.id);

  if (!grant) {
    return res.status(404).json({ error: "Access grant not found." });
  }

  if (grant.ownerId !== req.userId) {
    return res.status(403).json({
      error: "You don't have permission to modify this access grant.",
    });
  }

  const {
    accessLevel,
    allowedCategories,
    allowedTags,
    releaseCondition,
    releaseDate,
    status,
  } = req.body || {};

  if (accessLevel !== undefined) grant.accessLevel = accessLevel;
  if (allowedCategories !== undefined) grant.allowedCategories = allowedCategories;
  if (allowedTags !== undefined) grant.allowedTags = allowedTags;
  if (releaseCondition !== undefined) grant.releaseCondition = releaseCondition;
  if (releaseDate !== undefined) grant.releaseDate = releaseDate;

  // Only the owner can activate, schedule, or revoke a grant.
  if (status !== undefined && ["Active", "Scheduled", "Revoked"].includes(status)) {
    grant.status = status;
  }

  const owner = db.users.find((u) => u.id === req.userId);

  addAudit({
    userId: req.userId,
    action: "Access Updated",
    actor: owner?.name,
    resourceType: "access",
    resourceId: grant.id,
    description: `${owner?.name} updated access for ${grant.recipientName}`,
  });

  res.json({ grant });
});

router.delete("/:id", (req, res) => {
  const grant = db.accessGrants.find((g) => g.id === req.params.id);

  if (!grant) {
    return res.status(404).json({ error: "Access grant not found." });
  }

  if (grant.ownerId !== req.userId) {
    return res.status(403).json({
      error: "You don't have permission to revoke this access grant.",
    });
  }

  grant.status = "Revoked";

  const owner = db.users.find((u) => u.id === req.userId);

  addAudit({
    userId: req.userId,
    action: "Access Revoked",
    actor: owner?.name,
    resourceType: "access",
    resourceId: grant.id,
    description: `${owner?.name} revoked ${grant.recipientName}'s access`,
  });

  res.json({ grant });
});

module.exports = router;
