# Modern Suitor — Landing Page

A Next.js landing page with a waitlist that posts signups to Google Sheets via Vercel.

---

## Architecture

```
Visitor → modernsuitor.com (Vercel)
              │
              ▼
       /api/waitlist (Next.js route)
              │
              ▼ (HTTPS POST with shared secret)
       Google Apps Script Web App
              │
              ▼
         Google Sheet
```

You hold no API keys, no service accounts, no databases. The Apps Script lives in your Sheet and acts as the writer.

---

## Deployment, end to end (~20 minutes)

### Step 1 — Create the Google Sheet (3 minutes)

1. Go to https://sheets.new
2. Rename it to "Modern Suitor Waitlist"
3. Don't add columns manually, the script does this on first signup

### Step 2 — Set up the Apps Script (5 minutes)

1. In your Sheet, go to **Extensions → Apps Script**
2. Delete the placeholder `function myFunction() {}`
3. Open `google-apps-script.js` from this repo and copy the entire contents
4. Paste into the Apps Script editor
5. **Replace the SHARED_SECRET value** with a long random string. Generate one with:
   - On Mac/Linux terminal: `openssl rand -hex 32`
   - Or use any random password generator
   - Save this value somewhere, you'll need it again in Step 4
6. Click the floppy disk **Save** icon
7. Click **Deploy → New deployment**
8. Click the gear icon next to "Select type" → choose **Web app**
9. Configure:
   - Description: `Modern Suitor waitlist v1`
   - Execute as: **Me (your@email)**
   - Who has access: **Anyone** (this is required for the webhook to work, the secret protects it)
10. Click **Deploy**
11. Authorize when prompted (you'll see a "Google hasn't verified this app" warning, click **Advanced → Go to Modern Suitor Waitlist (unsafe)** — this is your own script, it's safe)
12. **Copy the Web app URL.** It looks like `https://script.google.com/macros/s/AKfycb.../exec`. Save this, you'll need it in Step 4.

### Step 3 — Push to GitHub (5 minutes)

If you don't have GitHub set up yet:
1. Create a new repo at https://github.com/new (private is fine)
2. Name it `modern-suitor-landing`

Then from your local terminal:

```bash
cd modern-suitor-landing
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/modern-suitor-landing.git
git push -u origin main
```

### Step 4 — Deploy to Vercel (5 minutes)

1. Go to https://vercel.com and sign in (use GitHub for fastest setup)
2. Click **Add New → Project**
3. Import your `modern-suitor-landing` repo
4. **Before clicking Deploy**, expand the **Environment Variables** section
5. Add two variables:

| Name | Value |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | The Web app URL from Step 2.12 |
| `GOOGLE_SHEETS_SECRET` | The exact same secret from Step 2.5 |

6. Click **Deploy**. Wait ~60 seconds.
7. Vercel gives you a URL like `modern-suitor-landing-xyz.vercel.app`. Open it. The page should load.
8. Click "Join the waitlist," fill in fake info, submit. Check your Sheet, you should see a new row.

### Step 5 — Connect your domain (5 minutes)

1. In Vercel, click your project → **Settings → Domains**
2. Type `modernsuitor.com` and click Add
3. Vercel shows you the DNS records to add at your registrar
4. Log into wherever you bought the domain (GoDaddy, Namecheap, Cloudflare, etc.)
5. Replace the existing DNS records with what Vercel showed you
   - Usually an A record pointing to `76.76.21.21` and a CNAME on `www` pointing to `cname.vercel-dns.com`
6. Wait 5 to 60 minutes for DNS to propagate. Vercel will show "Valid Configuration" when ready.
7. Done. modernsuitor.com is live.

---

## Local development

```bash
cd modern-suitor-landing
npm install
cp .env.example .env.local
# Edit .env.local with your real webhook URL and secret
npm run dev
```

Then open http://localhost:3000

---

## Troubleshooting

**"Could not save signup"** when submitting the form
- Check Vercel function logs (Vercel dashboard → your project → Logs)
- Most common cause: the `GOOGLE_SHEETS_SECRET` doesn't match between Vercel and the Apps Script
- Second most common: the Apps Script wasn't deployed with "Anyone" access

**The Sheet isn't updating**
- Open the Apps Script editor → click **Executions** in the left sidebar to see recent runs and any errors
- Make sure the Apps Script is deployed (Deploy → Manage deployments should show an active one)

**The signup count shows 0 or 127 forever**
- The `GET /api/waitlist` call is failing silently. Check Vercel logs.
- The page falls back to the seeded baseline (127) when the count call fails, so the page still works

**You changed the SHARED_SECRET in the Apps Script after deploying**
- You need to redeploy the script (Deploy → Manage deployments → ... → Edit → New version → Deploy)
- And update the `GOOGLE_SHEETS_SECRET` env var in Vercel to match
- Then redeploy the Vercel project (the env vars are baked at deploy time)

**Want to add more form fields**
1. Add the field to `WaitlistModal` in `components/Landing.jsx`
2. Add it to the validation in `app/api/waitlist/route.js`
3. Pass it to the webhook payload
4. Add it to the `appendRow` in `google-apps-script.js`
5. Manually add the column header in your Sheet, or delete row 1 and let the script recreate it

---

## What's next after launch

Once you have signups flowing:

1. **Watch the "biggest challenge" responses.** Read every one. They tell you exactly what marketing copy to lead with.
2. **Wire up email capture for outreach.** When you're 2 weeks from beta, export the Sheet, import to ConvertKit/Beehiiv, send a "you're invited" sequence.
3. **Add basic analytics.** Vercel Analytics is one click. Or wire up Plausible (~$9/mo) for a cleaner view.
4. **Add a referral/share mechanic** if signups are strong. The current page can support `?ref=...` params with one extra column added to the Sheet.

The page is intentionally fast and minimal. Don't add features until traffic tells you to.
