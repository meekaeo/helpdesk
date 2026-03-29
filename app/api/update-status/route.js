// app/api/update-status/route.js

export async function POST(request) {
  try {
    const { ticketId, newStatus, note } = await request.json();

    if (!ticketId || !newStatus) {
      return Response.json(
        { success: false, error: 'ข้อมูลไม่ครบ' },
        { status: 400 }
      );
    }

    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        action   : 'updateStatus',
        ticketId,
        newStatus,
        note     : note || '',
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    return Response.json({ success: true, ticketId, newStatus });

  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}