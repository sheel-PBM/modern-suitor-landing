// Posts new signups to Supabase and returns the current count.
//
// Required env vars (set in Vercel project settings):
//   SUPABASE_URL              — https://YOUR-PROJECT.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — service_role key (NOT the anon key)
//
// The service_role key bypasses Row Level Security, so it must NEVER be
// exposed to the browser. Keep it server-side only (no NEXT_PUBLIC_ prefix).

export const runtime = "edge";

function supabaseUrl() {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL not configured");
  return url.replace(/\/+$/, "");
}

function supabaseKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return key;
}

async function insertSignup(row) {
  const res = await fetch(`${supabaseUrl()}/rest/v1/waitlist_signups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey(),
      Authorization: `Bearer ${supabaseKey()}`,
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok && res.status !== 409) {
    // 409 conflict = duplicate email, which we treat as success
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase insert failed ${res.status}: ${text}`);
  }
  return { ok: true, duplicate: res.status === 409 };
}

async function fetchCount() {
  const res = await fetch(`${supabaseUrl()}/rest/v1/waitlist_count?select=count`, {
    headers: {
      apikey: supabaseKey(),
      Authorization: `Bearer ${supabaseKey()}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase count failed ${res.status}`);
  const data = await res.json();
  return data?.[0]?.count ?? 0;
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

    // Useful analytics fields from request headers
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const country = req.headers.get("x-vercel-ip-country") || "";

    const result = await insertSignup({
      email: email.trim().toLowerCase(),
      age: parseInt(age, 10),
      challenge: challenge.trim(),
      country,
      referer,
      user_agent: userAgent,
    });

    return Response.json({ ok: true, duplicate: result.duplicate });
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
    const count = await fetchCount();
    return Response.json({ count });
  } catch (err) {
    console.error("Waitlist GET error:", err);
    // Fail open: return 0 so the UI still works
    return Response.json({ count: 0 });
  }
}
