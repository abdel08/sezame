


import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type ProduitSelectionne = {
  id: string;
  nom: string;
  statut: 'fonctionnel' | 'a_remplacer';
  remarque?: string;
  photos?: { name: string; url: string; path: string }[];
};

export type PdfInterventionData = {
  id: string;
  date: string;
  client: {
    nom: string;
    adresse: string;
    telephone: string;
    email?: string;
  };
  produits: ProduitSelectionne[];
  signatureBase64: string;
};

export async function generatePdfAndDownload(data: PdfInterventionData) {
  const doc = await PDFDocument.create();
  const page = doc.addPage();

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Logo
  const logoImage = await fetch('/assets/logo.jpg')
    .then((res) => res.arrayBuffer())
    .then((buf) => doc.embedPng(buf).catch(() => doc.embedJpg(buf)));

  if (logoImage) {
    const logoDims = logoImage.scale(0.15);
    page.drawImage(logoImage, {
      x: width - logoDims.width - margin,
      y: y - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  // Titre
  page.drawText('Fiche d\'intervention', {
    x: margin,
    y: y,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Coordonnées entreprise
  const entrepriseInfo = `SEZAME FERMETURES\n2 Rue des Entrepreneurs\n87000 Limoges\ncontact@sezame-fermetures.fr\n07 68 42 96 02`;
  entrepriseInfo.split('\n').forEach((line) => {
    page.drawText(line, { x: margin, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 14;
  });
  y -= 10;

  // Infos intervention et client
  page.drawText(`Date: ${data.date}`, { x: margin, y, size: 10, font });
  y -= 14;
  page.drawText(`Client: ${data.client.nom}`, { x: margin, y, size: 10, font });
  y -= 14;
  page.drawText(`Adresse: ${data.client.adresse}`, { x: margin, y, size: 10, font });
  y -= 14;
  page.drawText(`Téléphone: ${data.client.telephone}`, { x: margin, y, size: 10, font });
  if (data.client.email) {
    y -= 14;
    page.drawText(`Email: ${data.client.email}`, { x: margin, y, size: 10, font });
  }
  y -= 20;

  // Produits
  page.drawText(`Produits vérifiés :`, { x: margin, y, size: 12, font });
  y -= 20;

  data.produits.forEach((p, index) => {
    const statutText = p.statut === 'fonctionnel' ? '[OK] Fonctionnel' : '[X] À remplacer';
    const line = `${index + 1}. ${p.nom} - ${statutText}`;    
    page.drawText(line, { x: margin, y, size: 10, font });
    y -= 14;
    if (p.remarque) {
      page.drawText(`Remarque : ${p.remarque}`, {
        x: margin + 10,
        y,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 12;
    }
  });

  y -= 20;
  page.drawText('Signature client :', { x: margin, y, size: 12, font });
  y -= 60;

  // Signature image
  const signatureImage = await fetch(data.signatureBase64).then((res) => res.arrayBuffer());
  const embeddedSignature = await doc.embedPng(signatureImage).catch(() => doc.embedJpg(signatureImage));
  if (embeddedSignature) {
    page.drawImage(embeddedSignature, {
      x: margin,
      y,
      width: 120,
      height: 60,
    });
  }

  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `intervention_${data.id}.pdf`);
}
