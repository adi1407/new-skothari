const jwt = require("jsonwebtoken");
const Reader = require("../models/Reader");

const READER_AUD = "reader";

function readerJwtSecret() {
  return process.env.READER_JWT_SECRET || process.env.JWT_SECRET;
}

function signReaderToken(readerId) {
  return jwt.sign(
    { sub: String(readerId), aud: READER_AUD },
    readerJwtSecret(),
    { expiresIn: process.env.READER_JWT_EXPIRES_IN || "30d" }
  );
}

function readerPublic(reader) {
  const r = reader.toObject ? reader.toObject() : { ...reader };
  delete r.password;
  r.hasLocalPassword = Boolean(r.hasLocalPassword);
  return r;
}

async function authenticateReader(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, readerJwtSecret());
    if (decoded.aud !== READER_AUD) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const reader = await Reader.findById(decoded.sub).select("-password");
    if (!reader) return res.status(401).json({ message: "Reader not found" });
    req.reader = reader;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { signReaderToken, authenticateReader, readerPublic, READER_AUD };
