"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../../lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addMinutes, setHours, setMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showToast } from "../../../../../components/ui/ToastContainer";

export default function EditInterventionAdmin() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [techniciens, setTechniciens] = useState<any[]>([]);
  const [techniciensOccupes, setTechniciensOccupes] = useState<string[]>([]);
  const [conflit, setConflit] = useState(false);
  const [dispo, setDispo] = useState<{ h: string }[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("interventions").select("*").eq("id", id).single();
      const { data: clientData } = await supabase.from("clients").select("id, nom");
      const { data: techData } = await supabase.from("profiles").select("id, nom").eq("role", "technicien");
      if (data) setForm({ ...data, date_intervention: new Date(data.date_intervention) });
      if (clientData) setClients(clientData);
      if (techData) setTechniciens(techData);
    }
    if (id) fetch();
  }, [id]);

  useEffect(() => {
    async function checkDispo() {
      if (!form?.date_intervention || !form?.technicien_id) return;

      const { data } = await supabase
        .from("interventions")
        .select("heure_debut, heure_fin, technicien_id")
        .eq("date_intervention", format(form.date_intervention, "yyyy-MM-dd"))
        .neq("id", id);

      const interventionsJour = data?.filter(i => i.technicien_id === form.technicien_id) || [];
      const occupes = new Set<string>();

      interventionsJour.forEach(i => {
        if (form.heure_debut && form.heure_fin && form.heure_debut < i.heure_fin && form.heure_fin > i.heure_debut) {
          occupes.add(i.technicien_id);
        }
      });

      setTechniciensOccupes(Array.from(occupes));
      setConflit(occupes.has(form.technicien_id));

      const horaires = Array.from({ length: 20 }, (_, i) => `${(8 + Math.floor(i / 2)).toString().padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`);
      const dispoLibre = horaires.filter(h => {
        const [heures, minutes] = h.split(":");
        const hFin = format(addMinutes(setHours(setMinutes(new Date(), Number(minutes)), Number(heures)), 30), "HH:mm");
        return !interventionsJour.some(i => h < i.heure_fin && hFin > i.heure_debut);
      }).map(h => ({ h }));

      setDispo(dispoLibre);
    }
    checkDispo();
  }, [form?.date_intervention, form?.heure_debut, form?.heure_fin, form?.technicien_id]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSuggest = () => {
    if (!dispo.length) return;
    const h = dispo[0].h;
    const [heures, minutes] = h.split(":");
    const hFin = format(addMinutes(setHours(setMinutes(new Date(), Number(minutes)), Number(heures)), 30), "HH:mm");
    handleChange("heure_debut", h);
    handleChange("heure_fin", hFin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || conflit) return;

    const { error } = await supabase
      .from("interventions")
      .update({
        ...form,
        date_intervention: format(form.date_intervention, "yyyy-MM-dd"),
      })
      .eq("id", id);

    if (!error) {
      showToast("✅ Intervention modifiée avec succès", "success");
      router.push("/admin/dashboard");
    } else {
      showToast("❌ Erreur lors de la modification", "error");
    }
  };

  if (!form) return <div className="p-6">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Modifier l’intervention</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => handleChange("client_id", v)}>
                <SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Technicien</Label>
              <Select value={form.technicien_id} onValueChange={(v) => handleChange("technicien_id", v)}>
                <SelectTrigger><SelectValue placeholder="Technicien" /></SelectTrigger>
                <SelectContent>
                  {techniciens.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {techniciensOccupes.includes(t.id) ? "🔴" : "🟢"} {t.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Motif</Label>
              <Input value={form.motif} onChange={(e) => handleChange("motif", e.target.value)} required />
            </div>

            <div>
              <Label>Date</Label>
              <Calendar mode="single" selected={form.date_intervention} onSelect={(d) => d && handleChange("date_intervention", d)} className="rounded border" />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label>Heure début</Label>
                <Input type="time" value={form.heure_debut} onChange={(e) => handleChange("heure_debut", e.target.value)} required />
              </div>
              <div>
                <Label>Heure fin</Label>
                <Input type="time" value={form.heure_fin} onChange={(e) => handleChange("heure_fin", e.target.value)} required />
              </div>
            </div>

            <Button type="button" variant="outline" onClick={handleSuggest} disabled={!dispo.length}>
              🔍 Suggérer un créneau libre
            </Button>

            {conflit && <p className="text-sm text-red-600">⚠️ Ce technicien est déjà occupé à ce créneau</p>}

            <Button type="submit" className="w-full" disabled={conflit}>Enregistrer</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}