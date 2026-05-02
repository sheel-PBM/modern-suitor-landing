// Captures waitlist signups to Vercel runtime logs as structured JSON.
// Each signup appears as a single log line tagged "WAITLIST_SIGNUP" so
// they can be pulled later via the Vercel MCP / dashboard logs and
// imported into a spreadsheet.

export const runtime = "edge";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, age, challenge } = body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!age || !/^\d{2}$/.test(String(age))) {
      return Response.json({ error: "Invalid age" }, { status: 400 });
    }
    if (!challenge || typeof challenge !== "string" || challenge.length > 200) {
      return Response.json({ error: "Invalid challenge" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const country = req.headers.get("x-vercel-ip-country") || "";

    const signup = {
      timestamp: new Date().toISOString(),
      email: email.trim().toLowerCase(),
      age: String(age),
      challenge: challenge.trim(),
      country,
      referer,
      userAgent,
    };

    console.log("WAITLIST_SIGNUP " + JSON.stringify(signup));

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
  return Response.json({ count: 0 });
}
