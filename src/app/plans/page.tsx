'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface Plan {
  id: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  minQuantity: number;
  pausable: boolean;
  closableEarly: boolean;
  renewable: boolean;
  autoCloseAtEnd: boolean;
  active: boolean;
  _count?: { subscriptions: number };
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('MONTHLY');
  const [minQuantity, setMinQuantity] = useState('1');
  const [pausable, setPausable] = useState(false);
  const [closableEarly, setClosableEarly] = useState(true);
  const [renewable, setRenewable] = useState(true);
  const [autoCloseAtEnd, setAutoCloseAtEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const json = await res.json();
        setPlans(json.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          priceCents: Math.round(parseFloat(price) * 100),
          billingPeriod,
          minQuantity: Number(minQuantity),
          pausable,
          closableEarly,
          renewable,
          autoCloseAtEnd,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setPrice('');
        await loadPlans();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create plan');
      }
    } catch {
      alert('Error creating plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Subscription Plans
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Billing frequencies, minimum quantities, lifecycle behavior flags, and renewal terms.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Create Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              No plans configured yet.
            </div>
          ) : (
            plans.map((pl) => (
              <div key={pl.id} className="card p-6 border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-white">{pl.name}</h3>
                    <span className="badge badge-info text-[10px] uppercase">{pl.billingPeriod}</span>
                  </div>

                  <div className="text-2xl font-extrabold text-blue-400 mb-4">
                    {formatMoney(pl.priceCents)}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      / {pl.billingPeriod.toLowerCase()}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Lifecycle Rules:
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className={pl.pausable ? 'text-emerald-400' : 'text-slate-500'}>
                        {pl.pausable ? '✓' : '✕'}
                      </span>
                      <span>Can Pause Subscription</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className={pl.closableEarly ? 'text-emerald-400' : 'text-slate-500'}>
                        {pl.closableEarly ? '✓' : '✕'}
                      </span>
                      <span>Can Close Early</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className={pl.renewable ? 'text-emerald-400' : 'text-slate-500'}>
                        {pl.renewable ? '✓' : '✕'}
                      </span>
                      <span>Auto-Renewable</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className={pl.autoCloseAtEnd ? 'text-amber-400' : 'text-slate-500'}>
                        {pl.autoCloseAtEnd ? '✓' : '✕'}
                      </span>
                      <span>Auto-Close on Expiration</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
                  <span>Min Quantity: {pl.minQuantity}</span>
                  <span>{pl._count?.subscriptions || 0} active subscriptions</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Create Plan */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Create Plan</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Growth Monthly"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Period</label>
                    <select
                      value={billingPeriod}
                      onChange={(e) => setBillingPeriod(e.target.value)}
                      className="input w-full text-xs"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49.00"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="input w-full text-xs"
                  />
                </div>

                {/* Behavioral Switches */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Behavioral Switches:
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pausable}
                      onChange={(e) => setPausable(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-200">Allow Customer to Pause</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={closableEarly}
                      onChange={(e) => setClosableEarly(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-200">Allow Early Cancellation</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={renewable}
                      onChange={(e) => setRenewable(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-200">Auto-Renew at End of Term</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCloseAtEnd}
                      onChange={(e) => setAutoCloseAtEnd(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-200">Auto-Close upon Expiration Date</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary text-xs font-medium">
                    {submitting ? 'Creating...' : 'Create Plan'}
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
