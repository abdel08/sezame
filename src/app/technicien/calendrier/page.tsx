"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import LayoutDashboardSidebar from "@/components/LayoutDashboardSidebar";
import { supabase } from "../../../../lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InterventionRow {
  id: string;
  date_intervention: string;
  heure_debut: string;
  heure_fin: string;
  motif: string;
  validation_technicien: string;
  client_nom: string | null;
}

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
      const { data, error } = await supabase
        .from("calendrier_interventions")
        .select("*");

      if (error || !data) {
        console.error("Erreur récupération interventions :", error);
        return;
      }

      const formatted = data.map((intervention: InterventionRow): InterventionEvent => {
        const start = `${intervention.date_intervention}T${intervention.heure_debut}`;
        const end = `${intervention.date_intervention}T${intervention.heure_fin}`;
        const statut = intervention.validation_technicien;

        const bgColor =
          statut === "accepte" ? "#22c55e"
          : statut === "refuse" ? "#ef4444"
          : "#facc15";

        return {
          id: intervention.id,
          title: `${intervention.heure_debut} - ${intervention.client_nom ?? "Client inconnu"}`,
          start,
          end,
          allDay: false,
          backgroundColor: bgColor,
          extendedProps: {
            client: intervention.client_nom ?? "Client inconnu",
            motif: intervention.motif,
          },
        };
      });

      setEvents(formatted);
    };

    fetchEvents();
  }, []);

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      extendedProps: event.extendedProps as {
        client: string;
        motif: string;
      },
    });
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <LayoutDashboardSidebar>
      <div className="p-4 sm:p-6 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold">📅 Calendrier des interventions</h1>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          titleFormat={{ year: "numeric", month: "short", day: "numeric" }}
          locale="fr"
          height="auto"
          contentHeight="auto"
          dayMaxEventRows={true}
          events={events}
          eventClick={handleEventClick}
          dayHeaderContent={(args) => (
            <span className="text-xs sm:text-sm font-medium">{args.text}</span>
          )}
          dayCellClassNames="px-1 sm:px-2 py-1"
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
