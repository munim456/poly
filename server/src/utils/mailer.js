import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export function isEmailConfigured() {
  return Boolean(smtpConfigured() && process.env.ADMIN_NOTIFY_EMAIL)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDeadline(deadline) {
  if (!deadline) return 'Not specified'
  const raw = String(deadline).trim()
  // Date-only values (YYYY-MM-DD) must not be shifted by the server timezone
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) {
    return `${parseInt(dateOnly[3], 10)} ${MONTHS[parseInt(dateOnly[2], 10) - 1]} ${dateOnly[1]}`
  }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function renderTableEmail({ header, rows, note }) {
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #e5e9ee;color:#55636f;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">${label}</td>
          <td style="padding:8px 16px;border-bottom:1px solid #e5e9ee;color:#0b1f3a;font-size:14px;font-weight:600;">${value}</td>
        </tr>`
    )
    .join('')

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#0b1f3a;padding:20px 24px;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;">${header}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e9ee;">
        <tbody>${htmlRows}</tbody>
      </table>
      ${note ? `<p style="color:#55636f;font-size:12px;margin-top:16px;">${note}</p>` : ''}
    </div>`
}

async function sendOrSkip({ to, replyTo, subject, text, html, label }) {
  if (!smtpConfigured()) {
    console.warn(`[mailer] ${label} skipped — SMTP credentials not configured`)
    return false
  }
  if (!to) {
    console.warn(`[mailer] ${label} skipped — no recipient email available`)
    return false
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to,
    ...(replyTo ? { replyTo } : {}),
    subject,
    text,
    html,
  })

  console.log(`[mailer] ${label} sent to ${to}`)
  return true
}

// ---------------------------------------------------------------------------
// Admin: new order / RFQ received
// ---------------------------------------------------------------------------

export function buildAdminOrderEmail({ order, buyer, product }) {
  const isRfq = order.status === 'quote_requested'
  const subject = `${isRfq ? 'New RFQ' : 'New Order'} #${order.id} — ${product.name} (${order.quantity} kg)`

  const rows = [
    ['Order ID', `#${order.id}`],
    ['Type', isRfq ? 'Quote Request' : 'Price Proposal (Negotiation)'],
    ['Company', buyer.company_name],
    ['Contact Person', buyer.contact_person || '—'],
    ['Phone', buyer.phone || '—'],
    ['Email', buyer.email],
    ['Product', product.name],
    ['Purchase Type', order.purchase_type === 'wholesale' ? 'Wholesale' : 'Regular'],
    ['Quantity', `${order.quantity} kg`],
    ['Requested Price', order.requested_price ? `৳${order.requested_price}/kg` : 'Standard pricing'],
    ['Delivery Deadline', formatDeadline(order.delivery_deadline)],
    ['Notes', order.notes || '—'],
  ]

  return {
    subject,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: renderTableEmail({
      header: 'PolyConnect — New Order Notification',
      rows,
      note: 'Log in to the staff dashboard to respond to this request.',
    }),
  }
}

export async function sendAdminNewOrderNotification({ order, buyer, product }) {
  const { subject, text, html } = buildAdminOrderEmail({ order, buyer, product })
  await sendOrSkip({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    replyTo: buyer.email,
    subject,
    text,
    html,
    label: `Admin notification about order #${order.id}`,
  })
}

// ---------------------------------------------------------------------------
// Buyer: order status changed
// ---------------------------------------------------------------------------

const STATUS_LABELS = {
  quote_requested: 'Quote Requested',
  negotiating: 'Negotiating',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  ready: 'Ready for Dispatch',
  dispatched: 'Dispatched',
  cancelled: 'Cancelled',
}

