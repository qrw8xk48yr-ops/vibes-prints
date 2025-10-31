import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Save counteroffer to JSON file
  const filePath = path.join(process.cwd(), "counteroffers.json");
  const existing =
    fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").trim()
      ? JSON.parse(fs.readFileSync(filePath, "utf8"))
      : [];

  existing.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  // ---- EMAIL SECTION ----
  try {
    const { email, name, title, amount, message } = req.body;

    if (email) {
      // Create transporter using Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // your Gmail address
          pass: process.env.EMAIL_PASS, // your Gmail app password
        },
      });

      const mailOptions = {
        from: `"Vibes & Prints" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Counteroffer for ${title}`,
        text: `Hey ${name || "there"}, 

We’ve reviewed your offer on "${title}".
Our counteroffer is $${amount}.

Message: ${message || "No message provided."}

You can accept or make another offer here:
https://your-deployed-site-url.com

Thanks for supporting Vibes & Prints!
`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Counteroffer email sent to ${email}`);
    }
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }

  res.status(200).json({ success: true });
}
