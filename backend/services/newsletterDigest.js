const Article = require("../models/Article");
const ReaderProfile = require("../models/ReaderProfile");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const {
  resolveSiteUrl,
  resolveBrandName,
  buildDigestHtml,
  buildDigestPlainText,
  subjectForEmail,
  sendDigestViaResend,
  isDigestMailConfigured,
} = require("./newsletterDigestMail");

const DEFAULT_LIMIT = 10;
const MS_DAY = 86400000;
const MS_WEEK = 7 * MS_DAY;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getLatestPublishedArticles(limit = DEFAULT_LIMIT) {
  return Article.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("primaryLocale title titleHi summary summaryHi category tags images publishedAt")
    .lean();
}

/**
 * Latest stories, optionally weighted toward reader preferences (categories / tags).
 * Falls back to general top stories so the email is rarely empty.
 */
async function getArticlesForDigest(limit = DEFAULT_LIMIT, prefs = {}) {
  const cats = (prefs.preferredCategories || []).filter(Boolean);
  const topics = (prefs.newsletterTopics || []).filter(Boolean);

  if (!cats.length && !topics.length) {
    return getLatestPublishedArticles(limit);
  }

  const or = [];
  if (cats.length) or.push({ category: { $in: cats } });
  if (topics.length) or.push({ tags: { $in: topics } });

  const matched = await Article.find({ status: "published", $or: or })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("primaryLocale title titleHi summary summaryHi category tags images publishedAt")
    .lean();

  let fallback = false;
  if (matched.length < limit) {
    fallback = matched.length > 0 || cats.length > 0 || topics.length > 0;
    const general = await getLatestPublishedArticles(limit * 2);
    const ids = new Set(matched.map((a) => String(a._id)));
    const merged = [...matched];
    for (const g of general) {
      if (merged.length >= limit) break;
      if (!ids.has(String(g._id))) merged.push(g);
    }
    return { articles: merged.slice(0, limit), fallback };
  }

  return { articles: matched.slice(0, limit), fallback: false };
}

function buildPreferenceSummary(cats, topics, fallback) {
  if (!cats?.length && !topics?.length) return null;
  return {
    categories: cats || [],
    topics: topics || [],
    fallback: !!fallback,
  };
}

/**
 * Send a single digest email (welcome or scheduled) with the latest published articles.
 * @returns {Promise<{ ok?: boolean, skipped?: boolean, reason?: string }>}
 */
async function sendLatestStoriesNewsletter({
  email,
  displayName = "",
  isWelcome = false,
  articleLimit = DEFAULT_LIMIT,
  digestCadence = "daily",
  preferredCategories = [],
  newsletterTopics = [],
}) {
  const to = String(email || "")
    .toLowerCase()
    .trim();
  if (!to) return { skipped: true, reason: "no_email" };

  if (!isDigestMailConfigured()) {
    return { skipped: true, reason: "not_configured" };
  }

  const cadence = digestCadence === "weekly" ? "weekly" : "daily";
  const prefs = { preferredCategories, newsletterTopics };
  const { articles, fallback } = await getArticlesForDigest(articleLimit, prefs);
  if (!articles.length) {
    return { skipped: true, reason: "no_articles" };
  }

  const siteUrl = resolveSiteUrl();
  const brandName = resolveBrandName();
  const preferenceSummary = buildPreferenceSummary(preferredCategories, newsletterTopics, fallback);

  const mailOpts = {
    siteUrl,
    greetingName: displayName || "",
    brandName,
    variant: isWelcome ? "welcome" : "digest",
    digestCadence: cadence,
    preferenceSummary,
  };

  const html = buildDigestHtml(articles, mailOpts);
  const text = buildDigestPlainText(articles, mailOpts);
  const subject = subjectForEmail({
    brandName,
    variant: isWelcome ? "welcome" : "digest",
    digestCadence: cadence,
  });

  const r = await sendDigestViaResend({ to, subject, html, text });
  if (!r.ok && !r.skipped) {
    console.error("[newsletter digest] Resend failed:", to, r.status, r.data);
  }
  return r;
}

/**
 * Build unique recipient list: reader profiles win over bare email subscribers (same email).
 */
