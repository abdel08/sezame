"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";
import LayoutDashboardSidebar from "@/components/LayoutDashboardSidebar";
import { supabase } from "../../../../lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InterventionEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  extendedProps: {
    client: string;
    motif: string;
  };
}

export default function CalendrierTechnicien() {
  const [events, setEvents] = useState<InterventionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<InterventionEvent | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("interventions")
        .select("id, date_intervention, heure_debut, heure_fin, motif, validation_technicien, clients (nom)")
        .eq("technicien_id", user.id);

      if (error || !data) return;

      const formatted = data.map((intervention: any) => {
        const start = `${intervention.date_intervention}T${intervention.heure_debut}`;
        const end = `${intervention.date_intervention}T${intervention.heure_fin}`;

        const statut = intervention.validation_technicien;
        const bgColor =
          statut === "accepte" ? "#22c55e" : statut === "refuse" ? "#ef4444" : "#facc15";

        return {
          id: intervention.id,
          title: `${intervention.heure_debut} - ${intervention.clients?.nom || "Client inconnu"}`,
          start,
          end,
          allDay: false,
          backgroundColor: bgColor,
          extendedProps: {
            client: intervention.clients?.nom || "Client inconnu",
            motif: intervention.motif,
          },
        };
      });

      setEvents(formatted);
    };

    fetchEvents();
  }, []);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  return (
    <LayoutDashboardSidebar>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">📅 Calendrier des interventions</h1>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="fr"
          height="auto"
          events={events}
          eventClick={handleEventClick}
        />

        {selectedEvent && (
          <Dialog open={true} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails de l’intervention</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p><strong>Client :</strong> {selectedEvent.extendedProps.client}</p>
                <p><strong>Motif :</strong> {selectedEvent.extendedProps.motif}</p>
                <p><strong>Début :</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
                <p><strong>Fin :</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
                <Button
                  onClick={() => router.push(`/technicien/intervention/${selectedEvent.id}`)}
                  className="w-full"
                >
                  Voir la fiche intervention →
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </LayoutDashboardSidebar>
  );
}
