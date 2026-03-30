import nodemailer from 'nodemailer';

const SYSTEM_NAME = 'IT Help Desk';
const SITE_URL    = 'https://mec-helpdesk.vercel.app';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendClosingEmail({ to, name, ticketId, subject }) {
  const csatUrl = `${SITE_URL}/csat?ticket=${ticketId}&email=${encodeURIComponent(to)}`;
  await getTransporter().sendMail({
    from   : `"${SYSTEM_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject: `[${ticketId}] งานของคุณเสร็จสิ้นแล้ว — ${subject}`,
    html   : `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center"><div style="font-size:48px">&#x2705;</div><h1 style="color:#fff;font-size:22px;margin:12px 0 4px">งานของคุณเสร็จสิ้นแล้ว!</h1><p style="color:rgba(255,255,255,.8);font-size:14px;margin:0">${SYSTEM_NAME}</p></td></tr><tr><td style="padding:28px 32px;text-align:center"><div style="display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:12px 28px;margin-bottom:20px"><div style="font-size:11px;color:#6b7280;letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px">Ticket ID</div><div style="font-size:22px;font-weight:700;color:#10b981;letter-spacing:2px;font-family:monospace">${ticketId}</div></div><p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:24px">เรียน คุณ${name}<br><br>ทีมไอทีได้ดำเนินการแก้ไข <strong>${subject}</strong> เรียบร้อยแล้ว</p><div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:24px"><p style="font-size:15px;font-weight:600;color:#111827;margin-bottom:6px">&#x1F60A; คุณพึงพอใจการบริการมากน้อยแค่ไหน?</p><p style="font-size:13px;color:#6b7280;margin-bottom:20px">ใช้เวลาไม่ถึง 1 นาที</p><a href="${csatUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a7f72,#0e9e8a);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600">&#x2B50; ให้คะแนนความพึงพอใจ</a></div></td></tr><tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb"><p style="margin:0;font-size:12px;color:#9ca3af">Email นี้ส่งอัตโนมัติจาก ${SYSTEM_NAME} · <a href="mailto:${process.env.SMTP_USER}" style="color:#1a7f72">${process.env.SMTP_USER}</a></p></td></tr></table></td></tr></table></body></html>`,
  });
}

export async function POST(request) {
  try {
    const { ticketId, newStatus, note, userEmail, userName, subject } = await request.json();

    if (!ticketId || !newStatus) {
      return Response.json({ success: false, error: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ action: 'updateStatus', ticketId, newStatus, note: note || '' }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    if (newStatus === 'เสร็จสิ้น' && userEmail) {
      await sendClosingEmail({ to: userEmail, name: userName || '', ticketId, subject: subject || ticketId });
    }

    return Response.json({ success: true, ticketId, newStatus });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}