import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const filePath = path.join(process.cwd(), "sales.json");
  const existing =
    fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").trim()
      ? JSON.parse(fs.readFileSync(filePath, "utf8"))
      : [];

  existing.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  res.status(200).json({ success: true });
}
