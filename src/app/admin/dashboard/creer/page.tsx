// CreerInterventionPro.tsx (modifié avec urgence)

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { format, addMinutes, setHours, setMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/ToastContainer";

export default function CreerInterventionPro() {
  const [clients, setClients] = useState<any[]>([]);
  const [techniciens, setTechniciens] = useState<any[]>([]);
  const [techniciensOccupes, setTechniciensOccupes] = useState<Set<string>>(new Set());
  const [plages, setPlages] = useState<Record<string, { start: string; end: string }[]>>({});
  const [date, setDate] = useState<Date | undefined>();
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [clientId, setClientId] = useState("");
  const [technicienId, setTechnicienId] = useState("");
  const [motif, setMotif] = useState("");
  const [priorite, setPriorite] = useState("normale");
  const [conflit, setConflit] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: clients } = await supabase.from("clients").select("id, nom");
      const { data: techs } = await supabase.from("profiles").select("id, nom").eq("role", "technicien");
      if (clients) setClients(clients);
      if (techs) setTechniciens(techs);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function checkPlages() {
      if (!date) return;
      const { data } = await supabase
        .from("interventions")
        .select("technicien_id, heure_debut, heure_fin")
        .eq("date_intervention", format(date, "yyyy-MM-dd"));

      const overlapSet = new Set<string>();
      const map: Record<string, { start: string; end: string }[]> = {};
      data?.forEach((i) => {
        if (!map[i.technicien_id]) map[i.technicien_id] = [];
        map[i.technicien_id].push({ start: i.heure_debut, end: i.heure_fin });
      });
      setPlages(map);

      if (technicienId) {
        const conflits = map[technicienId]?.some(i => heureDebut < i.end && heureFin > i.start);
        if (conflits) overlapSet.add(technicienId);
        setConflit(overlapSet.has(technicienId));
      }
      setTechniciensOccupes(overlapSet);
    }
    checkPlages();
  }, [date, heureDebut, heureFin, technicienId]);

  function getGrille(techId: string) {
    const start = setHours(setMinutes(new Date(), 0), 8);
    const slots = Array.from({ length: 20 }, (_, i) => format(addMinutes(start, i * 30), "HH:mm"));
    const plagesTech = plages[techId] || [];
    return slots.map((h) => {
      const [hH, hM] = h.split(":" as const).map(Number);
      const hFin = format(addMinutes(setHours(setMinutes(new Date(), hM), hH), 30), "HH:mm");
      const occupe = plagesTech.some((p) => h < p.end && hFin > p.start);
      return { h, occupe };
    });
  }

  function handleSuggestion() {
    const dispo = getGrille(technicienId).filter(s => !s.occupe);
    if (dispo.length > 0) {
      const [h, m] = dispo[0].h.split(":" as const).map(Number);
      setHeureDebut(dispo[0].h);
      setHeureFin(format(addMinutes(setHours(setMinutes(new Date(), m), h), 30), "HH:mm"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || conflit) return;

    const { error } = await supabase.from("interventions").insert({
      client_id: clientId,
      technicien_id: technicienId,
      date_intervention: format(date, "yyyy-MM-dd"),
      heure_debut: heureDebut,
      heure_fin: heureFin,
      motif,
      priorite,
      validation_technicien: "en_attente",
    });

    if (!error) {
      showToast("✅ Intervention créée avec succès", "success");
      setClientId("");
      setTechnicienId("");
      setDate(undefined);
      setHeureDebut("");
      setHeureFin("");
      setMotif("");
      setPriorite("normale");
      setTechniciensOccupes(new Set());
    } else {
      showToast("Erreur lors de la création", "error");
    }
  }

  const clientNom = clients.find(c => c.id === clientId)?.nom || "";
  const technicienNom = techniciens.find(t => t.id === technicienId)?.nom || "";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Technicien</Label>
            <Select value={technicienId} onValueChange={setTechnicienId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un technicien" />
              </SelectTrigger>
              <SelectContent>
                {techniciens.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {plages[t.id]?.some((p) => heureDebut < p.end && heureFin > p.start) ? "🔴" : "🟢"} {t.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date</Label>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Heure début</Label>
              <Input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} required />
            </div>
            <div className="flex-1">
              <Label>Heure fin</Label>
              <Input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} required />
            </div>
            <Button type="button" variant="outline" onClick={handleSuggestion}>Suggérer un créneau</Button>
          </div>

          <div>
            <Label>Motif</Label>
            <Input value={motif} onChange={(e) => setMotif(e.target.value)} required />
          </div>

          <div>
            <Label>Niveau d'urgence</Label>
            <Select value={priorite} onValueChange={setPriorite} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basse">🟢 Basse</SelectItem>
                <SelectItem value="normale">🔵 Normale</SelectItem>
                <SelectItem value="haute">🟠 Haute</SelectItem>
                <SelectItem value="critique">🔴 Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {conflit && <p className="text-sm text-red-600">⚠️ Ce technicien est déjà occupé sur ce créneau</p>}

          <Button type="submit" disabled={conflit}>Créer l'intervention</Button>
        </div>

        <div className="bg-muted p-4 rounded-xl border h-fit space-y-3">
          <h3 className="text-lg font-bold">📋 Résumé en temps réel</h3>
          <p><strong>Client :</strong> {clientNom || <em>non sélectionné</em>}</p>
          <p><strong>Technicien :</strong> {technicienNom || <em>non sélectionné</em>}</p>
          <p><strong>Date :</strong> {date ? format(date, "dd/MM/yyyy") : <em>non définie</em>}</p>
          <p><strong>Heure :</strong> {heureDebut && heureFin ? `${heureDebut} → ${heureFin}` : <em>non définie</em>}</p>
          <p><strong>Motif :</strong> {motif || <em>non renseigné</em>}</p>
          <p><strong>Urgence :</strong> {priorite}</p>

          {date && (
            <div className="mt-4 space-y-1">
              <h4 className="font-semibold text-sm mb-1">📆 Disponibilités (08h-18h)</h4>
              {techniciens.map(t => (
                <div key={t.id} className="text-sm">
                  <div className="font-medium">👷 {t.nom}</div>
                  <div className="grid grid-cols-5 gap-1 text-center text-xs">
                    {getGrille(t.id).map(slot => (
                      <div key={slot.h} className={`rounded px-1 py-0.5 ${slot.occupe ? "bg-red-500 text-white" : "bg-green-100 text-green-900"}`}>{slot.h}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
