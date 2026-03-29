export async function POST(request) {
  try {
    const { ticketId, email, score, comment } = await request.json();

    if (!ticketId || !score) {
      return Response.json(
        { success: false, error: 'ข้อมูลไม่ครบ' },
        { status: 400 }
      );
    }

    const res    = await fetch(process.env.APPS_SCRIPT_URL, {
      method  : 'POST',
      headers : { 'Content-Type': 'text/plain;charset=utf-8' },
      body    : JSON.stringify({
        action  : 'saveCSAT',
        ticketId,
        email   : email   || '',
        score,
        comment : comment || '',
      }),
      redirect: 'follow',
    });

    const text = await res.text();
    let result;
    try { result = JSON.parse(text); }
    catch { result = { success: true }; }

    return Response.json({ success: true });

  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}