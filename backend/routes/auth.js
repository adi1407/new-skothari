const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");

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
      .isIn(["admin", "editor", "writer"])
      .withMessage("Role must be admin, editor or writer"),
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
