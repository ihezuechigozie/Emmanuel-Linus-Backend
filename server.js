
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;


const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "EMAIL_USER", "EMAIL_PASS"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing required .env variables:", missing.join(", "));
  process.exit(1);
}

app.use(cors({
  origin: "*",               
  methods: ["GET", "POST"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

app.get("/mail", (req, res) => {
  res.send("Backend is running");
});


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "false" ? false : true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Error verifying mail transporter:", err);
  } else {
    console.log("Mail transporter is ready");
  }
});

app.post("/contact", async (req, res) => {
  try {
    const { name = "No name", email = "no-reply@example.com", subject = "Contact form", message = "" } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields (email, message)." });
    }

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: ["admin@talkmuchglobal.com", "ihezuechigozie@gmail.com"], 
      subject: `${subject} — New message from ${name}`,
      html: `
        <h3>New contact message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p>Sent from your website contact form</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Failed to send email:", err);
    return res.status(500).json({ success: false, error: "Email failed to send" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (PORT=${PORT})`);
});
