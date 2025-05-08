"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../../lib/supabaseClient";
import { uploadPhotoToServer } from "../../../../../lib/uploadPhoto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Produit {
  id: string;
  nom: string;
}

interface ProduitSelectionne {
  id: string;
  nom: string;
  statut: "fonctionnel" | "a_remplacer";
  remarque?: string;
  photos: { name: string; url: string; path: string }[];
}

export default function EtapeProduit() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState("");
  const [selectionnes, setSelectionnes] = useState<ProduitSelectionne[]>([]);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    supabase.from("produits").select("*").then(({ data, error }) => {
      if (data) setProduits(data);
      if (error) console.error("Erreur produits :", error);
    });
  }, []);

  const ajouterProduit = (produit: Produit) => {
    if (!selectionnes.find((p) => p.id === produit.id)) {
      setSelectionnes((prev) => [
        ...prev,
        { ...produit, statut: "fonctionnel", photos: [] },
      ]);
    }
    setRecherche("");
  };

  const modifierStatut = (id: string, statut: "fonctionnel" | "a_remplacer") => {
    setSelectionnes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statut } : p))
    );
  };

  const modifierRemarque = (id: string, remarque: string) => {
    setSelectionnes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, remarque } : p))
    );
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    produitId: string
  ) => {
    const files = e.target.files;
    if (!files) return;

    const uploads = await Promise.all(
      Array.from(files).map((file) => uploadPhotoToServer(file, produitId))
    );

    const newPhotos = uploads.filter(Boolean) as ProduitSelectionne["photos"];

    if (newPhotos.length > 0) {
      setSelectionnes((prev) =>
        prev.map((p) =>
          p.id === produitId
            ? { ...p, photos: [...p.photos, ...newPhotos] }
            : p
        )
      );
    }
  };

  const supprimerPhoto = async (produitId: string, path: string) => {
    const { error } = await supabase.storage.from("photos").remove([path]);
    if (error) {
      console.error("Erreur suppression :", error);
      return;
    }
    setSelectionnes((prev) =>
      prev.map((p) =>
        p.id === produitId
          ? { ...p, photos: p.photos.filter((photo) => photo.path !== path) }
          : p
      )
    );
  };

  const retirerProduit = (id: string) => {
    setSelectionnes((prev) => prev.filter((p) => p.id !== id));
  };

  const produitsFiltres = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(recherche.toLowerCase()) &&
      !selectionnes.find((s) => s.id === p.id)
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Sélection des produits</h1>

      <Input
        placeholder="Rechercher un produit"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {recherche && (
        <div className="space-y-2 border rounded mt-2 p-2 bg-white">
          {produitsFiltres.map((p) => (
            <div
              key={p.id}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => ajouterProduit(p)}
            >
              {p.nom}
            </div>
          ))}
          {produitsFiltres.length === 0 && (
            <p className="text-gray-500 text-sm">Aucun produit trouvé</p>
          )}
        </div>
      )}

      {selectionnes.map((produit) => (
        <Card key={produit.id} className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{produit.nom}</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => retirerProduit(produit.id)}
            >
              Retirer
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={
                produit.statut === "fonctionnel" ? "default" : "outline"
              }
              onClick={() => modifierStatut(produit.id, "fonctionnel")}
            >
              Fonctionnel
            </Button>
            <Button
              variant={
                produit.statut === "a_remplacer" ? "default" : "outline"
              }
              onClick={() => modifierStatut(produit.id, "a_remplacer")}
            >
              À remplacer
            </Button>
          </div>

          <Textarea
            placeholder="Remarque optionnelle"
            value={produit.remarque || ""}
            onChange={(e) => modifierRemarque(produit.id, e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileInputChange(e, produit.id)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {produit.photos.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {produit.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="h-24 w-full object-cover rounded border"
                  />
                  <button
                    onClick={() => supprimerPhoto(produit.id, photo.path)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Button
        className="w-full"
        onClick={() => router.push(`/technicien/intervention/${id}/signature`)}
      >
        Suivant
      </Button>
    </div>
  );
}