async function collectDigestRecipients() {
  const map = new Map();

  const profiles = await ReaderProfile.find({ newsletterEnabled: true })
    .populate({ path: "reader", match: { isActive: true }, select: "email name" })
    .lean();

  for (const p of profiles) {
    const reader = p.reader;
    if (!reader?.email) continue;
    const email = String(reader.email).toLowerCase();
    map.set(email, {
      email,
      name: reader.name || "",
      cadence: p.digestCadence || "daily",
      lastDigestSentAt: p.lastDigestSentAt || null,
      kind: "reader",
      profileId: p._id,
      preferredCategories: p.preferredCategories || [],
      newsletterTopics: p.newsletterTopics || [],
    });
  }

  const subs = await NewsletterSubscriber.find({ active: true }).lean();
  for (const s of subs) {
    const email = String(s.email).toLowerCase();
    if (map.has(email)) continue;
    map.set(email, {
      email,
      name: "",
      cadence: s.digestCadence || "daily",
      lastDigestSentAt: s.lastDigestSentAt || null,
      kind: "subscriber",
      subscriberId: s._id,
      preferredCategories: [],
      newsletterTopics: [],
    });
  }

  return [...map.values()];
}

function shouldSendForCadence(cadence, lastSent) {
  if (cadence === "off") return false;
  const now = Date.now();
  const last = lastSent ? new Date(lastSent).getTime() : 0;
  if (cadence === "weekly") {
    return !last || now - last >= MS_WEEK * 0.92;
  }
  /* daily default */
  return !last || now - last >= MS_DAY * 0.85;
}

/**
 * Cron / script: send digest to everyone due by cadence; updates lastDigestSentAt.
 */
async function runScheduledNewsletterDigests({ pauseMs = 550 } = {}) {
  if (!isDigestMailConfigured()) {
    return { sent: 0, skipped: true, reason: "RESEND_API_KEY or NEWSLETTER_FROM missing" };
  }

  const recipients = await collectDigestRecipients();
  const siteUrl = resolveSiteUrl();
  const brandName = resolveBrandName();

  let sent = 0;
  const errors = [];

  for (const rec of recipients) {
    if (!shouldSendForCadence(rec.cadence, rec.lastDigestSentAt)) continue;

    const cadence = rec.cadence === "weekly" ? "weekly" : "daily";
    const prefs = {
      preferredCategories: rec.preferredCategories || [],
      newsletterTopics: rec.newsletterTopics || [],
    };
    const { articles, fallback } = await getArticlesForDigest(DEFAULT_LIMIT, prefs);
    if (!articles.length) continue;

    const preferenceSummary = buildPreferenceSummary(
      prefs.preferredCategories,
      prefs.newsletterTopics,
      fallback
    );

    const mailOpts = {
      siteUrl,
      greetingName: rec.name || "",
      brandName,
      variant: "digest",
      digestCadence: cadence,
      preferenceSummary,
    };

    const dateLabel = new Date().toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    try {
      const r = await sendDigestViaResend({
        to: rec.email,
        subject: subjectForEmail({
          brandName,
          variant: "digest",
          digestCadence: cadence,
          dateLabel,
        }),
        html: buildDigestHtml(articles, mailOpts),
        text: buildDigestPlainText(articles, mailOpts),
      });

      if (!r.ok && !r.skipped) {
        errors.push({ email: rec.email, status: r.status });
        continue;
      }

      const now = new Date();
      if (rec.kind === "reader") {
        await ReaderProfile.updateOne({ _id: rec.profileId }, { $set: { lastDigestSentAt: now } });
      } else {
        await NewsletterSubscriber.updateOne({ _id: rec.subscriberId }, { $set: { lastDigestSentAt: now } });
      }
      sent++;
      await sleep(pauseMs);
    } catch (err) {
      errors.push({ email: rec.email, message: err.message });
    }
  }

  return { sent, errors: errors.length ? errors : undefined };
}

module.exports = {
  getLatestPublishedArticles,
  getArticlesForDigest,
  sendLatestStoriesNewsletter,
  collectDigestRecipients,
  runScheduledNewsletterDigests,
  shouldSendForCadence,
};
