require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { getPublicStats } = require("./data/store");
const authRoutes = require("./routes/auth");
const memoriesRoutes = require("./routes/memories");
const aiRoutes = require("./routes/ai");
const accessRoutes = require("./routes/access");
const auditRoutes = require("./routes/audit");
const profileRoutes = require("./routes/profile");
const exportRoutes = require("./routes/export");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public route — safe to show on the landing page before login.
// Never exposes memory content, user data, or anything account-specific.
app.get("/api/public/stats", (req, res) => {
  res.json({ stats: getPublicStats() });
});

app.use("/api/auth", authRoutes);
app.use("/api/memories", memoriesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Fallback error handler — never leak raw server errors to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, () => {
  console.log(`EchoMind API listening on port ${PORT}`);
});
