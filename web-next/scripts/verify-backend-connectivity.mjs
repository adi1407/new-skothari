/**
 * Confirms web-next ↔ backend wiring:
 * 1) GET /api/health on the Express app (default :5050)
 * 2) Same path through Next.js rewrites (default :5280, see web-next package.json dev script)
 *
 * Usage (from web-next/): npm run verify:connectivity
 * Override: VERIFY_BACKEND_URL=http://127.0.0.1:5050 VERIFY_NEXT_URL=http://127.0.0.1:5280
 */
const backendBase = (process.env.VERIFY_BACKEND_URL || "http://127.0.0.1:5050").replace(/\/$/, "");
const nextBase = (process.env.VERIFY_NEXT_URL || "http://127.0.0.1:5280").replace(/\/$/, "");

async function check(base, label) {
  const url = `${base}/api/health`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    if (!res.ok) {
      console.error(`FAIL ${label} (${url}): HTTP ${res.status} — ${text.slice(0, 200)}`);
      return false;
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(`FAIL ${label}: response is not JSON — ${text.slice(0, 200)}`);
      return false;
    }
    if (data.status !== "ok") {
      console.error(`FAIL ${label}: expected { status: "ok" }, got`, data);
      return false;
    }
    console.log(`OK ${label}: ${url} →`, data);
    return true;
  } catch (err) {
    console.error(`FAIL ${label} (${url}):`, err.message);
    return false;
  }
}

const direct = await check(backendBase, "Backend direct");
const proxied = await check(nextBase, "Via Next.js rewrite");

if (!direct || !proxied) {
  console.error("\nTip: start backend (`npm start` in backend/ or port 5050) and Next (`npm run dev` in web-next/).");
  process.exit(1);
}

console.log("\nConnectivity check passed.");
