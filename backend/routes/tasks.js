const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");
const { isWriterRole } = require("../utils/roles");

// ── GET /api/tasks ───────────────────────────────────
// Admin: all tasks (with filters) | Writer: own tasks | Editor: view only
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 20 } = req.query;
    const q = {};

    if (isWriterRole(req.user.role)) {
      q.assignedTo = req.user._id;
    } else if (assignedTo) {
      q.assignedTo = assignedTo;
    }

    if (status)   q.status   = status;
    if (priority) q.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Task.find(q)
        .populate("assignedTo", "name email role")
        .populate("assignedBy", "name role")
        .populate("article", "title status")
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Task.countDocuments(q),
    ]);

    // Compute overdue flag
    const now = new Date();
    tasks.forEach((t) => {
      if (t.status !== "completed" && new Date(t.deadline) < now) {
        t.isOverdue = true;
      }
    });

    res.json({
      tasks,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/tasks/:id ───────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email role avatar")
      .populate("assignedBy", "name role")
      .populate("article", "title status publishedAt");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Writers can only view their own
    if (isWriterRole(req.user.role) &&
        task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/tasks  (admin assigns task) ─────────────
router.post(
  "/",
  authenticate,
  authorize("__adminLike__"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("assignedTo").notEmpty().withMessage("assignedTo (writer ID) is required"),
    body("deadline").isISO8601().withMessage("Valid deadline date required"),
    body("priority").optional().isIn(["low","medium","high","urgent"]),
    body("category").optional().isIn(["desh","videsh","rajneeti","khel","health","krishi","business","manoranjan"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, assignedTo, deadline, priority, category, notes } = req.body;

      // Verify assignee is a writer
      const writer = await User.findById(assignedTo);
      if (!writer || !isWriterRole(writer.role))
        return res.status(400).json({ message: "assignedTo must be an active writer" });

      const task = await Task.create({
        title, description, assignedTo, deadline,
        priority, category, notes,
        assignedBy: req.user._id,
        status: "pending",
      });

      const populated = await task.populate([
        { path: "assignedTo", select: "name email role" },
        { path: "assignedBy", select: "name role" },
      ]);

      res.status(201).json({ task: populated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/tasks/:id  (admin edits task) ────────────
router.put(
  "/:id",
  authenticate,
  authorize("__adminLike__"),
  [
    body("deadline").optional().isISO8601(),
    body("priority").optional().isIn(["low","medium","high","urgent"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const allowed = ["title","description","deadline","priority","category","notes"];
      allowed.forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

      await task.save();
      await task.populate([
        { path: "assignedTo", select: "name email role" },
        { path: "assignedBy", select: "name role" },
      ]);
      res.json({ task });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── DELETE /api/tasks/:id  (admin) ────────────────────
router.delete("/:id", authenticate, authorize("__adminLike__"), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/tasks/:id/start  (writer starts task) ─
router.patch("/:id/start", authenticate, authorize("__writers__"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your task" });

    if (task.status !== "pending")
      return res.status(400).json({ message: "Task is not in pending state" });

    task.status = "in_progress";
    await task.save();
    res.json({ task, message: "Task marked as in progress" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/tasks/:id/complete  (writer completes) ─
router.patch("/:id/complete", authenticate, authorize("__writers__", "__adminLike__"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (isWriterRole(req.user.role) &&
        task.assignedTo.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your task" });

    task.status = "completed";
    task.completedAt = new Date();
    await task.save();
    res.json({ task, message: "Task marked as completed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
