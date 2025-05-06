'use client';

export const dynamic = 'force-dynamic';

import type { View } from 'react-big-calendar';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, EventPropGetter } from 'react-big-calendar';
import { supabase } from '../../../../lib/supabaseClient';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 👇 Types
type Technicien = {
  id: string;
  nom: string;
};

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
  const [selectedTech, setSelectedTech] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const { data: clientsData } = await supabase.from('clients').select('id, nom');
      const clientsMap = new Map(clientsData?.map((c) => [c.id, c.nom]));

      const { data: techData } = await supabase
        .from('profiles')
        .select('id, nom')
        .eq('role', 'technicien');
      setTechniciens(techData || []);
      const techMap = new Map(techData?.map((t) => [t.id, t.nom]));

      const { data: interData } = await supabase.from('interventions').select('*');
      const interventions = interData || [];

      const formatted: InterventionEvent[] = interventions
        .filter((i) => i.date_intervention && i.heure_debut && i.heure_fin)
        .map((inter) => {
          const nomClient = clientsMap?.get(inter.client_id) ?? 'Client inconnu';
          const nomTech = techMap?.get(inter.technicien_id) ?? 'Technicien inconnu';

          const colorClass =
            inter.statut === 'Terminée'
              ? 'bg-green-600'
              : inter.statut === 'En cours'
              ? 'bg-yellow-500'
              : 'bg-red-500';

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

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTech) {
      setEvents(allEvents);
    } else {
      setEvents(allEvents.filter((e) => e.technicien_id === selectedTech));
    }
  }, [selectedTech, allEvents]);

  const eventStyleGetter: EventPropGetter<InterventionEvent> = (event) => {
    return {
      className: `text-white ${event.colorClass}`,
      style: {
        borderRadius: '4px',
        padding: '2px 4px',
        fontSize: '0.85rem',
      },
    };
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendrier des interventions</h1>

      <div className="mb-4">
        <label className="font-semibold mr-2">Filtrer par technicien :</label>
        <select
          className="border px-2 py-1 rounded"
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

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={'week' as View}
        views={['week', 'day'] as View[]}
        defaultDate={new Date()}
        style={{ height: 700 }}
        messages={{
          week: 'Semaine',
          day: 'Jour',
          month: 'Mois',
          today: "Aujourd'hui",
          previous: 'Précédent',
          next: 'Suivant',
        }}
        formats={{
          timeGutterFormat: (date) => format(date, 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }) =>
            `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
        }}
        eventPropGetter={eventStyleGetter}
      />
    </main>
  );
}
