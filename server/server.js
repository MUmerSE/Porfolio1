/* ═══════════════════════════════════════════════════════
   Muhammad Umer — Portfolio Backend Server
   Express + Nodemailer · Contact Form Handler
   ═══════════════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Nodemailer Transporter ──
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter on startup
transporter.verify()
    .then(() => console.log('✅ SMTP connection verified — ready to send emails'))
    .catch((err) => console.warn('⚠️  SMTP verification failed:', err.message));

// ── POST /api/contact ──
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'All fields are required (name, email, message).',
        });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a valid email address.',
        });
    }

    try {
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
            replyTo: email,
            to: process.env.RECEIVER_EMAIL,
            subject: `💼 New Contact: ${name}`,
            html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a2e;">
          <div style="background: linear-gradient(135deg, #00d4ff, #3a7bfd); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #fff;">New Portfolio Message</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;"><strong style="color: #00d4ff;">Name:</strong> ${name}</p>
            <p style="margin: 0 0 16px;"><strong style="color: #00d4ff;">Email:</strong> <a href="mailto:${email}" style="color: #3a7bfd;">${email}</a></p>
            <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid #1a1a2e;">
              <p style="margin: 0 0 8px; color: #00d4ff; font-weight: 600;">Message:</p>
              <p style="margin: 0; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #1a1a2e; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #666;">Sent from Muhammad Umer's Portfolio</p>
          </div>
        </div>
      `,
        });

        console.log(`📧 Email sent from ${name} <${email}>`);

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!',
        });
    } catch (err) {
        console.error('❌ Email send error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later.',
        });
    }
});

// ── Health check ──
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start Server ──
app.listen(PORT, () => {
    console.log(`\n🚀 Portfolio backend running at http://localhost:${PORT}`);
    console.log(`   POST /api/contact — Send contact form`);
    console.log(`   GET  /api/health  — Health check\n`);
});
