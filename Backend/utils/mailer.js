let transporter = null;
let mailerReady = false;

try {
  // Lazy-create transporter only if nodemailer is available
  const nodemailer = require('nodemailer');
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: !process.env.SMTP_PORT || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    mailerReady = true;
  } else {
    console.warn('[mailer] SMTP_USER/SMTP_PASS not set; emails disabled');
  }
} catch (e) {
  console.warn('[mailer] Nodemailer not installed; emails disabled');
}

async function sendMail({ to, subject, html, text, cc, bcc, replyTo, attachments, headers }) {
  if (!mailerReady || !transporter) {
    console.warn(`[mailer] Skipping email to "${to}" (mailer not ready)`);
    return { skipped: true };
  }
  const fromName = process.env.FROM_NAME || 'MindCare Hub';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  const message = { from, to, subject, text, html };
  if (cc) message.cc = cc;
  if (bcc) message.bcc = bcc;
  if (replyTo) message.replyTo = replyTo;
  if (attachments) message.attachments = attachments;
  if (headers) message.headers = headers;
  return transporter.sendMail(message);
}

module.exports = { sendMail };
