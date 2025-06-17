"use client";

import Image from 'next/image';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../../lib/supabaseClient";
import { uploadPhotoToServer } from "@/lib/uploadPhoto";
import {
  saveInterventionToCache,
  loadInterventionFromCache,
  type ProduitSelectionne,
  type InterventionTempData,
} from "@/lib/interventionCache";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import LayoutTechnicien from "@/components/LayoutTechnicien";
import { ArrowLeft } from "lucide-react";

interface Produit {
  id: string;
  nom: string;
}

export default function EtapeProduit() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState("");
  const [selectionnes, setSelectionnes] = useState<ProduitSelectionne[]>([]);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    supabase
      .from("produits")
      .select("*")
      .then(({ data, error }: { data: Produit[] | null; error: Error | null }) => {
        if (data) setProduits(data);
        if (error) console.error("Erreur produits :", error);
      });
  }, []);

  useEffect(() => {
    const cache = loadInterventionFromCache(id as string);
    if (cache?.produits) setSelectionnes(cache.produits);
  }, [id]);

  const enregistrerDansCache = (updated: ProduitSelectionne[]) => {
    const cache = loadInterventionFromCache(id as string) || {};
    saveInterventionToCache(id as string, {
      ...cache,
      produits: updated,
    } as InterventionTempData);
  };

  const ajouterProduit = (produit: Produit) => {
    if (!selectionnes.find((p) => p.id === produit.id)) {
      const updated: ProduitSelectionne[] = [
        ...selectionnes,
        {
          id: produit.id,
          nom: produit.nom,
          statut: "fonctionnel",
          photos: [],
        },
      ];
      setSelectionnes(updated);
      enregistrerDansCache(updated);
    }
    setRecherche("");
  };

  const modifierStatut = (id: string, statut: "fonctionnel" | "a_remplacer") => {
    const updated = selectionnes.map((p) =>
      p.id === id ? { ...p, statut } : p
    );
    setSelectionnes(updated);
    enregistrerDansCache(updated);
  };

  const modifierRemarque = (id: string, remarque: string) => {
    const updated = selectionnes.map((p) =>
      p.id === id ? { ...p, remarque } : p
    );
    setSelectionnes(updated);
    enregistrerDansCache(updated);
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
      const updated = selectionnes.map((p) =>
        p.id === produitId ? { ...p, photos: [...p.photos, ...newPhotos] } : p
      );
      setSelectionnes(updated);
      enregistrerDansCache(updated);
    }
  };

  const supprimerPhoto = async (produitId: string, path: string) => {
    const { error } = await supabase.storage.from("photos").remove([path]);
    if (error) {
      console.error("Erreur suppression :", error);
      return;
    }
    const updated = selectionnes.map((p) =>
      p.id === produitId
        ? { ...p, photos: p.photos.filter((photo) => photo.path !== path) }
        : p
    );
    setSelectionnes(updated);
    enregistrerDansCache(updated);
  };

  const produitsFiltres = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(recherche.toLowerCase()) &&
      !selectionnes.find((s) => s.id === p.id)
  );

  return (
    <LayoutTechnicien>
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
        <h1 className="text-2xl font-bold">🛠️ Vérification des produits</h1>
      </div>

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

      {selectionnes.length > 0 && (
        <div className="space-y-4 mt-6">
          {selectionnes.map((produit) => (
            <Card key={produit.id} className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  {produit.nom} {produit.statut === "a_remplacer" && <span className="text-red-500 text-sm">(à remplacer)</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={produit.statut === "fonctionnel" ? "default" : "outline"}
                    onClick={() => modifierStatut(produit.id, "fonctionnel")}
                  >
                    Fonctionnel
                  </Button>
                  <Button
                    variant={produit.statut === "a_remplacer" ? "default" : "outline"}
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
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          width={300}
                          height={200}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 bg-white border-t pt-4 pb-6 mt-6">
        <Button
          className="w-full text-base font-semibold"
          onClick={() => router.push(`/technicien/intervention/${id}/signature`)}
        >
          Suivant : Signature du client →
        </Button>
      </div>
    </LayoutTechnicien>
  );
}