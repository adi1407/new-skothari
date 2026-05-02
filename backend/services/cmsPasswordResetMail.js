/**
 * Transactional email for CMS password reset OTP via Resend.
 * Requires RESEND_API_KEY and CMS_PASSWORD_RESET_FROM (verified domain).
 */

async function sendCmsPasswordResetOtp({ to, otp, minutesValid = 15 }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CMS_PASSWORD_RESET_FROM;
  if (!key || !from) {
    return { ok: false, reason: "not_configured" };
  }

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

  return { ok: res.ok, status: res.status, data };
}

function isPasswordResetMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CMS_PASSWORD_RESET_FROM);
}

module.exports = { sendCmsPasswordResetOtp, isPasswordResetMailConfigured };
