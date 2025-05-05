'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabaseClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CreerIntervention() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [techniciens, setTechniciens] = useState<any[]>([]);
  const [form, setForm] = useState({
    client_id: '',
    motif: '',
    technicien_id: '',
    date_intervention: new Date(),
    heure_debut: '',
    heure_fin: '',
  });

  useEffect(() => {
    async function fetchData() {
      const { data: clientsData } = await supabase.from('clients').select('*');
      setClients(clientsData || []);

      const { data: techniciensData } = await supabase
        .from('profiles')
        .select('id, nom')
        .eq('role', 'technicien');

      setTechniciens(techniciensData || []);
    }

    fetchData();
  }, []);

  async function verifierDisponibilite(date: Date, heureDebut: string, heureFin: string) {
    if (!date || !heureDebut || !heureFin) return;

    const dateStr = date.toISOString().split('T')[0];

    const { data: interventions } = await supabase
      .from('interventions')
      .select('technicien_id, heure_debut, heure_fin')
      .eq('date_intervention', dateStr);

    const techniciensDisponibles = techniciens.map((tech) => {
      const conflit = interventions?.some((inter: any) =>
        inter.technicien_id === tech.id &&
        heureDebut < inter.heure_fin &&
        heureFin > inter.heure_debut
      );

      return {
        ...tech,
        disponible: !conflit,
      };
    });

    setTechniciens(techniciensDisponibles);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    const { error } = await supabase.from('interventions').insert([{
      ...form,
      date_intervention: form.date_intervention.toISOString().split('T')[0],
      validation_technicien: 'en_attente',
    }]);
    if (!error) router.push('/admin/dashboard');
    else alert('Erreur création intervention : ' + error.message);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Créer une intervention</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        {/* Choix Client */}
        <select
          className="border p-2 w-full"
          value={form.client_id}
          onChange={(e) => setForm({ ...form, client_id: e.target.value })}
          required
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nom} - {client.adresse}
            </option>
          ))}
        </select>

        {/* Motif */}
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Motif de l'intervention"
          value={form.motif}
          onChange={(e) => setForm({ ...form, motif: e.target.value })}
          required
        />

        {/* Date Intervention */}
        <div className="border p-2 w-full">
          <DatePicker
            selected={form.date_intervention}
            onChange={(date: Date | null) => {
              if (date) {
                setForm({ ...form, date_intervention: date });
                verifierDisponibilite(date, form.heure_debut, form.heure_fin);
              }
            }}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2"
          />
        </div>

        {/* Heure Début */}
        <input
          type="time"
          className="border p-2 w-full"
          value={form.heure_debut}
          onChange={(e) => {
            const newHeure = e.target.value;
            setForm({ ...form, heure_debut: newHeure });
            verifierDisponibilite(form.date_intervention, newHeure, form.heure_fin);
          }}
          required
        />

        {/* Heure Fin */}
        <input
          type="time"
          className="border p-2 w-full"
          value={form.heure_fin}
          onChange={(e) => {
            const newHeure = e.target.value;
            setForm({ ...form, heure_fin: newHeure });
            verifierDisponibilite(form.date_intervention, form.heure_debut, newHeure);
          }}
          required
        />

        {/* Technicien */}
        <select
          className="border p-2 w-full"
          value={form.technicien_id}
          onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
          required
        >
          <option value="">Sélectionner un technicien</option>
          {techniciens.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.disponible === false ? '🔴' : '🟢'} {tech.nom}
            </option>
          ))}
        </select>

        {/* Submit */}
        <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">
          Créer l'intervention
        </button>
      </form>
    </main>
  );
}
