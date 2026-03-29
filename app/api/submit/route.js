export async function POST(request) {
  try {
    const body = await request.json();
    const url  = process.env.APPS_SCRIPT_URL;

    // ส่งแบบ follow redirect อัตโนมัติ
    const res  = await fetch(url, {
      method  : 'POST',
      headers : { 'Content-Type': 'text/plain;charset=utf-8' },
      body    : JSON.stringify(body),
      redirect: 'follow',
    });

    const text = await res.text();

    // ถ้าได้ HTML กลับมา แสดงว่า redirect ไม่สำเร็จ — ลอง GET แทน
    if (text.startsWith('<')) {
      const res2  = await fetch(url, { redirect: 'follow' });
      const text2 = await res2.text();
      const data2 = JSON.parse(text2);

      // ส่งข้อมูลไปอีกครั้งด้วย URL ที่ redirect แล้ว
      const finalUrl = res2.url;
      const res3 = await fetch(finalUrl, {
        method : 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body   : JSON.stringify(body),
      });
      const text3   = await res3.text();
      const result3 = JSON.parse(text3);
      return Response.json(result3);
    }

    const result = JSON.parse(text);
    return Response.json(result);

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}