export function buildBuyerStatusEmail({ order, product }) {
  const statusLabel = STATUS_LABELS[order.status] || order.status
  const subject = `Order #${order.id} Update — ${statusLabel}`

  const rows = [
    ['Order ID', `#${order.id}`],
    ['Product', product.name],
    ['Quantity', `${order.quantity} kg`],
    ['Status', statusLabel],
    ...(order.final_agreed_price
      ? [['Agreed Price', `৳${order.final_agreed_price}/kg`]]
      : []),
    ['Delivery Deadline', formatDeadline(order.delivery_deadline)],
  ]

  return {
    subject,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: renderTableEmail({
      header: `PolyConnect — Order #${order.id} ${statusLabel}`,
      rows,
      note: 'View your order history in the PolyConnect buyer dashboard.',
    }),
  }
}

export async function sendBuyerStatusNotification({ order, buyer, product }) {
  const { subject, text, html } = buildBuyerStatusEmail({ order, product })
  await sendOrSkip({
    to: buyer?.email,
    subject,
    text,
    html,
    label: `Buyer status update for order #${order.id}`,
  })
}

// ---------------------------------------------------------------------------
// Negotiation: message sent to the other party
// ---------------------------------------------------------------------------

export function buildNegotiationMessageEmail({ order, product, message, senderLabel }) {
  const subject = `Offer Update on Order #${order.id} — ${product.name}`

  const rows = [
    ['Order ID', `#${order.id}`],
    ['Product', product.name],
    ['Quantity', `${order.quantity} kg`],
    ['From', senderLabel],
    ['Offered Price', `৳${message.offered_price}/kg`],
    ...(message.note ? [['Note', message.note]] : []),
  ]

  return {
    subject,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: renderTableEmail({
      header: `PolyConnect — New Offer on Order #${order.id}`,
      rows,
      note: 'Open the negotiation thread in your dashboard to respond.',
    }),
  }
}

export async function sendNegotiationMessageNotification({
  order,
  product,
  message,
  senderLabel,
  recipientEmail,
}) {
  const { subject, text, html } = buildNegotiationMessageEmail({
    order,
    product,
    message,
    senderLabel,
  })
  await sendOrSkip({
    to: recipientEmail,
    subject,
    text,
    html,
    label: `Negotiation update for order #${order.id}`,
  })
}

// ---------------------------------------------------------------------------
// Buyer: password reset
// ---------------------------------------------------------------------------

export function buildBuyerResetEmail({ contactName, resetUrl, expiryMinutes }) {
  const name = contactName || 'there'
  const subject = 'Reset your PolyConnect password'

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#0b1f3a;padding:20px 24px;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;">PolyConnect — Password Reset</h2>
      </div>
      <div style="border:1px solid #e5e9ee;border-top:none;padding:24px;">
        <p style="color:#0b1f3a;font-size:14px;">Hello ${name},</p>
        <p style="color:#55636f;font-size:14px;line-height:1.6;">
          We received a request to reset your account password. Click the button below
          to choose a new one. This link is valid for ${expiryMinutes} minutes and can be used once.
        </p>
        <p style="margin:24px 0;">
          <a href="${resetUrl}"
             style="background:#1e4e79;color:#ffffff;padding:12px 24px;text-decoration:none;
                    font-size:14px;display:inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color:#55636f;font-size:13px;line-height:1.6;">
          If you did not request this, you can safely ignore this email —
          your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #e5e9ee;margin:20px 0;" />
        <p style="color:#8b98a5;font-size:12px;word-break:break-all;">
          If the button does not work, copy this link into your browser:<br />
          ${resetUrl}
        </p>
      </div>
    </div>`

  return {
    subject,
    text: `Hello ${name},\n\nReset your PolyConnect password using this link (valid ${expiryMinutes} minutes):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html,
  }
}

export async function sendBuyerResetEmail({ email, contactName, resetUrl, expiryMinutes }) {
  const { subject, text, html } = buildBuyerResetEmail({ contactName, resetUrl, expiryMinutes })
  return sendOrSkip({
    to: email,
    subject,
    text,
    html,
    label: `Password reset for ${email}`,
  })
}
