const express = require("express");
const { db } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const logs = db.auditLogs
    .filter((l) => l.userId === req.userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ logs });
});

module.exports = router;
