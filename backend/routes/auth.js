const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");
const {
  sendCmsPasswordResetOtp,
  isPasswordResetMailConfigured,
} = require("../services/cmsPasswordResetMail");

const FORGOT_PASSWORD_MESSAGE =
  "If this email is registered with an active account, you can continue with a verification code.";

const OTP_EXPIRY_MS = 15 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_WINDOW_MS = 60 * 60 * 1000;
const OTP_MAX_SENDS_PER_WINDOW = 3;

const PASSWORD_RESET_FIELDS =
  "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetLastSentAt +passwordResetWindowStart +passwordResetWindowCount";

const RESET_PASSWORD_SELECT = `${PASSWORD_RESET_FIELDS} +password`;

/** Per-IP cap on forgot-password (in addition to per-user DB limits below). */
const forgotPasswordIpLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset attempts from this network. Please try again later.",
  },
});

function normalizeOtp(input) {
  return String(input ?? "").replace(/\D/g, "").slice(0, 12);
}

function generateSixDigitOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function userPublic(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  return u;
}

// ── POST /api/auth/login ──────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).select("+password");
      if (!user || !user.isActive)
        return res.status(401).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

      user.lastLogin = new Date();
      await user.save();

      const token = signToken(user);
      res.json({ token, user: userPublic(user) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /api/auth/forgot-password  (CMS — OTP via SMTP or Resend) ─
router.post(
  "/forgot-password",
  forgotPasswordIpLimit,
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const now = Date.now();

    try {
      if (!isPasswordResetMailConfigured()) {
        return res.status(503).json({
          message:
            "Password reset email is not configured. Set SMTP_HOST and CMS_PASSWORD_RESET_FROM (and SMTP_USER / SMTP_PASS if required), or use Resend with RESEND_API_KEY and CMS_PASSWORD_RESET_FROM. See backend .env.example.",
        });
      }

      const user = await User.findOne({ email }).select(PASSWORD_RESET_FIELDS);
      if (!user || !user.isActive) {
        return res.json({ message: FORGOT_PASSWORD_MESSAGE });
      }

      if (
        user.passwordResetLastSentAt &&
        now - user.passwordResetLastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
      ) {
        return res.json({ message: FORGOT_PASSWORD_MESSAGE });
      }

      let windowStart = user.passwordResetWindowStart;
      let windowCount = user.passwordResetWindowCount || 0;
      if (!windowStart || now - windowStart.getTime() > OTP_WINDOW_MS) {
        windowStart = new Date(now);
        windowCount = 0;
      }
      if (windowCount >= OTP_MAX_SENDS_PER_WINDOW) {
        return res.json({ message: FORGOT_PASSWORD_MESSAGE });
      }

      const otp = generateSixDigitOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      const mailResult = await sendCmsPasswordResetOtp({
        to: user.email,
        otp,
        minutesValid: OTP_EXPIRY_MS / 60000,
      });
      if (!mailResult.ok) {
        const errDetail = mailResult.errorMessage || "";
        console.error(
          "[forgot-password] Email send failed:",
          mailResult.via || mailResult.reason,
          mailResult.status,
          mailResult.data,
          errDetail
        );
        const generic =
          "Could not send the verification email. For SMTP: check SMTP_HOST, SMTP_PORT, CMS_PASSWORD_RESET_FROM, and credentials. For Resend: check the API key and verified domain/sender.";
        const message =
          process.env.NODE_ENV !== "production" && errDetail
            ? `${errDetail}${mailResult.status ? ` (HTTP ${mailResult.status})` : ""}`
            : generic;
        return res.status(502).json({ message });
      }

      user.passwordResetOtpHash = otpHash;
      user.passwordResetOtpExpiresAt = new Date(now + OTP_EXPIRY_MS);
      user.passwordResetLastSentAt = new Date(now);
      user.passwordResetWindowStart = windowStart;
      user.passwordResetWindowCount = windowCount + 1;
      await user.save();

      // OTP is only delivered by email — never return it in JSON.
      return res.json({ message: FORGOT_PASSWORD_MESSAGE, otpSent: true });
    } catch (err) {
      console.error("[forgot-password]", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /api/auth/reset-password  (CMS — OTP + new password) ─
router.post(
  "/reset-password",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").trim().notEmpty(),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const genericFail = () =>
      res.status(400).json({ message: "Invalid or expired code. Request a new code and try again." });

    const { email, newPassword } = req.body;
    const otp = normalizeOtp(req.body.otp);
    if (otp.length !== 6) return genericFail();

    try {
      const user = await User.findOne({ email }).select(RESET_PASSWORD_SELECT);
      if (!user || !user.isActive) return genericFail();

      if (
        !user.passwordResetOtpHash ||
        !user.passwordResetOtpExpiresAt ||
        user.passwordResetOtpExpiresAt.getTime() < Date.now()
      ) {
        return genericFail();
      }

      const match = await bcrypt.compare(otp, user.passwordResetOtpHash);
      if (!match) return genericFail();

      user.password = await bcrypt.hash(newPassword, 12);
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiresAt = null;
      user.passwordResetLastSentAt = null;
      user.passwordResetWindowStart = null;
      user.passwordResetWindowCount = 0;
      await user.save();

      res.json({ message: "Password updated. You can sign in now." });
    } catch (err) {
      console.error("[reset-password]", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ── POST /api/auth/register  (admin only) ─────────────
router.post(
  "/register",
  authenticate,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .isIn(["admin", "editor", "writer", "writer_en", "writer_hi"])
      .withMessage("Role must be admin, editor, writer, writer_en, or writer_hi"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, bio } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });

      const hash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, password: hash, role, bio });
      res.status(201).json({ user: userPublic(user) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/auth/me  (update own profile) ────────────
router.put(
  "/me",
  authenticate,
  [
    body("name").optional().trim().notEmpty(),
    body("bio").optional().isLength({ max: 300 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, bio } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (bio  !== undefined) update.bio  = bio;

    try {
      const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/auth/me/password  (change own password) ─
router.put(
  "/me/password",
  authenticate,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user._id).select("+password");
      const match = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!match) return res.status(401).json({ message: "Current password is incorrect" });

      user.password = await bcrypt.hash(req.body.newPassword, 12);
      await user.save();
      res.json({ message: "Password updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
