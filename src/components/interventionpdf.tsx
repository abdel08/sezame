'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { PdfInterventionData } from '@/lib/type';

const logo = 'http://localhost:3000/assets/logo.jpg';

interface Props {
  data: PdfInterventionData;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#f9f9fc',
    color: '#1c1c1c',
  },
  header: {
    borderBottom: '2px solid #2e5aac',
    paddingBottom: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 100,
  },
  titleBox: {
    textAlign: 'center',
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e5aac',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 16,
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#2e5aac',
    borderBottom: '1px solid #2e5aac',
    paddingBottom: 3,
    textTransform: 'uppercase',
  },
  item: {
    marginBottom: 4,
    lineHeight: 1.5,
  },
  label: {
    fontWeight: 'bold',
  },
  productBox: {
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 10,
  },
  signature: {
    marginTop: 10,
    width: 160,
    height: 70,
    border: '1px solid #ccc',
  },
  footer: {
    marginTop: 25,
    fontSize: 9,
    textAlign: 'center',
    color: '#777',
  },
});

export function InterventionPDF({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View>
            <Text>SEZAME Fermetures</Text>
            <Text>2 Rue des Entrepreneurs</Text>
            <Text>87000 Limoges</Text>
            <Text>contact@sezame-fermetures.fr</Text>
            <Text>07 68 42 96 02</Text>
          </View>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.mainTitle}>FICHE D’INTERVENTION</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS CLIENT</Text>
          <Text style={styles.item}><Text style={styles.label}>Nom :</Text> {data.client.nom}</Text>
          <Text style={styles.item}><Text style={styles.label}>Adresse :</Text> {data.client.adresse}</Text>
          <Text style={styles.item}><Text style={styles.label}>Téléphone :</Text> {data.client.telephone}</Text>
          {data.client.email && (
            <Text style={styles.item}><Text style={styles.label}>Email :</Text> {data.client.email}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAILS DE L’INTERVENTION</Text>
          <Text style={styles.item}><Text style={styles.label}>Date :</Text> {data.date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRODUITS VÉRIFIÉS</Text>
          {data.produits.map((p, i) => (
            <View key={i} style={styles.productBox}>
              <Text>- {p.nom} ({p.statut === 'a_remplacer' ? 'À remplacer' : 'Fonctionnel'})</Text>
              {p.remarque && <Text>  Remarque : {p.remarque}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIGNATURE DU CLIENT</Text>
          <Image src={`data:image/png;base64,${data.signatureBase64}`} style={styles.signature} />
        </View>

        <Text style={styles.footer}>
          Rapport généré automatiquement — {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </Text>
      </Page>
    </Document>
  );
}
