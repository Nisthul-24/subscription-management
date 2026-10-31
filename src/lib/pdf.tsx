import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0F1E2E',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE5EA',
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0E7C7B',
  },
  logoSub: {
    fontSize: 9,
    color: '#5B6B7A',
    marginTop: 3,
  },
  invoiceMeta: {
    textAlign: 'right',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F1E2E',
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#5B6B7A',
    marginTop: 2,
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  addressBlock: {
    width: '45%',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#5B6B7A',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  partyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F1E2E',
    marginBottom: 2,
  },
  partyText: {
    fontSize: 9,
    color: '#5B6B7A',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE5EA',
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    color: '#5B6B7A',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE5EA',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  colDesc: { width: '45%' },
  colQty: { width: '15%', textAlign: 'center' },
  colUnit: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  totalsTable: {
    width: '40%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    color: '#5B6B7A',
  },
  totalsValue: {
    color: '#0F1E2E',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#DDE5EA',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F1E2E',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E7C7B',
  },
  statusBadge: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDE5EA',
    paddingTop: 15,
    fontSize: 8,
    color: '#5B6B7A',
  },
});

interface InvoicePDFData {
  number: string;
  invoiceDate: Date;
  dueDate: Date;
  status: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  customer: {
    firstName: string;
    lastName: string;
    company?: string | null;
    email: string;
    address?: string | null;
    phone?: string | null;
  };
  lines: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    discountCents: number;
    taxCents: number;
  }>;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function InvoiceDocument({ invoice }: { invoice: InvoicePDFData }) {
  const isPaid = invoice.status === 'PAID';
  const remaining = Math.max(0, invoice.totalCents - invoice.paidCents);

  return (
    <Document title={`Invoice-${invoice.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>BRIGHTLOOP</Text>
            <Text style={styles.logoSub}>Subscription Management Platform</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
            <Text style={{ fontSize: 9, color: '#5B6B7A', marginTop: 4 }}>
              Date: {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
            </Text>
            <Text style={{ fontSize: 9, color: '#5B6B7A' }}>
              Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionTitle}>Billed To:</Text>
            <Text style={styles.partyName}>
              {invoice.customer.company || `${invoice.customer.firstName} ${invoice.customer.lastName}`}
            </Text>
            <Text style={styles.partyText}>
              Attn: {invoice.customer.firstName} {invoice.customer.lastName}
            </Text>
            <Text style={styles.partyText}>{invoice.customer.email}</Text>
            {invoice.customer.address && <Text style={styles.partyText}>{invoice.customer.address}</Text>}
            {invoice.customer.phone && <Text style={styles.partyText}>{invoice.customer.phone}</Text>}
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.sectionTitle}>Issued By:</Text>
            <Text style={styles.partyName}>Brightloop Software Inc.</Text>
            <Text style={styles.partyText}>100 Market Street, Suite 900</Text>
            <Text style={styles.partyText}>San Francisco, CA 94105</Text>
            <Text style={styles.partyText}>billing@brightloop.dev</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Item & Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Unit Price</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>

          {invoice.lines.map((line, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colUnit}>{formatCents(line.unitPriceCents)}</Text>
              <Text style={styles.colTotal}>{formatCents(line.lineTotalCents)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal:</Text>
              <Text style={styles.totalsValue}>{formatCents(invoice.subtotalCents)}</Text>
            </View>

            {invoice.discountCents > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discounts:</Text>
                <Text style={[styles.totalsValue, { color: '#2E7D4F' }]}>
                  -{formatCents(invoice.discountCents)}
                </Text>
              </View>
            )}

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Taxes:</Text>
              <Text style={styles.totalsValue}>{formatCents(invoice.taxCents)}</Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>{formatCents(invoice.totalCents)}</Text>
            </View>

            {invoice.paidCents > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Amount Paid:</Text>
                <Text style={[styles.totalsValue, { color: '#2E7D4F' }]}>
                  -{formatCents(invoice.paidCents)}
                </Text>
              </View>
            )}

            <View style={[styles.totalsRow, { marginTop: 4 }]}>
              <Text style={styles.totalsLabel}>Balance Due:</Text>
              <Text style={[styles.totalsValue, { fontSize: 11, color: isPaid ? '#2E7D4F' : '#C8372D' }]}>
                {formatCents(remaining)}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPaid ? 'rgba(46, 125, 79, 0.12)' : 'rgba(200, 55, 45, 0.12)',
                  color: isPaid ? '#2E7D4F' : '#C8372D',
                },
              ]}
            >
              <Text>{isPaid ? 'PAID IN FULL' : `STATUS: ${invoice.status}`}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing Brightloop. For inquiries, email billing@brightloop.dev.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDFBuffer(invoice: InvoicePDFData): Promise<Buffer> {
  const doc = <InvoiceDocument invoice={invoice} />;
  return renderToBuffer(doc);
}
