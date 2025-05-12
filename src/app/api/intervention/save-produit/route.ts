import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ProduitSelection {
  id: string;
  statut: 'fonctionnel' | 'a_remplacer';
  remarque?: string;
  photos?: { name: string; url: string; path: string }[];
}

export async function POST(req: NextRequest) {
  const { interventionId, produits } = await req.json() as {
    interventionId: string;
    produits: ProduitSelection[];
  };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Supprimer les anciens produits liés à l'intervention
  await supabase
    .from('intervention_produits')
    .delete()
    .eq('intervention_id', interventionId);

  // Créer les nouvelles lignes à insérer
  const lignes = produits.map((p) => ({
    intervention_id: interventionId,
    produit_id: p.id,
    a_remplacer: p.statut === 'a_remplacer',
    remarque: p.remarque || '',
    photos: p.photos || [],
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
