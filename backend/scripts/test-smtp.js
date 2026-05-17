/**
 * Test CMS SMTP from your machine (uses backend/.env).
 * Run: node scripts/test-smtp.js your-recipient@example.com
 */
require("dotenv").config();
const nodemailer = require("nodemailer");
const {
  isPasswordResetMailConfigured,
} = require("../services/cmsPasswordResetMail");

function envValue(key) {
  let v = String(process.env[key] ?? "").trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

const to = process.argv[2] || envValue("SMTP_USER");
if (!to) {
  console.error("Usage: node scripts/test-smtp.js recipient@example.com");
  process.exit(1);
}

if (!isPasswordResetMailConfigured()) {
  console.error("Missing SMTP_HOST or CMS_PASSWORD_RESET_FROM in .env");
  process.exit(1);
}

const host = envValue("SMTP_HOST");
const port = parseInt(envValue("SMTP_PORT") || "587", 10);
const secureEnv = envValue("SMTP_SECURE").toLowerCase();
const secure = secureEnv === "true" || secureEnv === "1" || port === 465;
const user = envValue("SMTP_USER");
const pass = envValue("SMTP_PASS").replace(/\s+/g, "");
const from = envValue("CMS_PASSWORD_RESET_FROM") || envValue("SMTP_FROM");

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  requireTLS: port === 587 && !secure,
  auth: user && pass ? { user, pass } : undefined,
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
  tls: { minVersion: "TLSv1.2" },
});

(async () => {
  console.log("SMTP test config:", { host, port, secure, user, from, to });
  try {
    await transporter.verify();
    console.log("verify() OK — connected and authenticated");
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Kothari CMS SMTP test",
      text: "If you received this, SMTP is working.",
    });
    console.log("sendMail OK:", info.messageId);
  } catch (err) {
    console.error("SMTP FAILED:", err.message);
    if (/auth|535|534/i.test(err.message)) {
      console.error("\nHint: Wrong password/user, or use smtp.titan.email if Hostinger shows Titan in hPanel.");
    }
    if (/timeout|ETIMEDOUT|ECONNREFUSED/i.test(err.message)) {
      console.error("\nHint: Try SMTP_PORT=587 and clear SMTP_SECURE, or check firewall/host.");
    }
    process.exit(1);
  }
})();
