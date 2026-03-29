export async function GET() {
  try {
    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      redirect: 'follow',
      headers : { 'Content-Type': 'text/plain' },
    });
    const text = await response.text();
    const data = JSON.parse(text);
    if (!data.success) throw new Error(data.error);
    return Response.json({ success: true, tickets: data.tickets });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}