'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface PortalSubscription {
  id: string;
  number: string;
  status: string;
  startDate: string;
  nextBillingDate?: string | null;
  plan: {
    name: string;
    billingPeriod: string;
    pausable: boolean;
    closableEarly: boolean;
  };
  lines: Array<{
    id: string;
    quantity: number;
    unitPriceCents: number;
    product: { name: string };
    variant?: { value: string } | null;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    status: string;
    totalCents: number;
    paidCents: number;
    dueDate: string;
  }>;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PortalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PortalSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/portal/subscriptions');
      if (res.ok) {
        const json = await res.json();
        setSubscriptions(json.subscriptions || []);
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
      const res = await fetch(`/api/portal/subscriptions/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Action not permitted');
        return;
      }
      setMessage(json.message);
      await loadData();
    } catch {
      alert('Error updating subscription');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'ACTIVE') return 'badge badge-success';
    if (s === 'PAUSED') return 'badge badge-warning';
    if (s === 'CLOSED') return 'badge badge-danger';
    return 'badge badge-neutral';
  };

  return (
    <AppShell allowedRoles={['CUSTOMER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            My Subscriptions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your active SaaS software seats, billing frequencies, and manage contract pauses or closures.
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-xs text-blue-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              Loading your subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 text-sm">
              You do not have any active subscriptions yet.
            </div>
          ) : (
            subscriptions.map((sub) => {
              const totalAmount = sub.lines.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0);

              return (
                <div key={sub.id} className="card p-6 border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-blue-400">{sub.number}</span>
                        <span className={getStatusBadge(sub.status)}>{sub.status}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Plan: <span className="text-white font-medium">{sub.plan.name}</span> ({sub.plan.billingPeriod.toLowerCase()})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.status === 'ACTIVE' && sub.plan.pausable && (
                        <button
                          onClick={() => handleAction(sub.id, 'pause')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 transition-colors"
                        >
                          Pause Plan
                        </button>
                      )}

                      {sub.status === 'PAUSED' && (
                        <button
                          onClick={() => handleAction(sub.id, 'resume')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                        >
                          Resume Plan
                        </button>
                      )}

                      {sub.status === 'ACTIVE' && sub.plan.closableEarly && (
                        <button
                          onClick={() => handleAction(sub.id, 'close')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/15 text-red-400 hover:bg-red-600/25 border border-red-500/20 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lines */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Included Licenses & Add-ons:
                    </div>
                    {sub.lines.map((l) => (
                      <div key={l.id} className="flex justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-950/60 border border-slate-900">
                        <span className="text-slate-300">
                          {l.quantity}x {l.product.name}
                          {l.variant && <span className="text-blue-400 ml-1">({l.variant.value})</span>}
                        </span>
                        <span className="font-semibold text-white">{formatMoney(l.quantity * l.unitPriceCents)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-2">
                    <div>
                      Next Billing Date:{' '}
                      <span className="text-white font-medium">
                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      Recurring Total: <span className="text-blue-400">{formatMoney(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
