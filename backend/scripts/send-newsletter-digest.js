/**
 * Send scheduled newsletter digests (daily / weekly) to opted-in readers + footer subscribers.
 *
 * Configure: RESEND_API_KEY, NEWSLETTER_FROM, NEWSLETTER_SITE_URL (canonical public web URL).
 * Schedule with cron (example daily 8:00 IST server time — adjust TZ):
 *   0 8 * * * cd /path/to/backend && node scripts/send-newsletter-digest.js
 *
 * Usage:
 *   npm run newsletter:digest --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const connectDB = require("../config/db");
const { runScheduledNewsletterDigests } = require("../services/newsletterDigest");

(async () => {
  await connectDB();
  try {
    const r = await runScheduledNewsletterDigests();
    console.log("[newsletter:digest]", JSON.stringify(r));
    process.exit(0);
  } catch (err) {
    console.error("[newsletter:digest]", err);
    process.exit(1);
  }
})();
