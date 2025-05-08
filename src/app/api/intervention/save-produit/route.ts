import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { interventionId, produits } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Supprimer les produits existants (cas mise à jour)
  await supabase
    .from('intervention_produits')
    .delete()
    .eq('intervention_id', interventionId);

  // Insérer les nouveaux
  const insertData = produits.map((p: any) => ({
    intervention_id: interventionId,
    produit_id: p.id,
    a_remplacer: p.statut === 'a_remplacer',
    remarque: p.remarque || '',
  }));

  const { error } = await supabase
    .from('intervention_produits')
    .insert(insertData);

  if (error) {
    console.error('❌ Erreur enregistrement produits intervention :', error);
    return new NextResponse(JSON.stringify({ error }), { status: 500 });
  }

  return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
}
