// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { google } = require("googleapis");

// ---------- Config ----------
const PORT = process.env.PORT || 10000;

// Preferred: put your service account JSON into an env var GOOGLE_CREDENTIALS
// Fallback: load from the file in the repo (vibes-prints-creds.json)
let creds;
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (e) {
    console.error("Failed to parse GOOGLE_CREDENTIALS env var:", e);
  }
}
if (!creds) {
  try {
    creds = require("./vibes-prints-creds.json");
  } catch {
    console.warn("No GOOGLE_CREDENTIALS env var and no vibes-prints-creds.json file found.");
  }
}

// You MUST set this env var on Render: SHEET_ID=<your spreadsheet id>
const SPREADSHEET_ID = process.env.SHEET_ID;

// ---------- Google Sheets helpers ----------
async function getSheetsClient() {
  if (!creds) throw new Error("Missing Google credentials.");
  if (!SPREADSHEET_ID) throw new Error("Missing SHEET_ID env var.");

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

async function appendRow(tabName, values) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

// ---------- App ----------
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Log a SALE (already called by Buy Now)
app.post("/api/logSale", async (req, res) => {
  try {
    const { title, price, name = "", email = "", note = "" } = req.body || {};
    const ts = new Date().toISOString();
    await appendRow("Sales", [ts, title || "", price || "", name, email, note]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Log an OFFER (new)
app.post("/api/logOffer", async (req, res) => {
  try {
    const { title, offer, name = "", email = "", note = "" } = req.body || {};
    const ts = new Date().toISOString();
    await appendRow("Offers", [ts, title || "", offer || "", name, email, note]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Serve React build in production
const clientBuild = path.join(__dirname, "client", "build");
app.use(express.static(clientBuild));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
