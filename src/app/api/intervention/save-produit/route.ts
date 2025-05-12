import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { interventionId, produits } = await req.json() as { interventionId: string; produits: any[] };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Supprimer les anciens produits de l'intervention
  await supabase
    .from('intervention_produits')
    .delete()
    .eq('intervention_id', interventionId);

  // Préparer les nouvelles lignes
  const lignes = produits.map((p: any) => ({
    intervention_id: interventionId,
    produit_id: p.id,
    a_remplacer: p.statut === 'a_remplacer',
    remarque: p.remarque || '',
    photos: p.photos || [], // <= on enregistre les URLs de photos
  }));

  const { error } = await supabase
    .from('intervention_produits')
    .insert(lignes);

  if (error) {
    console.error('❌ Erreur enregistrement produits intervention :', error);
    return new NextResponse(JSON.stringify({ error }), { status: 500 });
  }

  return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
}
