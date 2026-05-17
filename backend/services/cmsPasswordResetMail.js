/**
 * CMS password-reset OTP email via SMTP only (nodemailer).
 * `to` is always the user’s registered email from the database (see auth route).
 */

const nodemailer = require("nodemailer");

/** Trim env values; strip one layer of surrounding quotes (common on Render dashboard). */
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

function getFromAddress() {
  return envValue("CMS_PASSWORD_RESET_FROM") || envValue("SMTP_FROM");
}

function buildOtpEmail(otp, minutesValid) {
  const subject = "Your OTP for Kothari News password reset";
  const footer = `This code expires in ${minutesValid} minutes. If you did not request a password reset, you can ignore this email.`;
  const html = `
    <p style="font-size:16px;line-height:1.6;color:#111;">
      Your OTP for reset password for Kothari News is
      <strong style="font-size:22px;font-family:monospace;letter-spacing:0.18em;">${otp}</strong>.
    </p>
    <p style="color:#555;font-size:14px;margin-top:16px;">${footer}</p>
  `.trim();
  const text = `Your OTP for reset password for Kothari News is ${otp}. ${footer}`;
  return { subject, html, text };
}

function isPasswordResetMailConfigured() {
  const host = envValue("SMTP_HOST");
  const from = getFromAddress();
  return Boolean(host && from);
}

async function sendCmsPasswordResetOtp({ to, otp, minutesValid = 15 }) {
  if (!isPasswordResetMailConfigured()) {
    return { ok: false, reason: "not_configured" };
  }

  const { subject, html, text } = buildOtpEmail(otp, minutesValid);
  const host = envValue("SMTP_HOST");
  const port = parseInt(envValue("SMTP_PORT") || "587", 10);
  const secureEnv = envValue("SMTP_SECURE").toLowerCase();
  const secure = secureEnv === "true" || secureEnv === "1" || port === 465;
  const user = envValue("SMTP_USER");
  // Gmail app passwords are often pasted with spaces — strip them.
  const pass = envValue("SMTP_PASS").replace(/\s+/g, "");
  const from = getFromAddress();

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

  try {
    await transporter.verify();
    await transporter.sendMail({ from, to, subject, text, html });
    return { ok: true };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    return {
      ok: false,
      status: 500,
      data: { source: "smtp" },
      errorMessage: msg,
    };
  }
}

module.exports = { sendCmsPasswordResetOtp, isPasswordResetMailConfigured };
