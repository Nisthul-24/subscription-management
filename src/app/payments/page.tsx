'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';

interface PaymentItem {
  id: string;
  amountCents: number;
  paymentDate: string;
  method: string;
  note?: string | null;
  invoice: {
    number: string;
    totalCents: number;
    paidCents: number;
    customer: { firstName: string; lastName: string; company?: string | null };
  };
  recordedBy: {
    firstName: string;
    lastName: string;
  };
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => setPayments(data.payments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalCollectedCents = payments.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <AppShell allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Payments & Transactions
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Audit log of cash collections, card settlements, wire confirmations, and notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400">
              Total Settled: {formatMoney(totalCollectedCents)}
            </div>
            <a
              href="/api/reports/export?type=payments"
              download
              className="btn btn-secondary text-sm font-medium flex items-center gap-2"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        <div className="card border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Recorded By</th>
                  <th>Reference / Note</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                      Loading payment records...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                      No payments recorded yet. Invoices can be paid directly from the Invoices page.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td className="text-xs text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-xs font-semibold text-blue-400">
                        <Link href="/invoices" className="hover:underline">
                          {p.invoice.number}
                        </Link>
                      </td>
                      <td className="text-xs font-medium text-white">
                        {p.invoice.customer.company || `${p.invoice.customer.firstName} ${p.invoice.customer.lastName}`}
                      </td>
                      <td className="text-xs font-bold text-emerald-400">
                        +{formatMoney(p.amountCents)}
                      </td>
                      <td className="text-xs">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {p.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">
                        {p.recordedBy.firstName} {p.recordedBy.lastName}
                      </td>
                      <td className="text-xs text-slate-400 max-w-xs truncate">
                        {p.note || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
