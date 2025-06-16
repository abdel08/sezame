// dashboard_admin_fusion.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import LayoutAdmin from "@/components/LayoutAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ClipboardList,
  TrendingUp,
  CalendarCheck2,
  ChevronRight,
  Loader2,
  PlusCircle,
  CalendarIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, subDays, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardAdminFusion() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      const [interventionsRes, profilesRes, clientsRes, prochainesRes] = await Promise.all([
        supabase.from("interventions").select("*"),
        supabase.from("profiles").select("id, nom").eq("role", "technicien"),
        supabase.from("clients").select("id, nom"),
        supabase
          .from("interventions")
          .select(`
            id,
            date_intervention,
            motif,
            statut,
            clients ( nom ),
            profiles ( nom )
          `)
          .order("date_intervention", { ascending: true }),
      ]);

      const interventions = interventionsRes.data || [];
      const techniciens = profilesRes.data || [];
      const clients = clientsRes.data || [];
      const rawProchaines = prochainesRes.data || [];

      const prochaines = rawProchaines.map((i: any) => ({
        id: i.id,
        date_intervention: i.date_intervention,
        motif: i.motif,
        statut: i.statut,
        client_nom: i.clients?.nom || "Inconnu",
        technicien_nom: i.profiles?.nom || "Non assigné",
      }));

      const total = interventions.length;
      const accepte = interventions.filter(i => i.statut === "accepte").length;
      const terminee = interventions.filter(i => i.statut === "terminee").length;

      const parJour: Record<string, number> = {};
      const repartition: Record<string, number> = {};
      const topTech: Record<string, number> = {};

      interventions.forEach(i => {
        if (i.date_intervention) {
          parJour[i.date_intervention] = (parJour[i.date_intervention] || 0) + 1;
        }
        if (i.statut) {
          repartition[i.statut] = (repartition[i.statut] || 0) + 1;
        }
        if (i.technicien_id) {
          topTech[i.technicien_id] = (topTech[i.technicien_id] || 0) + 1;
        }
      });

      const bestTechEntries = Object.entries(topTech) as [string, number][];
      const bestTechId = bestTechEntries.sort((a, b) => b[1] - a[1])[0]?.[0];
      const bestTech = techniciens.find(t => t.id === bestTechId)?.nom;

      const chartLabels = Object.keys(parJour).sort();
      const chartSeries = [{ name: "Interventions", data: chartLabels.map(d => parJour[d] || 0) }];
      const chartDonutSeries = Object.values(repartition).map(v => Number(v));

      setStats({
        total,
        totalClients: clients.length,
        totalTechniciens: techniciens.length,
        accepte,
        terminee,
        taux: total ? Math.round((accepte / total) * 100) : 0,
        bestTech,
        repartition,
        prochaines,
        techniciens,
        chartLabels,
        chartSeries,
        chartDonutSeries,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const chartDonut: ApexOptions = {
    chart: { type: "donut" },
    labels: stats ? Object.keys(stats.repartition) : [],
    legend: { position: "bottom" },
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    dataLabels: { enabled: true },
  };

  const filteredProchaines = stats?.prochaines.filter((i: any) => {
    const matchStatut = !statutFilter || i.statut === statutFilter;
    const matchTech = !techFilter || i.technicien_nom === techFilter;
    const matchClient = !clientFilter || i.client_nom === clientFilter;
    const matchDate = !dateFilter || isSameDay(new Date(i.date_intervention), dateFilter);
    return matchStatut && matchTech && matchClient && matchDate;
  });

  return (
    <LayoutAdmin>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">🎛️ Tableau de bord administrateur</h1>
          <Button onClick={() => router.push("/admin/interventions/new")} className="gap-2">
            <PlusCircle className="h-5 w-5" /> Nouvelle intervention
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[30vh]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card><CardHeader><CardTitle><ClipboardList className="inline w-4 h-4 mr-2" />Total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.total}</CardContent></Card>
              <Card><CardHeader><CardTitle><TrendingUp className="inline w-4 h-4 mr-2" />Taux Acceptation</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.taux}%</CardContent></Card>
              <Card><CardHeader><CardTitle><CalendarCheck2 className="inline w-4 h-4 mr-2" />Terminées</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.terminee}</CardContent></Card>
              <Card><CardHeader><CardTitle><Users className="inline w-4 h-4 mr-2" />Top Tech</CardTitle></CardHeader><CardContent className="text-xl font-medium">{stats.bestTech || "-"}</CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle>📈 Interventions / jour</CardTitle></CardHeader><CardContent><ApexChart type="line" height={300} options={{ chart: { id: "trend" }, xaxis: { categories: stats.chartLabels } }} series={stats.chartSeries} /></CardContent></Card>
              <Card><CardHeader><CardTitle>📊 Répartition par statut</CardTitle></CardHeader><CardContent><ApexChart type="donut" height={300} options={chartDonut} series={stats.chartDonutSeries} /></CardContent></Card>
            </div>

            {/* Section Prochaines interventions */}
            <Card className="mt-6">
              <CardHeader><CardTitle className="text-xl sm:text-2xl">📅 Prochaines interventions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row flex-wrap gap-3 items-start mb-6">
                  {/* Statut */}
                  <div className="flex flex-col gap-1 w-full sm:w-48">
                    <label className="text-sm font-medium">Statut</label>
                    <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className="text-sm h-9 border rounded px-3">
                      <option value="">Tous les statuts</option>
                      {Array.from(new Set(stats.prochaines.map((i: any) => i.statut))).filter(Boolean).map((statut) => (
                        <option key={String(statut)} value={String(statut)}>{String(statut)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Technicien */}
                  <div className="flex flex-col gap-1 w-full sm:w-48">
                    <label className="text-sm font-medium">Technicien</label>
                    <select value={techFilter} onChange={e => setTechFilter(e.target.value)} className="text-sm h-9 border rounded px-3">
                      <option value="">Tous les techniciens</option>
                      {Array.from(new Set(stats.prochaines.map((i: any) => i.technicien_nom))).filter(Boolean).map((tech) => (
                        <option key={String(tech)} value={String(tech)}>{String(tech)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Client */}
                  <div className="flex flex-col gap-1 w-full sm:w-48">
                    <label className="text-sm font-medium">Client</label>
                    <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="text-sm h-9 border rounded px-3">
                      <option value="">Tous les clients</option>
                      {Array.from(new Set(stats.prochaines.map((i: any) => i.client_nom))).filter(Boolean).map((client) => (
                        <option key={String(client)} value={String(client)}>{String(client)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Date */}
                  <div className="flex flex-col gap-1 w-full sm:w-48">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFilter}
                          onSelect={setDateFilter}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button variant="outline" className="mt-6" onClick={() => {
                    setStatutFilter("");
                    setTechFilter("");
                    setClientFilter("");
                    setDateFilter(undefined);
                  }}>
                    ↺ Réinitialiser
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {filteredProchaines.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      Aucune intervention ne correspond à vos filtres.
                    </div>
                  ) : (
                    filteredProchaines.map((intervention: any) => {
                      const isPast = new Date(intervention.date_intervention) < new Date();
                      return (
                        <div
                          key={intervention.id}
                          onClick={() => {
                            if (!isPast) router.push(`/admin/interventions/${intervention.id}`);
                          }}
                          className={`group border rounded-md px-4 py-3 transition cursor-pointer flex flex-col sm:flex-row justify-between gap-2 
                            ${isPast ? "bg-muted/50 opacity-60 cursor-not-allowed" : "hover:bg-muted/30"}
                          `}
                        >
                          <div className="text-sm space-y-1">
                            <p><strong>🗓 Date :</strong> {format(new Date(intervention.date_intervention), "dd/MM/yyyy HH:mm")}</p>
                            <p><strong>👤 Client :</strong> {intervention.client_nom}</p>
                            <p><strong>👷 Technicien :</strong> {intervention.technicien_nom}</p>
                            <p><strong>📋 Motif :</strong> {intervention.motif}</p>
                            <Badge variant="outline" className="text-xs">{intervention.statut}</Badge>
                          </div>
                          {!isPast && <ChevronRight className="text-muted-foreground self-center sm:self-auto group-hover:translate-x-1 transition" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutAdmin>
  );
}