import dotenv from 'dotenv'
dotenv.config()

import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_NOTIFY_EMAIL } = process.env

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('Missing SMTP env vars. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env')
  process.exit(1)
}

const to = process.argv[2] || ADMIN_NOTIFY_EMAIL || SMTP_USER

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT || '587', 10),
  secure: parseInt(SMTP_PORT || '587', 10) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

try {
  const info = await transporter.sendMail({
    from: SMTP_USER,
    to,
    subject: 'PolyConnect — SMTP test',
    text: 'SMTP is working. Order notifications and password reset emails will now be delivered.',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#0b1f3a;padding:20px 24px;">
          <h2 style="color:#ffffff;margin:0;font-size:18px;">PolyConnect — SMTP Test</h2>
        </div>
        <div style="border:1px solid #e5e9ee;border-top:none;padding:24px;color:#55636f;font-size:14px;line-height:1.6;">
          SMTP is working. Order notifications and password reset emails will now be delivered.
        </div>
      </div>`,
  })
  console.log(`SENT: ${info.messageId} -> ${to}`)
} catch (error) {
  console.error('FAILED:', error.message)
  process.exit(1)
}
