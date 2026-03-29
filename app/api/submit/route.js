import nodemailer from 'nodemailer';

const SYSTEM_NAME = 'IT Help Desk';
const SLA_TEXT    = 'ภายใน 4 ชั่วโมง (วิกฤต) | 8 ชั่วโมง (เร่งด่วน) | 1-2 วันทำการ (ปกติ)';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendConfirmationEmail({ to, name, ticketId, category, priority, subject, description, submittedAt }) {
  const priLabel = { low:'ปกติ', medium:'เร่งด่วน', critical:'วิกฤต' }[priority] || priority;
  await getTransporter().sendMail({
    from   : `"${SYSTEM_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject: `[${ticketId}] ได้รับคำร้องของคุณแล้ว — ${subject}`,
    html   : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1a7f72,#0e9e8a);padding:32px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0">ได้รับคำร้องของคุณแล้ว</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px">
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>ชื่อ:</strong> ${name}</p>
        <p><strong>หมวดหมู่:</strong> ${category}</p>
        <p><strong>ความเร่งด่วน:</strong> ${priLabel}</p>
        <p><strong>หัวข้อ:</strong> ${subject}</p>
        <p><strong>รายละเอียด:</strong> ${description}</p>
        <p><strong>วันที่แจ้ง:</strong> ${submittedAt}</p>
        <p style="color:#6b7280;font-size:12px">SLA: ${SLA_TEXT}</p>
      </div>
    </div>`,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const url  = process.env.APPS_SCRIPT_URL;

    // ส่งไป Apps Script
    const res = await fetch(url, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
      redirect: 'follow',
    });

    const text = await res.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      // ถ้า parse ไม่ได้ ลอง fetch อีกครั้งด้วย URL ที่ redirect แล้ว
      const finalUrl = res.url;
      const res2 = await fetch(finalUrl, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(body),
      });
      result = JSON.parse(await res2.text());
    }

    // ส่ง email แยก try/catch ไม่ให้กระทบ ticket
    if (result.success) {
      try {
        const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
        await sendConfirmationEmail({
          to         : body.email,
          name       : body.name,
          ticketId   : result.ticketId,
          category   : body.category,
          priority   : body.priority,
          subject    : body.subject,
          description: body.description,
          submittedAt: now,
        });
      } catch (mailErr) {
        console.error('Email error:', mailErr.message);
      }
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}