'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface PortalInvoice {
  id: string;
  number: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  totalCents: number;
  paidCents: number;
  remainingCents: number;
  isOverdue: boolean;
  subscription: {
    number: string;
    plan: { name: string };
  };
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/invoices')
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue && status !== 'PAID') {
      return 'badge badge-danger';
    }
    const s = status.toUpperCase();
    if (s === 'PAID') return 'badge badge-success';
    if (s === 'CONFIRMED') return 'badge badge-info';
    return 'badge badge-warning';
  };

  return (
    <AppShell allowedRoles={['CUSTOMER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            My Invoices & Billing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Download PDF receipts, inspect tax line breakdowns, and review payment status.
          </p>
        </div>

        <div className="card border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Subscription</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th className="text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                      No invoices have been billed to your account yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs font-bold text-blue-400">
                        {inv.number}
                      </td>
                      <td className="text-xs text-slate-300">
                        {inv.subscription.number}
                      </td>
                      <td className="text-xs text-slate-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="text-xs">
                        <span className={inv.isOverdue ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-xs font-bold text-white">
                        {formatMoney(inv.totalCents)}
                      </td>
                      <td className="text-xs font-medium text-emerald-400">
                        {formatMoney(inv.paidCents)}
                      </td>
                      <td className="text-xs font-bold text-amber-300">
                        {formatMoney(inv.remainingCents)}
                      </td>
                      <td>
                        <span className={getStatusBadge(inv.status, inv.isOverdue)}>
                          {inv.isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 inline-flex items-center gap-1.5"
                        >
                          <span>📄</span>
                          <span>Download PDF</span>
                        </a>
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
