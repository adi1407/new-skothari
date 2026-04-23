const mongoose = require("mongoose");

/*
  Admin assigns tasks to writers.
  A task can optionally be linked to an article once the writer creates one.

  Task status:
    pending     → assigned, writer hasn't started
    in_progress → writer started working
    completed   → writer submitted the article
    overdue     → past deadline and not completed
*/

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    category: {
      type: String,
      enum: ["politics", "sports", "tech", "business", "entertainment", "health", "world", "state"],
      default: "politics",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // ── People ──
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Timeline ──
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },

    // ── Status ──
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "overdue"],
      default: "pending",
      index: true,
    },

    // ── Linked article (set when writer creates article for this task) ──
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      default: null,
    },

    // ── Notes ──
    notes: { type: String, default: "" },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Mark overdue automatically on read
taskSchema.methods.checkOverdue = function () {
  if (this.status !== "completed" && new Date() > this.deadline) {
    this.status = "overdue";
  }
  return this;
};

module.exports = mongoose.model("Task", taskSchema);
