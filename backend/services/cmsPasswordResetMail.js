/**
 * CMS password-reset OTP email.
 * Prefers your own SMTP (nodemailer) when SMTP_HOST is set; otherwise Resend if configured.
 * The `to` address is always the user’s registered email from the database (see auth route).
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

function isSmtpConfigured() {
  const host = process.env.SMTP_HOST;
  const from = getFromAddress();
  return Boolean(host && String(host).trim() && from);
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getFromAddress());
}

function isPasswordResetMailConfigured() {
  return isSmtpConfigured() || isResendConfigured();
}

async function sendViaSmtp({ to, subject, html, text }) {
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
    return { ok: true, via: "smtp" };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    return { ok: false, errorMessage: msg };
  }
}

/** Resend uses `message` or nested `error.message` on failures. */
function extractResendErrorMessage(data) {
  if (!data || typeof data !== "object") return "";
  if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  if (data.error && typeof data.error === "object" && typeof data.error.message === "string") {
    return data.error.message.trim();
  }
  return "";
}

async function sendViaResend({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = getFromAddress();
  if (!key || !from) {
    return { ok: false, errorMessage: "Resend not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const bodyText = await res.text();
  let data;
  try {
    data = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    data = { raw: bodyText };
  }

  const errorMessage = extractResendErrorMessage(data);
  if (res.ok) {
    return { ok: true, via: "resend" };
  }
  return { ok: false, status: res.status, data, errorMessage };
}

/**
 * Send OTP to the user’s email. Does not return the OTP in the result (only success/failure).
 */
async function sendCmsPasswordResetOtp({ to, otp, minutesValid = 15 }) {
  const { subject, html, text } = buildOtpEmail(otp, minutesValid);

  if (isSmtpConfigured()) {
    const r = await sendViaSmtp({ to, subject, html, text });
    if (r.ok) {
      return { ok: true, via: r.via };
    }
    return {
      ok: false,
      status: 500,
      data: { source: "smtp" },
      errorMessage: r.errorMessage || "SMTP send failed",
    };
  }

  if (isResendConfigured()) {
    const r = await sendViaResend({ to, subject, html, text });
    if (r.ok) {
      return { ok: true, via: r.via };
    }
    return {
      ok: false,
      status: r.status,
      data: r.data,
      errorMessage: r.errorMessage,
    };
  }

  return { ok: false, reason: "not_configured" };
}

module.exports = { sendCmsPasswordResetOtp, isPasswordResetMailConfigured };
