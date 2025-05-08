import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { interventionId, signatureUrl } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('interventions')
    .update({ signature_url: signatureUrl })
    .eq('id', interventionId);

  if (error) {
    console.error('❌ Erreur sauvegarde signature URL :', error);
    return new NextResponse(JSON.stringify({ error }), { status: 500 });
  }

  return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
}
