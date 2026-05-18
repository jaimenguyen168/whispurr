import { action } from "../_generated/server";
import { api } from "../_generated/api";

/**
 * Generates a Stream Video user token for the currently authenticated user.
 *
 * Stream registers users automatically via WebSocket handshake when they
 * connect through the SDK — no server-side user creation is needed or possible
 * via the Video REST API.
 *
 * Set STREAM_API_KEY and STREAM_API_SECRET in your Convex dashboard:
 * https://dashboard.convex.dev → Settings → Environment Variables
 */
export const generateStreamToken = action({
  args: {},
  handler: async (ctx): Promise<{ token: string; userId: string }> => {
    const user = await ctx.runQuery(api.functions.users.getCurrentUser);
    if (!user) throw new Error("User not authenticated");

    const apiSecret = process.env.STREAM_API_SECRET;
    if (!apiSecret) {
      throw new Error(
        "STREAM_API_SECRET not configured. Add it in your Convex dashboard under Settings → Environment Variables.",
      );
    }

    const token = await generateStreamJWT(user._id, apiSecret);
    return { token, userId: user._id };
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function generateStreamJWT(userId: string, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { user_id: userId, iat: now, exp: now + 60 * 60 };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const signingInput = `${encode(header)}.${encode(payload)}`;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(signingInput));
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${signingInput}.${sigBase64}`;
}
