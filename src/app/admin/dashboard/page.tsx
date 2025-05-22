"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import LayoutAdmin from "@/components/LayoutAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, ClipboardList, CalendarDays, TrendingUp, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AdminStats {
  totalInterventions: number;
  totalTechniciens: number;
  totalClients: number;
  repartition: Record<string, number>;
  prochaines: {
    id: string;
    date_intervention: string;
    client_nom: string | null;
    motif: string;
    statut: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [interventionsRes, techniciensRes, clientsRes, prochainesRes] = await Promise.all([
          supabase.from("interventions").select("id, statut"),
          supabase.from("profiles").select("id").eq("role", "technicien"),
          supabase.from("clients").select("id"),
          supabase
            .from("accueil_interventions")
            .select("id, date_intervention, client_nom, motif, statut")
            .gt("date_intervention", new Date().toISOString().split("T")[0])
            .order("date_intervention", { ascending: true })
            .limit(5),
        ]);

        const repartition: Record<string, number> = {};
        interventionsRes.data?.forEach(({ statut }) => {
          if (statut in repartition) repartition[statut]++;
          else repartition[statut] = 1;
        });

        setStats({
          totalInterventions: interventionsRes.data?.length ?? 0,
          totalTechniciens: techniciensRes.data?.length ?? 0,
          totalClients: clientsRes.data?.length ?? 0,
          repartition,
          prochaines: prochainesRes.data ?? [],
        });
      } catch (err) {
        console.error("Erreur chargement dashboard admin", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: stats ? Object.keys(stats.repartition) : [],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    legend: {
      position: "bottom", // ✅ Typage valide
    },
    dataLabels: {
      enabled: true,
    },
  };

  const chartSeries = stats ? Object.values(stats.repartition) : [];

  return (
    <LayoutAdmin>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">🎛️ Tableau de bord administrateur</h1>
          <Button onClick={() => router.push("/admin/interventions/new")} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Créer une intervention
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[30vh]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Interventions
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats.totalInterventions}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Techniciens
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats.totalTechniciens}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats.totalClients}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Répartition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ApexChart
                    type="donut"
                    options={chartOptions}
                    series={chartSeries}
                    height={230}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📅 Prochaines interventions
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y text-sm">
                {stats.prochaines.length === 0 ? (
                  <p className="text-muted-foreground">Aucune intervention planifiée à venir.</p>
                ) : (
                  stats.prochaines.map((intervention) => (
                    <div key={intervention.id} className="py-3 space-y-1">
                      <p><strong>Date :</strong> {intervention.date_intervention}</p>
                      <p><strong>Client :</strong> {intervention.client_nom ?? "Client inconnu"}</p>
                      <p><strong>Motif :</strong> {intervention.motif}</p>
                      <Badge variant="outline" className="text-xs">
                        ID : {intervention.id}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutAdmin>
  );
}
