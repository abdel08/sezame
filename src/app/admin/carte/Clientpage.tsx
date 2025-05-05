'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { supabase } from '../../../../lib/supabaseClient';

// Corriger les icônes Leaflet manquants
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Types stricts
type InterventionRecord = {
  id: string;
  motif: string;
  statut: string;
  date_intervention: string;
  client: {
    nom: string;
    adresse: string;
  } | null;
  technicien: {
    nom: string;
  } | null;
};

type MarkerData = {
  lat: number;
  lon: number;
  info: {
    motif: string;
    statut: string;
    date_intervention: string;
    client: string;
    technicien: string;
  };
};

export default function CarteInterventions() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

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
        console.error('❌ Erreur récupération interventions :', error);
        return;
      }

      const interventions = data as unknown as InterventionRecord[];

      const results = await Promise.all(
        interventions.map(async (inter) => {
          const adresse = inter.client?.adresse;
          const nomClient = inter.client?.nom ?? 'Client inconnu';
          const nomTech = inter.technicien?.nom ?? 'Technicien inconnu';

          if (!adresse) return null;

          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`
            );
            const coord = res.data?.[0];
            if (!coord) return null;

            return {
              lat: parseFloat(coord.lat),
              lon: parseFloat(coord.lon),
              info: {
                motif: inter.motif,
                statut: inter.statut,
                date_intervention: inter.date_intervention,
                client: nomClient,
                technicien: nomTech,
              },
            };
          } catch (err) {
            console.error('❌ Erreur géocodage :', err);
            return null;
          }
        })
      );

      setMarkers(results.filter(Boolean) as MarkerData[]);
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
              <strong>{marker.info.client}</strong><br />
              🛠 {marker.info.motif}<br />
              👷 {marker.info.technicien}<br />
              📅 {marker.info.date_intervention}<br />
              📍 Statut : {marker.info.statut}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </main>
  );
}
