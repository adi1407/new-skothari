require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const seedAll = require("./config/seed");

const app = express();

// ── Connect DB ──
connectDB().then(() => seedAll());

// ── Middleware ──
// In development, reflect any Origin (LAN IP for phone testing). In production set CLIENT_URL or CLIENT_URLS (comma-separated).
const isProd = process.env.NODE_ENV === "production";

function corsOrigin() {
  if (!isProd) return true;
  const raw = process.env.CLIENT_URLS || process.env.CLIENT_URL || "";
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return false;
  if (list.length === 1) return list[0];
  return (origin, cb) => {
    if (!origin || list.includes(origin)) cb(null, true);
    else cb(null, false);
  };
}

app.use(
  cors({
    origin: corsOrigin(),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ──
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ──
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/videos",   require("./routes/videos"));
app.use("/api/tasks",    require("./routes/tasks"));
app.use("/api/admin",    require("./routes/admin"));
app.use("/api/editor",   require("./routes/editor"));
app.use("/api/public",   require("./routes/public"));

// ── Health ──
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 ──
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT} (and your LAN IP, port ${PORT})`);
});
