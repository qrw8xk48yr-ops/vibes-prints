import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Google Sheets logging ----
const SHEET_ID = process.env.SHEET_ID;
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const sheets = google.sheets({ version: "v4", auth });

app.post("/api/logSale", async (req, res) => {
  try {
    const { title, price } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Orders!A:C",
      valueInputOption: "USER_ENTERED",
      resource: { values: [[new Date().toLocaleString(), title, `$${price}`]] }
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Google Sheets error:", err);
    res.status(500).json({ success: false });
  }
});

// ---- Serve React build ----
app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "client", "build", "index.html"))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎨 Vibes & Prints running on port ${PORT}`));
