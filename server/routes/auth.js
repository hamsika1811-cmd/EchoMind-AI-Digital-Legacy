const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { db, addAudit } = require("../data/store");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Please fill in every field." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const user = {
    id: uuid(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    avatar: name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
    bio: "",
    values: [],
    skills: [],
    legacyMessage: "",
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);

  addAudit({
    userId: user.id,
    action: "Login",
    actor: user.name,
    resourceType: "auth",
    resourceId: user.id,
    description: `${user.name} created an account and logged in`,
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.status(201).json({ token, user: sanitizeUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  addAudit({
    userId: user.id,
    action: "Login",
    actor: user.name,
    resourceType: "auth",
    resourceId: user.id,
    description: `${user.name} logged in`,
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token, user: sanitizeUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Account not found." });
  res.json({ user: sanitizeUser(user) });
});

module.exports = router;
