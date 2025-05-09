"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";
import {
  saveInterventionToCache,
  type InterventionTempData,
} from "@/lib/interventionCache";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import HeaderIntervention from "@/components/HeaderIntervention";

export default function InterventionStart() {
  const { id } = useParams();
  const router = useRouter();

  const [intervention, setIntervention] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIntervention() {
      const { data, error } = await supabase
        .from("interventions")
        .select("*, clients:client_id(nom, adresse, telephone)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Erreur intervention :", error);
        setError("Impossible de charger les données de l'intervention.");
      } else if (data) {
        setIntervention(data);

        const cache: InterventionTempData = {
          clientId: data.client_id,
          technicienId: "",
          motif: data.motif,
          date_intervention: data.date_intervention,
          heure_debut: data.heure_debut,
          heure_fin: data.heure_fin,
          produits: [],
          signatureBase64: "",
          clientNom: data.clients.nom,
          clientAdresse: data.clients.adresse,
          clientTelephone: data.clients.telephone,
        };

        saveInterventionToCache(id as string, cache);
      }
      setLoading(false);
    }

    if (id) fetchIntervention();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );

  if (error)
    return <div className="p-6 text-red-600 font-medium">❌ {error}</div>;

  return (
    <>
      <HeaderIntervention />
      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Info className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Démarrer l’intervention</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informations client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><strong>👤 Nom :</strong> {intervention.clients.nom}</p>
            <p><strong>📍 Adresse :</strong> {intervention.clients.adresse}</p>
            <p><strong>📞 Téléphone :</strong> {intervention.clients.telephone}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Détails de l’intervention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><strong>📝 Motif :</strong> {intervention.motif}</p>
            <p><strong>📅 Date :</strong> {intervention.date_intervention}</p>
            <p><strong>⏰ Horaire :</strong> {intervention.heure_debut} - {intervention.heure_fin}</p>
          </CardContent>
        </Card>

        <Button
          onClick={() => router.push(`/technicien/intervention/${intervention.id}/produit`)}
          className="w-full text-base font-medium"
        >
          ✅ Commencer l’intervention
        </Button>
      </main>
    </>
  );
}
