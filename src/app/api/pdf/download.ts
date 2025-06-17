// /app/api/pdf/download.ts
import { NextRequest } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return new Response("ID manquant", { status: 400 });

  // Récupération des données intervention
  const { data: intervention, error: err1 } = await supabase
    .from("interventions")
    .select("*")
    .eq("id", id)
    .single();

  const { data: produits, error: err2 } = await supabase
    .from("intervention_produits")
    .select("*, produit_id(nom)")
    .eq("intervention_id", id);

  if (err1 || err2 || !intervention || !produits) {
    return new Response("Erreur récupération données", { status: 500 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoUrl = "https://your-project-url.supabase.co/storage/v1/object/public/photos/logo.png"; // ou ton vrai chemin public

  const companyName = "SEZAME Fermetures";
  const companyAddress = "10 rue de l’Exemple, 87000 Limoges";
  const title = `Fiche intervention #${id}`;
  let y = height - 50;

  page.drawText(companyName, { x: 50, y, size: 14, font, color: rgb(0, 0, 0) });
  y -= 15;
  page.drawText(companyAddress, { x: 50, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 30;
  page.drawText(title, { x: 50, y, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
  y -= 30;

  page.drawText(`Client : ${intervention.nom_client || "Non renseigné"}`, { x: 50, y, size: 10, font });
  y -= 20;

  produits.forEach((p: any, idx: number) => {
    const nomProduit = p.produit_id?.nom || "Produit inconnu";
    const statut = p.a_remplacer ? "À remplacer" : "Fonctionnel";
    const remarque = p.remarque || "—";
    page.drawText(`• ${nomProduit} - ${statut}`, { x: 60, y, size: 10, font });
    y -= 15;
    page.drawText(`  Remarque : ${remarque}`, { x: 70, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
    y -= 20;
  });

  if (intervention.signature_url) {
    const sigRes = await fetch(intervention.signature_url);
    const sigBuffer = await sigRes.arrayBuffer();
    const sigImage = await pdfDoc.embedPng(sigBuffer);
    const sigDims = sigImage.scale(0.25);

    page.drawText("Signature client :", { x: 50, y, size: 10, font });
    y -= sigDims.height + 10;

    page.drawImage(sigImage, {
      x: 50,
      y,
      width: sigDims.width,
      height: sigDims.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="intervention-${id}.pdf"`,
    },
  });
}
