"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Client {
  id: string;
  nom: string;
  adresse: string;
}

interface Technicien {
  id: string;
  nom: string;
  disponible?: boolean;
}

export default function CreerIntervention() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [form, setForm] = useState({
    client_id: "",
    motif: "",
    technicien_id: "",
    date_intervention: new Date(),
    heure_debut: "",
    heure_fin: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: clientsData } = await supabase.from("clients").select("*");
      if (clientsData) setClients(clientsData);

      const { data: techData } = await supabase
        .from("profiles")
        .select("id, nom")
        .eq("role", "technicien");
      if (techData) setTechniciens(techData);
    }
    fetchData();
  }, []);

  async function verifierDisponibilite(date: Date, heureDebut: string, heureFin: string) {
    if (!date || !heureDebut || !heureFin) return;
    const dateStr = date.toISOString().split("T")[0];

    const { data: interventions } = await supabase
      .from("interventions")
      .select("technicien_id, heure_debut, heure_fin")
      .eq("date_intervention", dateStr);

    const techsDisponibles = techniciens.map((tech) => {
      const conflit = interventions?.some(
        (inter) =>
          inter.technicien_id === tech.id &&
          heureDebut < inter.heure_fin &&
          heureFin > inter.heure_debut
      );
      return { ...tech, disponible: !conflit };
    });

    setTechniciens(techsDisponibles);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("interventions").insert([
      {
        ...form,
        date_intervention: form.date_intervention.toISOString().split("T")[0],
        validation_technicien: "en_attente",
      },
    ]);
    if (!error) router.push("/admin/interventions");
    else alert("Erreur création intervention : " + error.message);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer une intervention</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Client</Label>
              <select
                className="border p-2 w-full rounded"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} – {client.adresse}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Motif</Label>
              <Input
                placeholder="Motif de l'intervention"
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.date_intervention && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.date_intervention, "yyyy-MM-dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.date_intervention}
                      onSelect={(date) => {
                        if (date) {
                          setForm({ ...form, date_intervention: date });
                          verifierDisponibilite(date, form.heure_debut, form.heure_fin);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Heure début</Label>
                  <Input
                    type="time"
                    value={form.heure_debut}
                    onChange={(e) => {
                      setForm({ ...form, heure_debut: e.target.value });
                      verifierDisponibilite(form.date_intervention, e.target.value, form.heure_fin);
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>Heure fin</Label>
                  <Input
                    type="time"
                    value={form.heure_fin}
                    onChange={(e) => {
                      setForm({ ...form, heure_fin: e.target.value });
                      verifierDisponibilite(form.date_intervention, form.heure_debut, e.target.value);
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Technicien</Label>
              <select
                className="border p-2 w-full rounded"
                value={form.technicien_id}
                onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
                required
              >
                <option value="">Sélectionner un technicien</option>
                {techniciens.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.disponible === false ? "🔴" : "🟢"} {tech.nom}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full">
              Planifier l'intervention
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}