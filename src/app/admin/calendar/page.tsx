"use client";

import { useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  EventPropGetter,
  View
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { supabase } from "../../../../lib/supabaseClient";
import { format, parse, startOfWeek, getDay, isBefore, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { showToast } from "../../../components/ui/ToastContainer";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { fr } });
const DragAndDropCalendar = withDragAndDrop<InterventionEvent>(BigCalendar);

type Technicien = { id: string; nom: string };
type InterventionEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  technicien_id: string;
  statut?: string;
  colorClass: string;
};

export default function AdminCalendar() {
  const [events, setEvents] = useState<InterventionEvent[]>([]);
  const [allEvents, setAllEvents] = useState<InterventionEvent[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<InterventionEvent | null>(null);

  async function fetchData() {
    const { data: clientsData } = await supabase.from("clients").select("id, nom");
    const clientsMap = new Map(clientsData?.map((c) => [c.id, c.nom]));

    const { data: techData } = await supabase
      .from("profiles")
      .select("id, nom")
      .eq("role", "technicien");
    setTechniciens(techData || []);
    const techMap = new Map(techData?.map((t) => [t.id, t.nom]));

    const { data: interData } = await supabase.from("interventions").select("*");
    const formatted: InterventionEvent[] = (interData || []).map((inter) => {
      const nomClient = clientsMap.get(inter.client_id) ?? "Client inconnu";
      const nomTech = techMap.get(inter.technicien_id) ?? "Technicien inconnu";
      const colorClass =
        inter.statut === "terminee"
          ? "bg-green-600"
          : inter.statut === "accepte"
          ? "bg-blue-600"
          : inter.statut === "en_attente"
          ? "bg-yellow-500"
          : "bg-red-600";

      return {
        id: inter.id,
        title: `${inter.motif}\n👷 ${nomTech} | 🏢 ${nomClient}`,
        start: new Date(`${inter.date_intervention}T${inter.heure_debut}`),
        end: new Date(`${inter.date_intervention}T${inter.heure_fin}`),
        technicien_id: inter.technicien_id,
        statut: inter.statut,
        colorClass,
      };
    });

    setAllEvents(formatted);
    setEvents(formatted);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTech) setEvents(allEvents);
    else setEvents(allEvents.filter((e) => e.technicien_id === selectedTech));
  }, [selectedTech, allEvents]);

  const eventStyleGetter: EventPropGetter<InterventionEvent> = (event) => ({
    className: `${event.colorClass} text-white`,
    style: {
      borderRadius: "6px",
      padding: "4px 6px",
      fontSize: "0.85rem",
      fontWeight: 500,
      border: "none",
    },
  });

  const handleEventDrop = async ({ event, start, end }: any) => {
    const id = event.id;
    const newDate = format(start, "yyyy-MM-dd");
    const newStart = format(start, "HH:mm");
    const newEnd = format(end, "HH:mm");

    if (event.statut === "terminee") return;

    const hasConflict = allEvents.some((e) =>
      e.id !== id &&
      e.technicien_id === event.technicien_id &&
      format(e.start, "yyyy-MM-dd") === newDate &&
      ((isBefore(start, e.end) && isAfter(end, e.start)) ||
        (isBefore(end, e.end) && isAfter(end, e.start)))
    );

    if (hasConflict) {
      showToast("❌ Conflit détecté : ce technicien est déjà occupé à cette heure.", "error");
      return;
    }

    const { error } = await supabase
      .from("interventions")
      .update({ date_intervention: newDate, heure_debut: newStart, heure_fin: newEnd })
      .eq("id", id);

    if (!error) {
      fetchData();
      showToast(
        `✅ Intervention déplacée au ${format(start, "dd/MM/yyyy HH:mm")} → ${format(
          end,
          "HH:mm"
        )}`,
        "success"
      );
    } else {
      console.error("Erreur update intervention:", error);
      showToast("Erreur lors du déplacement de l'intervention.", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">📅 Calendrier des interventions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4 items-center">
            <label className="font-medium">Filtrer par technicien :</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">Tous les techniciens</option>
              {techniciens.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.nom}
                </option>
              ))}
            </select>
          </div>

          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            startAccessor={(event) => event.start}
            endAccessor={(event) => event.end}
            defaultView={"week" as View}
            views={['week', 'day', 'agenda'] as View[]}
            defaultDate={new Date()}
            style={{ height: 700 }}
            messages={{
              week: "Semaine",
              day: "Jour",
              month: "Mois",
              today: "Aujourd'hui",
              previous: "←",
              next: "→",
            }}
            formats={{
              timeGutterFormat: (date) => format(date, "HH:mm"),
              eventTimeRangeFormat: ({ start, end }) =>
                `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
            }}
            eventPropGetter={eventStyleGetter}
            onEventDrop={handleEventDrop}
            onSelectEvent={(event) => setSelectedEvent(event)}
            draggableAccessor={() => true}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'intervention</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm">
              <p><strong>Date :</strong> {format(selectedEvent.start, "dd/MM/yyyy")}</p>
              <p><strong>Heure :</strong> {format(selectedEvent.start, "HH:mm")} → {format(selectedEvent.end, "HH:mm")}</p>
              <p><strong>Technicien :</strong> {techniciens.find(t => t.id === selectedEvent.technicien_id)?.nom || "-"}</p>
              <p><strong>Motif :</strong> {selectedEvent.title.split("\n")[0]}</p>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="destructive">Supprimer</Button>
                <Button variant="default">Modifier</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}