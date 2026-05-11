const router = require("express").Router();
const User = require("../models/User");
const Article = require("../models/Article");
const Task = require("../models/Task");
const { authenticate, authorize } = require("../middleware/auth");
const {
  WRITER_ROLES,
  EDITOR_ROLES,
  ADMIN_LIKE_ROLES,
  isWriterRole,
} = require("../utils/roles");

const ASSIGNMENT_EDITOR_ROLES = [...new Set([...EDITOR_ROLES, ...ADMIN_LIKE_ROLES])];

router.use(authenticate, authorize("__textEditors__", "__adminLike__"));

// ── GET /api/editor/assignment-users ───────────────────
// Writers/editors list for bilingual story ownership assignment.
router.get("/assignment-users", async (_req, res) => {
  try {
    const [writers, editors] = await Promise.all([
      User.find({ role: { $in: WRITER_ROLES }, isActive: true })
        .select("name email role")
        .sort({ name: 1 })
        .lean(),
      User.find({ role: { $in: ASSIGNMENT_EDITOR_ROLES }, isActive: true })
        .select("name email role")
        .sort({ name: 1 })
        .lean(),
    ]);
    res.json({ writers, editors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/editor/stats — editorial metrics (no full user directory) ──
router.get("/stats", async (_req, res) => {
  try {
    const [
      totalWriters,
      totalArticles,
      draftCount,
      submittedCount,
      publishedCount,
      rejectedCount,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: WRITER_ROLES }, isActive: true }),
      Article.countDocuments(),
      Article.countDocuments({ status: "draft" }),
      Article.countDocuments({ status: "submitted" }),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "rejected" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "in_progress" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({
        status: { $ne: "completed" },
        deadline: { $lt: new Date() },
      }),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPublished = await Article.countDocuments({
      status: "published",
      publishedAt: { $gte: sevenDaysAgo },
    });

    const byCategory = await Article.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const dailyActivity = await Article.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      users: { writers: totalWriters },
      articles: {
        total: totalArticles,
        draft: draftCount,
        submitted: submittedCount,
        published: publishedCount,
        rejected: rejectedCount,
        recentPublished,
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
      byCategory,
      dailyActivity,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/editor/writers ───────────────────────────
router.get("/writers", async (_req, res) => {
  try {
    const writers = await User.find({ role: { $in: WRITER_ROLES } }).select("-password").lean();

    const articleStats = await Article.aggregate([
      {
        $group: {
          _id: "$author",
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
          submitted: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } },
          published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        },
      },
    ]);

    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ]);

    const articleMap = Object.fromEntries(articleStats.map((s) => [s._id.toString(), s]));
    const taskMap = Object.fromEntries(taskStats.map((s) => [s._id.toString(), s]));

    const result = writers.map((w) => {
      const arts = articleMap[w._id.toString()] || {
        total: 0,
        draft: 0,
        submitted: 0,
        published: 0,
        rejected: 0,
      };
      const tasks = taskMap[w._id.toString()] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
      };
      return { ...w, articles: arts, tasks };
    });

    res.json({ writers: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/editor/writers/:id/stats ─────────────────
router.get("/writers/:id/stats", async (req, res) => {
  try {
    const writer = await User.findById(req.params.id).select("-password").lean();
    if (!writer || !isWriterRole(writer.role))
      return res.status(404).json({ message: "Writer not found" });

    const [articles, tasks, recentArticles] = await Promise.all([
      Article.aggregate([
        { $match: { author: writer._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            submitted: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } },
            published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
            totalViews: { $sum: "$views" },
          },
        },
      ]),
      Task.find({ assignedTo: req.params.id })
        .populate("article", "title status")
        .sort({ deadline: -1 })
        .lean(),
      Article.find({ author: req.params.id })
        .sort({ updatedAt: -1 })
        .limit(10)
        .select("title status category createdAt publishedAt views")
        .lean(),
    ]);

    const byCategory = await Article.aggregate([
      { $match: { author: writer._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      writer,
      articles: articles[0] || {
        total: 0,
        draft: 0,
        submitted: 0,
        published: 0,
        rejected: 0,
        totalViews: 0,
      },
      tasks: {
        all: tasks,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
        overdue: tasks.filter(
          (t) => t.status !== "completed" && new Date(t.deadline) < new Date()
        ).length,
      },
      recentArticles,
      byCategory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/editor/writers/:id/articles ─────────────
router.get("/writers/:id/articles", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const q = { author: req.params.id };
    if (status) q.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(q)
        .populate("lastEditedBy", "name role")
        .populate("writerEn writerHi editorEn editorHi", "name email role")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Article.countDocuments(q),
    ]);

    res.json({
      articles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/editor/writers/:id/tasks ─────────────────
router.get("/writers/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate("article", "title status")
      .sort({ deadline: 1 })
      .lean();

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/editor/articles — global article browser ──
router.get("/articles", async (req, res) => {
  try {
    const { status, category, author, search, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    if (author) q.author = author;
    if (search)
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { titleHi: { $regex: search, $options: "i" } },
      ];

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(q)
        .populate("author", "name email role")
        .populate("lastEditedBy", "name role")
        .populate("writerEn writerHi editorEn editorHi", "name email role")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Article.countDocuments(q),
    ]);

    res.json({
      articles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
