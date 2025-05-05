'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { supabase } from '../../../../lib/supabaseClient';

// Corrige les icônes manquantes de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Client = {
  nom: string;
  adresse: string;
};

type Technicien = {
  nom: string;
};

type SupabaseIntervention = {
  id: string;
  motif: string;
  statut: string;
  date_intervention: string;
  client: Client[];
  technicien: Technicien[];
};

type Intervention = {
  id: string;
  motif: string;
  statut: string;
  date_intervention: string;
  client: Client | null;
  technicien: Technicien | null;
};

type Positionnee = {
  lat: number;
  lon: number;
  info: Intervention;
};

export default function CarteInterventions() {
  const [markers, setMarkers] = useState<Positionnee[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('interventions')
        .select(`
          id, motif, statut, date_intervention, 
          client:client_id(nom, adresse), 
          technicien:technicien_id(nom)
        `);

      if (error || !data) {
        console.error('Erreur récupération interventions :', error);
        return;
      }

      const castedData = data as SupabaseIntervention[];

      const geoData: Positionnee[] = [];

      for (const inter of castedData) {
        const client = inter.client?.[0] ?? null;
        const technicien = inter.technicien?.[0] ?? null;

        if (!client?.adresse) continue;

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(client.adresse)}`
          );

          if (res.data?.[0]) {
            geoData.push({
              lat: parseFloat(res.data[0].lat),
              lon: parseFloat(res.data[0].lon),
              info: {
                id: inter.id,
                motif: inter.motif,
                statut: inter.statut,
                date_intervention: inter.date_intervention,
                client,
                technicien,
              },
            });
          }
        } catch (err) {
          console.error('Erreur géocodage :', err);
        }
      }

      setMarkers(geoData);
    }

    fetchData();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Carte des interventions</h1>

      <MapContainer center={[46.5, 2.2]} zoom={6} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lon]}>
            <Popup>
              <strong>{marker.info.client?.nom ?? 'Client inconnu'}</strong><br />
              🛠 {marker.info.motif}<br />
              👷 {marker.info.technicien?.nom ?? 'Technicien inconnu'}<br />
              📅 {marker.info.date_intervention}<br />
              📍 Statut : {marker.info.statut}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </main>
  );
}
