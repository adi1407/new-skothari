/**
 * CMS password-reset OTP email via SMTP only (nodemailer).
 * `to` is always the user’s registered email from the database (see auth route).
 */

const nodemailer = require("nodemailer");

function getFromAddress() {
  return (process.env.CMS_PASSWORD_RESET_FROM || process.env.SMTP_FROM || "").trim();
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
  const host = process.env.SMTP_HOST;
  const from = getFromAddress();
  return Boolean(host && String(host).trim() && from);
}

async function sendCmsPasswordResetOtp({ to, otp, minutesValid = 15 }) {
  if (!isPasswordResetMailConfigured()) {
    return { ok: false, reason: "not_configured" };
  }

  const { subject, html, text } = buildOtpEmail(otp, minutesValid);
  const host = String(process.env.SMTP_HOST).trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secureEnv = process.env.SMTP_SECURE;
  const secure =
    secureEnv === "true" ||
    secureEnv === "1" ||
    port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = getFromAddress();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  try {
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
