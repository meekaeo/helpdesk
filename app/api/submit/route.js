import nodemailer from 'nodemailer';

const SYSTEM_NAME = 'IT Help Desk';
const SITE_URL    = 'https://mec-helpdesk.vercel.app';
const SLA_TEXT    = '🔴 วิกฤต — ภายใน 4 ชั่วโมง  |  🟡 เร่งด่วน — ภายใน 8 ชั่วโมง  |  🟢 ปกติ — ภายใน 1-2 วันทำการ';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendConfirmationEmail({ to, name, ticketId, category, priority, subject, description, fileUrl, fileName, submittedAt }) {
  const priLabel = { low:'🟢 ปกติ', medium:'🟡 เร่งด่วน', critical:'🔴 วิกฤต' }[priority] || priority;
  const fileRow  = fileUrl
    ? `<tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:35%;border-right:1px solid #e5e7eb;background:#fafafa">ไฟล์แนบ</td><td style="padding:10px 16px;font-size:13px"><a href="${fileUrl}" style="color:#1a7f72">${fileName}</a></td></tr>`
    : '';

  await getTransporter().sendMail({
    from   : `"${SYSTEM_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject: `[${ticketId}] ได้รับคำร้องของคุณแล้ว — ${subject}`,
    html   : `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#1a7f72,#0e9e8a);padding:32px;text-align:center">
  <div style="font-size:36px">🛠</div>
  <h1 style="color:#fff;font-size:22px;margin:12px 0 4px">ได้รับคำร้องของคุณแล้ว</h1>
  <p style="color:rgba(255,255,255,.8);font-size:14px;margin:0">${SYSTEM_NAME}</p>
</td></tr>
<tr><td style="padding:28px 32px 0;text-align:center">
  <div style="display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:12px 28px">
    <div style="font-size:11px;color:#6b7280;letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px">Ticket ID</div>
    <div style="font-size:22px;font-weight:700;color:#1a7f72;letter-spacing:2px;font-family:monospace">${ticketId}</div>
  </div>
</td></tr>
<tr><td style="padding:24px 32px">
  <table width="100%" style="border:1px solid #e5e7eb;border-radius:10px;border-collapse:collapse">
    <tr style="background:#f9fafb"><td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151">รายละเอียดคำร้อง</td></tr>
    <tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:35%;border-right:1px solid #e5e7eb;background:#fafafa">ชื่อผู้แจ้ง</td><td style="padding:10px 16px;font-size:13px">${name}</td></tr>
    <tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;border-right:1px solid #e5e7eb;background:#fafafa">หมวดหมู่</td><td style="padding:10px 16px;font-size:13px">${category}</td></tr>
    <tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;border-right:1px solid #e5e7eb;background:#fafafa">ความเร่งด่วน</td><td style="padding:10px 16px;font-size:13px">${priLabel}</td></tr>
    <tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;border-right:1px solid #e5e7eb;background:#fafafa">หัวข้อ</td><td style="padding:10px 16px;font-size:13px">${subject}</td></tr>
    <tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;border-right:1px solid #e5e7eb;background:#fafafa">รายละเอียด</td><td style="padding:10px 16px;font-size:13px;line-height:1.6">${description}</td></tr>
    ${fileRow}
    <tr style="border-top:1px solid #e5e7eb"><td style="padding:10px 16px;color:#6b7280;font-size:13px;border-right:1px solid #e5e7eb;background:#fafafa">วันที่แจ้ง</td><td style="padding:10px 16px;font-size:13px">${submittedAt}</td></tr>
  </table>
</td></tr>
<tr><td style="padding:0 32px 24px">
  <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 16px">
    <p style="margin:0;font-size:13px;color:#92400e">⏱ <strong>SLA:</strong> ${SLA_TEXT}</p>
  </div>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
  <p style="margin:0;font-size:12px;color:#9ca3af">Email นี้ส่งอัตโนมัติจาก ${SYSTEM_NAME} · <a href="mailto:${process.env.SMTP_USER}" style="color:#1a7f72">${process.env.SMTP_USER}</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const url  = process.env.APPS_SCRIPT_URL;

    const res  = await fetch(url, {
      method  : 'POST',
      headers : { 'Content-Type': 'text/plain;charset=utf-8' },
      body    : JSON.stringify(body),
      redirect: 'follow',
    });
    const text = await res.text();

    let result;
    if (text.startsWith('<')) {
      const res2     = await fetch(url, { redirect: 'follow' });
      const finalUrl = res2.url;
      const res3     = await fetch(finalUrl, {
        method : 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body   : JSON.stringify(body),
      });
      result = JSON.parse(await res3.text());
    } else {
      result = JSON.parse(text);
    }

    if (result.success) {
      const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
      await sendConfirmationEmail({
        to         : body.email,
        name       : body.name,
        ticketId   : result.ticketId,
        category   : body.category,
        priority   : body.priority,
        subject    : body.subject,
        description: body.description,
        fileUrl    : body.fileUrl || '',
        fileName   : body.fileName || '',
        submittedAt: now,
      });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}