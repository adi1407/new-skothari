/**
 * Sync reader newsletter opt-in with an external provider (optional).
 * Configure one of:
 * - Resend: RESEND_API_KEY + RESEND_NEWSLETTER_AUDIENCE_ID
 * - Generic webhook: NEWSLETTER_WEBHOOK_URL (POST JSON { email, displayName, action: "subscribe"|"unsubscribe" })
 */

async function resendRequest(path, { method = "GET", body } = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function resendSubscribe(email, displayName) {
  const audienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;
  if (!audienceId) return { ok: false, skipped: true };
  return resendRequest(`/audiences/${audienceId}/contacts`, {
    method: "POST",
    body: {
      email,
      first_name: (displayName || "").slice(0, 80),
      unsubscribed: false,
    },
  });
}

async function resendUnsubscribe(email) {
  const audienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;
  if (!audienceId) return { ok: false, skipped: true };
  /* Try query by email (Resend may support); else list first page and match (small audiences). */
  let list = await resendRequest(
    `/audiences/${audienceId}/contacts?email=${encodeURIComponent(email)}`
  );
  if (!list.ok || !Array.isArray(list.data?.data)) {
    list = await resendRequest(`/audiences/${audienceId}/contacts`);
  }
  if (!list.ok || !Array.isArray(list.data?.data)) return { ok: false, note: "list_failed" };
  const row = list.data.data.find((c) => String(c.email || "").toLowerCase() === email.toLowerCase());
  if (!row?.id) return { ok: true, note: "no_contact" };
  return resendRequest(`/audiences/${audienceId}/contacts/${row.id}`, { method: "DELETE" });
}

async function webhookNotify(email, displayName, action) {
  const url = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!url) return { ok: false, skipped: true };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, displayName, action }),
  });
  return { ok: res.ok, status: res.status };
}

/**
 * @param {{ email: string, displayName: string, optIn: boolean }} opts
 */
async function setNewsletterSubscription({ email, displayName, optIn }) {
  const lower = String(email || "").toLowerCase().trim();
  if (!lower) return;

  if (process.env.NEWSLETTER_WEBHOOK_URL) {
    const r = await webhookNotify(lower, displayName, optIn ? "subscribe" : "unsubscribe");
    if (!r.ok && !r.skipped) {
      console.warn("Newsletter webhook failed:", r.status);
    }
    return;
  }

  if (process.env.RESEND_API_KEY && process.env.RESEND_NEWSLETTER_AUDIENCE_ID) {
    const r = optIn ? await resendSubscribe(lower, displayName) : await resendUnsubscribe(lower);
    if (!r.ok && !r.skipped) {
      console.warn("Resend newsletter sync failed:", r.status, r.data);
    }
    return;
  }

  if (optIn || !optIn) {
    /* dev: no provider configured */
  }
}

module.exports = { setNewsletterSubscription };
