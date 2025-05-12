import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { base64Data, path } = await req.json();

    if (!base64Data || !path) {
      return NextResponse.json(
        { error: 'Champs manquants : base64Data et path sont requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // sécurisé
    );

    const buffer = Buffer.from(base64Data, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Erreur upload Supabase', details: uploadError.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: 'Erreur serveur', message }, { status: 500 });
  }
}
