export async function POST(req: Request) {
    const body = await req.json();
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  }
  