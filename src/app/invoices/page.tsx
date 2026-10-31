'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface Invoice {
  id: string;
  number: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  remainingCents: number;
  isOverdue: boolean;
  customer: {
    firstName: string;
    lastName: string;
    company?: string | null;
    email: string;
  };
  subscription: {
    number: string;
    plan: { name: string; billingPeriod: string };
  };
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  // Payment recording modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payNote, setPayNote] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const json = await res.json();
        setInvoices(json.invoices);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Action failed');
        return;
      }
      setMessage(json.message);
      await loadData();
    } catch {
      alert('Network error executing invoice action');
    }
  };

  const handleOpenPayModal = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayAmount((inv.remainingCents / 100).toFixed(2));
    setPayMethod('BANK_TRANSFER');
    setPayNote('');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setRecordingPayment(true);
    const amountCents = Math.round(parseFloat(payAmount) * 100);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payingInvoice.id,
          method: payMethod,
          amountCents,
          paymentDate: new Date().toISOString(),
          note: payNote,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Payment failed');
        setRecordingPayment(false);
        return;
      }

      setPayingInvoice(null);
      setMessage(`Payment of $${(amountCents / 100).toFixed(2)} recorded on ${payingInvoice.number}`);
      await loadData();
    } catch {
      alert('Network error recording payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'OVERDUE' && !inv.isOverdue) return false;
    if (filter !== 'ALL' && filter !== 'OVERDUE' && inv.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const numMatch = inv.number.toLowerCase().includes(q);
      const nameMatch = `${inv.customer.firstName} ${inv.customer.lastName}`.toLowerCase().includes(q);
      const compMatch = inv.customer.company?.toLowerCase().includes(q);
      if (!numMatch && !nameMatch && !compMatch) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue && status !== 'PAID') {
      return 'badge badge-danger';
    }
    const s = status.toUpperCase();
    if (s === 'PAID') return 'badge badge-success';
    if (s === 'CONFIRMED') return 'badge badge-accent';
    if (s === 'CANCELLED') return 'badge badge-neutral';
    return 'badge badge-warning';
  };

  return (
    <AppShell allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Invoices & Billing
            </h1>
            <p className="text-sm text-muted mt-1">
              Automated invoice tracking, PDF downloads, email dispatch, and payment collections.
            </p>
          </div>

          <a
            href="/api/reports/export?type=invoices"
            download
            className="btn btn-secondary text-sm font-medium flex items-center gap-2"
          >
            <span>📥</span>
            <span>Export Invoices CSV</span>
          </a>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-xs text-primary hover:text-ink">
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface/60 border border-border">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === st
                    ? st === 'OVERDUE'
                      ? 'bg-danger text-danger-ink text-ink shadow-md shadow-red-500/20'
                      : 'bg-primary text-ink shadow-md shadow-blue-500/20'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, customer..."
              className="input text-xs w-full py-1.5"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted text-xs">
                      Loading invoices...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted text-xs">
                      No invoices found. Run the billing engine from the Dashboard to generate invoices for active subscriptions!
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs font-bold text-primary">
                        {inv.number}
                      </td>
                      <td className="text-xs">
                        <div className="font-semibold text-ink">
                          {inv.customer.company || `${inv.customer.firstName} ${inv.customer.lastName}`}
                        </div>
                        <div className="text-muted text-[11px]">{inv.customer.email}</div>
                      </td>
                      <td className="text-xs text-muted">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="text-xs">
                        <div className={inv.isOverdue ? 'text-danger font-bold' : 'text-ink'}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                          {inv.isOverdue && <span className="ml-1 text-[10px]">⚠️</span>}
                        </div>
                      </td>
                      <td className="text-xs font-semibold text-ink">
                        {formatMoney(inv.totalCents)}
                      </td>
                      <td className="text-xs text-success font-medium">
                        {formatMoney(inv.paidCents)}
                      </td>
                      <td className="text-xs font-bold text-warning">
                        {formatMoney(inv.remainingCents)}
                      </td>
                      <td>
                        <span className={getStatusBadge(inv.status, inv.isOverdue)}>
                          {inv.isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'DRAFT' && (
                            <button
                              onClick={() => handleAction(inv.id, 'confirm')}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
                            >
                              Confirm
                            </button>
                          )}

                          <button
                            onClick={() => handleAction(inv.id, 'send')}
                            title="Send email to client with invoice"
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-surface text-ink hover:bg-border border border-border"
                          >
                            ✉️ Send
                          </button>

                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download PDF"
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-surface text-primary hover:bg-border border border-border"
                          >
                            📄 PDF
                          </a>

                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleOpenPayModal(inv)}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-success text-success-ink/20 text-success hover:bg-success text-success-ink/30 border border-success/30"
                            >
                              💳 Pay
                            </button>
                          )}

                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleAction(inv.id, 'cancel')}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-danger text-danger-ink/10 text-danger hover:bg-danger text-danger-ink/20 border border-danger/20"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Record Payment */}
        {payingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-ink">Record Invoice Payment</h3>
                  <p className="text-xs text-primary font-mono mt-0.5">{payingInvoice.number}</p>
                </div>
                <button
                  onClick={() => setPayingInvoice(null)}
                  className="text-muted hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border/80 space-y-1 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Client:</span>
                  <span className="text-ink font-medium">
                    {payingInvoice.customer.company || `${payingInvoice.customer.firstName} ${payingInvoice.customer.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Total Amount:</span>
                  <span className="text-ink font-semibold">{formatMoney(payingInvoice.totalCents)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Already Paid:</span>
                  <span className="text-success font-semibold">{formatMoney(payingInvoice.paidCents)}</span>
                </div>
                <div className="flex justify-between text-muted pt-1 border-t border-border">
                  <span className="font-bold text-ink">Remaining Balance:</span>
                  <span className="font-bold text-warning">{formatMoney(payingInvoice.remainingCents)}</span>
                </div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wider">
                    Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(payingInvoice.remainingCents / 100).toFixed(2)}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                    className="input w-full font-semibold text-ink"
                  />
                  <span className="text-[11px] text-muted mt-1 block">
                    Supports partial payment up to remaining balance
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="input w-full text-xs"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (ACH / Wire)</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CHECK">Check</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wider">
                    Reference / Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="e.g. Wire reference #TXN-98214"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    className="btn btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordingPayment}
                    className="btn btn-primary text-xs font-medium"
                  >
                    {recordingPayment ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
