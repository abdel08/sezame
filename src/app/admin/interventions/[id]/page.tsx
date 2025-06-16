"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function FicheInterventionAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const [intervention, setIntervention] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from("accueil_interventions")
        .select("*, clients(*), profiles(*)")
        .eq("id", id)
        .single();
      if (!error) setIntervention(data);
      setLoading(false);
    }
    if (id) fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Confirmer la suppression de cette intervention ?")) return;
    setDeleting(true);
    const { error } = await supabase.from("interventions").delete().eq("id", id);
    if (!error) router.push("/admin/interventions");
  };

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!intervention) return <div className="p-6 text-center text-muted-foreground">Intervention introuvable.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Détail de l’intervention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><strong>Date :</strong> {format(new Date(intervention.date_intervention), "dd/MM/yyyy")}</p>
          <p><strong>Heure :</strong> {intervention.heure_debut} → {intervention.heure_fin}</p>
          <p><strong>Client :</strong> {intervention.client_nom ?? "Inconnu"}</p>
          <p><strong>Technicien :</strong> {intervention.technicien_nom ?? "Non affecté"}</p>
          <p><strong>Motif :</strong> {intervention.motif}</p>
          <Badge variant="outline">{intervention.statut}</Badge>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => router.push(`/admin/interventions/edit/${id}`)}>
          <Pencil className="w-4 h-4 mr-2" /> Modifier
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
        </Button>
      </div>
    </div>
  );
}
