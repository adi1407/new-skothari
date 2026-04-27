const jwt = require("jsonwebtoken");
const Reader = require("../models/Reader");

function signReaderToken(reader, sessionId) {
  return jwt.sign(
    { rid: reader._id.toString(), sid: sessionId, typ: "reader" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function authenticateReader(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No reader token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.typ !== "reader" || !decoded.rid) {
      return res.status(401).json({ message: "Invalid reader token" });
    }
    const reader = await Reader.findById(decoded.rid);
    if (!reader || !reader.isActive) {
      return res.status(401).json({ message: "Reader not found or inactive" });
    }
    req.reader = reader;
    req.readerSessionId = decoded.sid || null;
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired reader token" });
  }
}

function readerPublic(reader, profile = null) {
  return {
    _id: reader._id,
    email: reader.email,
    name: reader.name,
    avatar: reader.avatar || "",
    lastLogin: reader.lastLogin,
    profile: profile
      ? {
          primaryLanguage: profile.primaryLanguage,
          preferredCategories: profile.preferredCategories || [],
          followedTopics: profile.followedTopics || [],
          newsletterEnabled: !!profile.newsletterEnabled,
          newsletterTopics: profile.newsletterTopics || [],
          digestCadence: profile.digestCadence,
          profileVisibility: profile.profileVisibility,
          bio: profile.bio || "",
          socialLinks: profile.socialLinks || {},
          avatarOverride: profile.avatarOverride || "",
        }
      : null,
  };
}

module.exports = { signReaderToken, authenticateReader, readerPublic };
