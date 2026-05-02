const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { WRITER_ROLES } = require("../utils/roles");

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

// Role guard factory — usage: authorize("admin"), authorize("writer","admin")
// When "writer" is listed, any desk writer role (writer / writer_en / writer_hi) is accepted.
function authorize(...roles) {
  return (req, res, next) => {
    const ok = roles.some((wanted) => {
      if (wanted === "writer") return WRITER_ROLES.includes(req.user.role);
      return req.user.role === wanted;
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
