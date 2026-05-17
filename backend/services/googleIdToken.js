const { OAuth2Client } = require("google-auth-library");

let oauthClient = null;

function getGoogleClientId() {
  return (process.env.GOOGLE_CLIENT_ID || "").trim();
}

function getOAuthClient() {
  const clientId = getGoogleClientId();
  if (!clientId) return null;
  if (!oauthClient) {
    oauthClient = new OAuth2Client(clientId);
  }
  return oauthClient;
}

/**
 * Verify a Google Sign-In ID token and return trusted identity fields.
 * @param {string} idToken - JWT from Google GIS credential response
 * @returns {Promise<{ googleId: string, email: string, name: string, avatar: string }>}
 */
async function verifyGoogleIdToken(idToken) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    const err = new Error("Google sign-in is not configured on the server");
    err.status = 503;
    throw err;
  }

  const client = getOAuthClient();
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
  } catch {
    const err = new Error("Invalid Google sign-in token");
    err.status = 401;
    throw err;
  }

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    const err = new Error("Invalid Google sign-in token");
    err.status = 401;
    throw err;
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) {
    const err = new Error("Google account email is required");
    err.status = 400;
    throw err;
  }

  const name =
    (typeof payload.name === "string" && payload.name.trim()) ||
    (typeof payload.given_name === "string" && payload.given_name.trim()) ||
    "Reader";

  return {
    googleId: String(payload.sub),
    email,
    name,
    avatar: typeof payload.picture === "string" ? payload.picture : "",
  };
}

module.exports = { verifyGoogleIdToken, getGoogleClientId };
