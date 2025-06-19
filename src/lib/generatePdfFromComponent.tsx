'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InterventionPDF } from '@/components/interventionpdf'; // ✅ Le fichier s'appelle interventionpdf.tsx
import type { PdfInterventionData } from '@/lib/type';

export async function generatePdfFromComponent(data: PdfInterventionData) {
  const element = <InterventionPDF data={data} />;
  const blob = await pdf(element).toBlob();
  saveAs(blob, `intervention_${data.id}.pdf`);
}
