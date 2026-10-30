
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { db, addAudit } = require("../data/store");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

// --------------------------------------------------
// USER HELPERS
// --------------------------------------------------

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// --------------------------------------------------
// EMAIL CONFIGURATION
// --------------------------------------------------

function createMailTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP email settings are missing.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      error: "Please fill in every field.",
    });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  if (!cleanName) {
    return res.status(400).json({
      error: "Please enter your name.",
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return res.status(400).json({
      error: "Please enter a valid email.",
    });
  }

  if (String(password).length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      error: "Passwords do not match.",
    });
  }

  const existingUser = db.users.find(
    (user) => user.email.toLowerCase() === cleanEmail
  );

  if (existingUser) {
    return res.status(409).json({
      error: "An account with this email already exists.",
    });
  }

  const user = {
    id: uuid(),
    name: cleanName,
    email: cleanEmail,
    passwordHash: bcrypt.hashSync(password, 10),
    avatar: cleanName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
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

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
});

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "Please enter your email and password.",
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const user = db.users.find(
    (item) => item.email.toLowerCase() === cleanEmail
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({
      error: "Incorrect email or password.",
    });
  }

  addAudit({
    userId: user.id,
    action: "Login",
    actor: user.name,
    resourceType: "auth",
    resourceId: user.id,
    description: `${user.name} logged in`,
  });

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.json({
    token,
    user: sanitizeUser(user),
  });
});

// --------------------------------------------------
// GET LOGGED-IN USER
// --------------------------------------------------

router.get("/me", requireAuth, (req, res) => {
  const user = db.users.find(
    (item) => item.id === req.userId
  );

  if (!user) {
    return res.status(404).json({
      error: "Account not found.",
    });
  }

  return res.json({
    user: sanitizeUser(user),
  });
});

// --------------------------------------------------
// FORGOT PASSWORD
// --------------------------------------------------

router.post("/forgot-password", async (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  console.log("[Password Reset] Request received.");

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.log("[Password Reset] Invalid email format.");

    return res.status(400).json({
      error: "Please enter a valid email.",
    });
  }

  const user = db.users.find(
    (item) => item.email.toLowerCase() === email
  );

  // Keep the response generic for account privacy.
  if (!user) {
    console.log("[Password Reset] No matching account found.");

    return res.json({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  }

  console.log(
    "[Password Reset] Account found. Attempting email delivery."
  );

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);

  // Remove older reset tokens for this account.
  db.passwordResetTokens = db.passwordResetTokens.filter(
    (item) => item.userId !== user.id
  );

  // Store only the hashed token.
  db.passwordResetTokens.push({
    userId: user.id,
    tokenHash,
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
  });

  const clientUrl = (
    process.env.CLIENT_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

  const resetUrl =
    `${clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  try {
    const transporter = createMailTransport();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Reset your EchoMind password",
      text:
        `Hello ${user.name},\n\n` +
        "We received a request to reset your EchoMind password.\n\n" +
        "Use the link below to reset your password:\n\n" +
        `${resetUrl}\n\n` +
        "This link expires in 15 minutes and can only be used once.\n\n" +
        "If you did not request this, please ignore this email.\n\n" +
        "EchoMind Team",
    });

    console.log("[Password Reset] Email accepted by SMTP.");
    console.log("[Password Reset] Message ID:", info.messageId);

    return res.json({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    // Remove the token if email delivery fails.
    db.passwordResetTokens = db.passwordResetTokens.filter(
      (item) => item.tokenHash !== tokenHash
    );

    console.error("[Password Reset] Email failed.");
    console.error("Error code:", error.code || "Unknown");
    console.error("Error:", error.message);

    return res.status(503).json({
      error:
        "Email service is unavailable. Please check the SMTP settings.",
    });
  }
});

// --------------------------------------------------
// RESET PASSWORD
// --------------------------------------------------

router.post("/reset-password", (req, res) => {
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  const confirmPassword = String(req.body?.confirmPassword || "");

  if (!token || token.length > 200) {
    return res.status(400).json({
      error: "Reset link is invalid or expired. Please request another.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      error: "Passwords do not match.",
    });
  }

  const tokenHash = hashResetToken(token);
  const now = Date.now();

  const resetEntry = db.passwordResetTokens.find(
    (item) =>
      item.tokenHash === tokenHash &&
      item.expiresAt > now
  );

  if (!resetEntry) {
    return res.status(400).json({
      error: "Reset link is invalid or expired. Please request another.",
    });
  }

  const user = db.users.find(
    (item) => item.id === resetEntry.userId
  );

  if (!user) {
    return res.status(400).json({
      error: "Reset link is invalid or expired. Please request another.",
    });
  }

  user.passwordHash = bcrypt.hashSync(password, 12);

  // Consume every reset token belonging to this account.
  db.passwordResetTokens = db.passwordResetTokens.filter(
    (item) => item.userId !== user.id
  );

  addAudit({
    userId: user.id,
    action: "Password Reset",
    actor: user.name,
    resourceType: "auth",
    resourceId: user.id,
    description: `${user.name} reset their password`,
  });

  console.log("[Password Reset] Password updated successfully.");

  return res.json({
    message: "Password reset successful. You can now log in.",
  });
});

module.exports = router;
