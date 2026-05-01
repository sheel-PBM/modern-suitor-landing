// =====================================================================
// Modern Suitor — Waitlist Apps Script
// =====================================================================
// Paste this entire file into Apps Script (Extensions → Apps Script)
// Then deploy as a Web App (see README) and copy the URL.
// =====================================================================

// CHANGE THIS to a long random string. The Next.js app sends the same
// value with every request. If they don't match, the request is rejected.
const SHARED_SECRET = "REPLACE_THIS_WITH_A_LONG_RANDOM_STRING";

// The sheet tab name. Default "Signups".
const SHEET_NAME = "Signups";

// =====================================================================

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SHARED_SECRET) {
      return jsonOut({ error: "unauthorized" });
    }

    const sheet = getSheet();

    if (body.action === "count") {
      // Count rows minus the header
      const lastRow = sheet.getLastRow();
      const count = Math.max(0, lastRow - 1);
      return jsonOut({ count });
    }

    if (body.action === "add") {
      // Dedupe on email
      const emails = sheet
        .getRange(2, 2, Math.max(0, sheet.getLastRow() - 1), 1)
        .getValues()
        .flat()
        .map(String);
      if (emails.includes(body.email)) {
        return jsonOut({ ok: true, deduped: true });
      }

      sheet.appendRow([
        body.timestamp || new Date().toISOString(),
        body.email || "",
        body.age || "",
        body.challenge || "",
        body.country || "",
        body.referer || "",
        body.userAgent || "",
      ]);

      return jsonOut({ ok: true });
    }

    return jsonOut({ error: "unknown action" });
  } catch (err) {
    return jsonOut({ error: String(err) });
  }
}

function doGet() {
  // Health check (does NOT expose data, requires secret on POST)
  return jsonOut({ ok: true, service: "modern-suitor-waitlist" });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Email",
      "Age",
      "Biggest Challenge",
      "Country",
      "Referer",
      "User Agent",
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
