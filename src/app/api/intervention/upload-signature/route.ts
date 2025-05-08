import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { base64Data, path } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // pas le anon key ici
  );

  const buffer = Buffer.from(base64Data, 'base64');

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error('❌ Erreur upload signature (storage) :', error);
    return new NextResponse(JSON.stringify({ error }), { status: 400 });
  }

  const { data } = supabase.storage.from('photos').getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
