// Posts new signups to a Google Sheet via Apps Script webhook
// and returns the current count.
//
// Required env vars (set in Vercel project settings):
//   GOOGLE_SHEETS_WEBHOOK_URL   — the deployed Apps Script web app URL
//   GOOGLE_SHEETS_SECRET        — a shared secret string (any value you choose)

export const runtime = "edge";

async function callWebhook(payload) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;

  if (!url || !secret) {
    throw new Error("Webhook not configured");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, secret }),
    // Apps Script can be slow on cold starts
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Webhook returned ${res.status}: ${text}`);
  }

  return res.json();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, age, challenge } = body || {};

    // Server-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!age || !/^\d{2}$/.test(String(age))) {
      return Response.json({ error: "Invalid age" }, { status: 400 });
    }
    if (!challenge || typeof challenge !== "string" || challenge.length > 200) {
      return Response.json({ error: "Invalid challenge" }, { status: 400 });
    }

    // Pull a couple of useful headers for analytics
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const country = req.headers.get("x-vercel-ip-country") || "";

    await callWebhook({
      action: "add",
      email: email.trim().toLowerCase(),
      age: String(age),
      challenge: challenge.trim(),
      userAgent,
      referer,
      country,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Waitlist POST error:", err);
    return Response.json(
      { error: "Could not save signup. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await callWebhook({ action: "count" });
    return Response.json({ count: data?.count || 0 });
  } catch (err) {
    console.error("Waitlist GET error:", err);
    // Fail open: return 0 so the UI still works
    return Response.json({ count: 0 });
  }
}
