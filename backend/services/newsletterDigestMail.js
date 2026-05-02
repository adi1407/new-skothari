/**
 * Transactional newsletter digest HTML + Resend send.
 * Env: RESEND_API_KEY, NEWSLETTER_FROM, optional NEWSLETTER_SITE_URL / CLIENT_URL for links.
 */

function resolveSiteUrl() {
  const explicit = process.env.NEWSLETTER_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const client = process.env.CLIENT_URL?.split(",")[0]?.trim();
  if (client) return client.replace(/\/+$/, "");
  return "http://localhost:5280";
}

function resolveBrandName() {
  return (process.env.NEWSLETTER_BRAND || "Kothari News").trim();
}

function absoluteAssetUrl(siteUrl, path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function articleHeadline(a) {
  if (a.primaryLocale === "hi" && a.titleHi) return a.titleHi;
  return a.title || a.titleHi || "Story";
}

function articleSummary(a) {
  const raw = a.primaryLocale === "hi" ? a.summaryHi || a.summary : a.summary || a.summaryHi;
  return String(raw || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function articleUrl(siteUrl, id) {
  return `${siteUrl.replace(/\/+$/, "")}/article/${id}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Human label for Article.category enum */
function categoryDisplay(slug) {
  const map = {
    desh: "Country",
    videsh: "World",
    rajneeti: "Politics",
    khel: "Sports",
    health: "Health",
    krishi: "Agriculture",
    business: "Business",
    manoranjan: "Entertainment",
  };
  return map[slug] || slug;
}

function cadenceWelcomeCopy(cadence) {
  if (cadence === "weekly") {
    return {
      rhythm:
        "You’ll receive one thoughtfully curated email each week with the biggest headlines and explainers.",
      schedule: "Weekly digest",
    };
  }
  return {
    rhythm:
      "You’ll receive regular briefings with fresh reporting — straight to your inbox, at the pace you chose.",
    schedule: "Daily briefing",
  };
}

function digestHeroTitle(variant, cadence) {
  if (variant === "welcome") return "You’re in";
  if (cadence === "weekly") return "Your weekly roundup";
  return "Your briefing";
}

function digestHeroSubtitle(variant, cadence, brandName) {
  if (variant === "welcome") {
    return `Welcome to ${brandName}. Here’s a taste of what readers are following right now.`;
  }
  if (cadence === "weekly") return "The week’s essential stories, handpicked for you.";
  return "Today’s top stories from our desk.";
}

function formatPreferenceSummary(prefSummary) {
  if (!prefSummary || (!prefSummary.categories?.length && !prefSummary.topics?.length)) return null;
  const parts = [];
  if (prefSummary.categories?.length) {
    parts.push(prefSummary.categories.map(categoryDisplay).join(", "));
  }
  if (prefSummary.topics?.length) {
    parts.push(prefSummary.topics.join(", "));
  }
  if (!parts.length) return null;
  let line = `Personalized picks — highlighting ${parts.join(" · ")}.`;
  if (prefSummary.fallback) line += " We’ve included other top stories so your inbox never feels empty.";
  return line;
}

/**
 * @param {object[]} articles
 * @param {object} opts
 * @param {string} opts.siteUrl
 * @param {string} opts.greetingName
 * @param {string} opts.brandName
 * @param {'welcome'|'digest'} [opts.variant='digest']
 * @param {'daily'|'weekly'} [opts.digestCadence='daily']
 * @param {{ categories?: string[], topics?: string[], fallback?: boolean } | null} [opts.preferenceSummary]
 */
function buildDigestHtml(articles, opts) {
  const siteUrl = opts.siteUrl || resolveSiteUrl();
  const brandName = opts.brandName || resolveBrandName();
  const greetingName = opts.greetingName || "";
  const variant = opts.variant === "welcome" ? "welcome" : "digest";
  const digestCadence = opts.digestCadence === "weekly" ? "weekly" : "daily";
  const prefLine = formatPreferenceSummary(opts.preferenceSummary || null);

  const hi = greetingName.trim() ? `Hi ${greetingName.trim()},` : "Hi there,";
  const heroTitle = digestHeroTitle(variant, digestCadence);
  const heroSub = digestHeroSubtitle(variant, digestCadence, brandName);
  const welcomeExtra = variant === "welcome" ? cadenceWelcomeCopy(digestCadence) : null;

  const manageUrl = `${siteUrl.replace(/\/+$/, "")}/profile`;

  const rows = articles
    .map((a) => {
      const title = articleHeadline(a);
      const sum = articleSummary(a);
      const url = articleUrl(siteUrl, a._id);
      const img = a.images?.[0]?.url ? absoluteAssetUrl(siteUrl, a.images[0].url) : "";
      const catLabel = a.category ? categoryDisplay(a.category) : "";
      const cat = catLabel
        ? `<span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#b91c1c;">${escapeHtml(catLabel)}</span>`
        : "";
      const imgBlock = img
        ? `<a href="${url}" style="display:block;margin-bottom:12px;text-decoration:none;"><img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" width="536" style="width:100%;max-width:536px;height:auto;border-radius:10px;display:block;border:0;" /></a>`
        : "";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr><td style="padding:20px 20px 22px;background:#fafafa;border-radius:12px;border:1px solid #e2e8f0;">
            ${cat ? `<p style="margin:0 0 8px;">${cat}</p>` : ""}
            ${imgBlock}
            <a href="${url}" style="font-size:18px;font-weight:800;color:#0f172a;text-decoration:none;line-height:1.28;display:block;">${escapeHtml(title)}</a>
            ${sum ? `<p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:#475569;">${escapeHtml(sum)}${sum.length >= 180 ? "…" : ""}</p>` : ""}
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr>
              <td style="background:#b91c1c;border-radius:8px;">
                <a href="${url}" style="display:inline-block;padding:10px 18px;font-size:13px;font-weight:800;color:#ffffff;text-decoration:none;">Read story</a>
              </td>
            </tr></table>
          </td></tr>
        </table>`;
    })
    .join("");

  const welcomeScheduleBlock =
    variant === "welcome" && welcomeExtra
      ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#92400e;">${escapeHtml(welcomeExtra.schedule)}</p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:#78350f;">${escapeHtml(welcomeExtra.rhythm)}</p>
          </td></tr>
        </table>`
      : "";

  const prefBlock = prefLine
    ? `<p style="margin:0 0 20px;padding:12px 14px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;font-size:13px;line-height:1.5;color:#166534;">${escapeHtml(prefLine)}</p>`
    : "";

  const preheader =
    variant === "welcome"
      ? `${brandName} — thanks for subscribing. Here’s what’s new.`
      : `${brandName} — ${digestCadence === "weekly" ? "Your weekly" : "Your latest"} headlines.`;

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(brandName)}</title></head>
<body style="margin:0;padding:0;background:#e2e8f0;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e2e8f0;padding:28px 14px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.1);">
        <tr><td style="background:linear-gradient(145deg,#b91c1c 0%,#7f1d1d 55%,#450a0a 100%);padding:28px 26px 26px;">
          <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.88);">${escapeHtml(brandName)}</p>
          <p style="margin:10px 0 0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.15;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">${escapeHtml(heroTitle)}</p>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.92);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">${escapeHtml(heroSub)}</p>
        </td></tr>
        <tr><td style="padding:26px 24px 8px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#1e293b;font-weight:600;">${escapeHtml(hi)}</p>
          ${welcomeScheduleBlock}
          ${prefBlock}
          ${articles.length ? "" : `<p style="color:#64748b;font-size:14px;">No stories available right now — please check the site soon.</p>`}
          ${rows}
        </td></tr>
        <tr><td style="padding:8px 24px 28px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
          <table role="presentation" width="100%" style="border-top:1px solid #e2e8f0;padding-top:20px;">
            <tr><td>
              <p style="margin:0;font-size:13px;line-height:1.55;color:#64748b;">You’re receiving this because you subscribed to <strong style="color:#334155;">${escapeHtml(brandName)}</strong>.</p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.55;color:#64748b;">
                <a href="${manageUrl}" style="color:#b91c1c;font-weight:700;text-decoration:none;">Manage preferences</a>
                <span style="color:#cbd5e1;"> · </span>
                <a href="${escapeHtml(siteUrl)}" style="color:#64748b;font-weight:600;text-decoration:none;">Visit website</a>
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">© ${escapeHtml(brandName)}</p>
    </td></tr>
  </table>
</body></html>`.trim();
}

function buildDigestPlainText(articles, opts) {
  const siteUrl = opts.siteUrl || resolveSiteUrl();
  const brandName = opts.brandName || resolveBrandName();
  const greetingName = opts.greetingName || "";
  const variant = opts.variant === "welcome" ? "welcome" : "digest";
  const digestCadence = opts.digestCadence === "weekly" ? "weekly" : "daily";
  const prefLine = formatPreferenceSummary(opts.preferenceSummary || null);

  const hi = greetingName.trim() ? `Hi ${greetingName.trim()},` : "Hi there,";
  const welcome = cadenceWelcomeCopy(digestCadence);

  const lines = [];
  lines.push(`${brandName}`);
  lines.push("");
  lines.push(hi);
  lines.push("");
  if (variant === "welcome") {
    lines.push(`Welcome — thanks for subscribing to ${brandName}.`);
    lines.push(`${welcome.schedule}: ${welcome.rhythm}`);
    lines.push("");
  } else {
    lines.push(digestCadence === "weekly" ? "Your weekly roundup:" : "Your briefing:");
    lines.push("");
  }
  if (prefLine) {
    lines.push(prefLine);
    lines.push("");
  }
  for (const a of articles) {
    lines.push(`• ${articleHeadline(a)}`);
    lines.push(`  ${articleUrl(siteUrl, a._id)}`);
    const s = articleSummary(a);
    if (s) lines.push(`  ${s}`);
    lines.push("");
  }
  lines.push(`Website: ${siteUrl}`);
  lines.push(`Preferences: ${siteUrl.replace(/\/+$/, "")}/profile`);
  return lines.join("\n");
}

function subjectForEmail({ brandName, variant, digestCadence, dateLabel }) {
  const brand = brandName || resolveBrandName();
  if (variant === "welcome") {
    return `Welcome to ${brand} — here’s what’s new`;
  }
  const d = dateLabel || new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
  if (digestCadence === "weekly") {
    return `${brand} · Weekly roundup · ${d}`;
  }
  return `${brand} · Morning briefing · ${d}`;
}

async function sendDigestViaResend({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM;
  if (!key || !from) {
    return { ok: false, skipped: true, reason: "not_configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
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

function isDigestMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM);
}

module.exports = {
  resolveSiteUrl,
  resolveBrandName,
  buildDigestHtml,
  buildDigestPlainText,
  subjectForEmail,
  sendDigestViaResend,
  isDigestMailConfigured,
  articleHeadline,
  articleUrl,
};
