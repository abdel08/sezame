'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../../lib/supabaseClient';

// Configuration des icônes par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type SupabaseIntervention = {
  motif: string;
  statut: string;
  date_intervention: string;
  clients: {
    nom: string;
    adresse: string;
  };
  profiles: {
    nom: string;
  };
};

type MarkerInfo = {
  lat: number;
  lon: number;
  info: {
    motif: string;
    date_intervention: string;
    statut: string;
    client: string;
    technicien: string;
  };
};

export default function MapClient() {
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('interventions')
        .select(`motif, statut, date_intervention, clients:client_id(nom, adresse), profiles:technicien_id(nom)`)
        .returns<SupabaseIntervention[]>();

      console.log('📦 Données brutes Supabase :', data);

      if (!data) return;

      const results = await Promise.all(
        data.map(async (inter) => {
          const adresse = inter.clients?.adresse;
          const client = inter.clients?.nom ?? 'Client inconnu';
          const technicien = inter.profiles?.nom ?? 'Technicien inconnu';

          console.log('🧩 Intervention :', inter);
          console.log('📍 Adresse extraite :', adresse);

          if (!adresse) {
            console.warn('❌ Adresse manquante pour :', inter);
            return null;
          }

          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`
            );
            const coord = res.data?.[0];

            console.log('📍 Résultat géocodage pour', adresse, ':', res.data);

            if (!coord) return null;

            return {
              lat: parseFloat(coord.lat),
              lon: parseFloat(coord.lon),
              info: {
                motif: inter.motif,
                statut: inter.statut,
                date_intervention: inter.date_intervention,
                client,
                technicien,
              },
            };
          } catch (err) {
            console.error('Erreur géocodage :', err);
            return null;
          }
        })
      );

      const geoData = results.filter(Boolean) as MarkerInfo[];
      console.log('✅ Données géocodées finales :', geoData);
      setMarkers(geoData);
    }

    fetchData();
  }, []);

  return (
    <MapContainer center={[46.5, 2.2]} zoom={6} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lon]}>
          <Popup>
            <strong>{m.info.client}</strong><br />
            🛠 {m.info.motif}<br />
            👷 {m.info.technicien}<br />
            📅 {m.info.date_intervention}<br />
            📍 {m.info.statut}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
