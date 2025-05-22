"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import LayoutAdmin from "@/components/LayoutAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Search } from "lucide-react";

interface Intervention {
  id: string;
  date_intervention: string;
  heure_debut: string;
  heure_fin: string;
  motif: string;
  statut: string;
  validation_technicien: string;
  client_nom: string | null;
  technicien_nom: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-200 text-yellow-800" },
  accepte: { label: "Acceptée", color: "bg-green-200 text-green-800" },
  refuse: { label: "Refusée", color: "bg-red-200 text-red-800" },
  terminee: { label: "Terminée", color: "bg-blue-200 text-blue-800" },
};

export default function ListeInterventionsAdmin() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [dateMin, setDateMin] = useState("");
  const [dateMax, setDateMax] = useState("");
  const [selectedTechnicien, setSelectedTechnicien] = useState("");

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const { data, error } = await supabase.from("accueil_interventions").select("*");
        if (error || !data) {
          console.error("Erreur chargement interventions:", error);
          return;
        }
        setInterventions(data);
      } catch (err) {
        console.error("Erreur inconnue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  const filtered = interventions.filter((item) => {
    const matchSearch =
      search.trim() === "" ||
      item.client_nom?.toLowerCase().includes(search.toLowerCase()) ||
      item.motif.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "toutes" ||
      item.validation_technicien === filter ||
      item.statut === filter;

    const matchDate =
      (!dateMin || item.date_intervention >= dateMin) &&
      (!dateMax || item.date_intervention <= dateMax);

    const matchTechnicien =
      selectedTechnicien === "" || (item.technicien_nom ?? "Inconnu") === selectedTechnicien;

    return matchSearch && matchFilter && matchDate && matchTechnicien;
  });

  return (
    <LayoutAdmin>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">📋 Interventions</h1>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> Créer une intervention
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between mt-4">
          <div className="flex gap-2 flex-wrap">
            {["toutes", "en_attente", "accepte", "refuse", "terminee"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
              >
                {STATUS_LABELS[status]?.label || "Toutes"}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Input
              type="date"
              value={dateMin}
              onChange={(e) => setDateMin(e.target.value)}
              className="sm:w-auto"
            />
            <Input
              type="date"
              value={dateMax}
              onChange={(e) => setDateMax(e.target.value)}
              className="sm:w-auto"
            />
            <select
              value={selectedTechnicien}
              onChange={(e) => setSelectedTechnicien(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full sm:w-48"
            >
              <option value="">Tous les techniciens</option>
              {[...new Set(interventions.map((i) => i.technicien_nom ?? "Inconnu"))].map((tech) => (
                <option key={tech ?? ""} value={tech ?? ""}>
                  {tech ?? "Inconnu"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm col-span-full">
                Aucune intervention trouvée.
              </p>
            ) : (
              filtered.map((intervention) => (
                <Card key={intervention.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {intervention.client_nom || "Client inconnu"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>
                      <strong>Date :</strong> {intervention.date_intervention}
                    </p>
                    <p>
                      <strong>Heure :</strong> {intervention.heure_debut} ➔ {intervention.heure_fin}
                    </p>
                    <p>
                      <strong>Motif :</strong> {intervention.motif}
                    </p>
                    <p>
                      <strong>Technicien :</strong> {intervention.technicien_nom || "-"}
                    </p>
                    <Badge
                      className={
                        STATUS_LABELS[intervention.validation_technicien || "en_attente"]?.color
                      }
                    >
                      {
                        STATUS_LABELS[intervention.validation_technicien || "en_attente"]?.label
                      }
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
}
