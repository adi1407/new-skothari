const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  WRITER_ROLES,
  TEXT_EDITOR_ROLES,
  VIDEO_STAFF_ROLES,
  ADMIN_LIKE_ROLES,
} = require("../utils/roles");

// Verify JWT and attach user to req
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Role guard. Pass concrete role names and/or magic tokens:
 * - "__writers__" — writer_en | writer_hi
 * - "__textEditors__" — editor | editor_en | editor_hi
 * - "__videoStaff__" — video_editor | editor | super_admin | admin
 * - "__adminLike__" — super_admin | admin
 */
function authorize(...roles) {
  return (req, res, next) => {
    const r = req.user.role;
    const ok = roles.some((wanted) => {
      if (wanted === "__writers__") return WRITER_ROLES.includes(r);
      if (wanted === "__textEditors__") return TEXT_EDITOR_ROLES.includes(r);
      if (wanted === "__videoStaff__") return VIDEO_STAFF_ROLES.includes(r);
      if (wanted === "__adminLike__") return ADMIN_LIKE_ROLES.includes(r);
      return r === wanted;
    });
    if (!ok) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
