import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { fileName, fileContentBase64, path } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ pas le anon key ici
  );

  const buffer = Buffer.from(fileContentBase64, 'base64');

  const { error } = await supabase.storage
    .from('photos')
    .upload(`${path}/${fileName}`, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    return new NextResponse(JSON.stringify({ error }), { status: 400 });
  }

  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(`${path}/${fileName}`);

  return new NextResponse(JSON.stringify({ url: data.publicUrl }), { status: 200 });
}
