import nodemailer from 'nodemailer';

const SYSTEM_NAME = 'IT Help Desk';
const SITE_URL    = 'https://mec-helpdesk.vercel.app';
const SLA_TEXT    = '🔴 วิกฤต — ภายใน 4 ชั่วโมง  |  🟡 เร่งด่วน — ภายใน 8 ชั่วโมง  |  🟢 ปกติ — ภายใน 1-2 วันทำการ';

function getTransporter() {
  return nodemailer.createTransport({
    host  : 'smtp.live.com',
    port  : 587,
    secure: false,
    auth  : {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendConfirmationEmail({ to, name, ticketId, category, priority, subject, description, fileUrl, fileName, submittedAt }) {
  const priLabel = { low:'🟢 ปกติ', medium:'🟡 เร่งด่วน', critical:'🔴 วิกฤต' }[priority] || priority;
  const fileRow  = fileUrl
    ? `<tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7