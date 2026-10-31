'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface DiscountRule {
  id: string;
  name: string;
  discountType: string;
  valueCents: number;
  valueBps: number;
  minPurchaseCents: number;
  minQuantity: number;
  usageLimit?: number | null;
  usageCount: number;
  scope: string;
  active: boolean;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DiscountRulesPage() {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [value, setValue] = useState('15');
  const [minPurchase, setMinPurchase] = useState('0');
  const [scope, setScope] = useState('SUBSCRIPTION');
  const [usageLimit, setUsageLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/discount-rules');
      if (res.ok) {
        const json = await res.json();
        setRules(json.discountRules || []);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isFixed = discountType === 'FIXED';
    const numVal = parseFloat(value || '0');

    try {
      const res = await fetch('/api/admin/discount-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          discountType,
          valueCents: isFixed ? Math.round(numVal * 100) : 0,
          valueBps: !isFixed ? Math.round(numVal * 100) : 0,
          minPurchaseCents: Math.round(parseFloat(minPurchase || '0') * 100),
          scope,
          usageLimit: usageLimit ? Number(usageLimit) : null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setValue('15');
        setMinPurchase('0');
        setUsageLimit('');
        await loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create discount rule');
      }
    } catch {
      alert('Error creating discount rule');
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
              Discount Rules & Promotions
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated discount matching during invoice generation (highest value wins per line).
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Create Discount Rule</span>
          </button>
        </div>

        <div className="card border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Promotion Name</th>
                  <th>Type</th>
                  <th>Discount Value</th>
                  <th>Scope</th>
                  <th>Min Purchase</th>
                  <th>Usage Counter</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                      Loading discount rules...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                      No discount rules configured yet.
                    </td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r.id}>
                      <td className="text-xs font-semibold text-white">{r.name}</td>
                      <td className="text-xs font-medium text-slate-300">{r.discountType}</td>
                      <td className="text-xs font-bold text-emerald-400">
                        {r.discountType === 'FIXED'
                          ? formatMoney(r.valueCents)
                          : `${(r.valueBps / 100).toFixed(2)}%`}
                      </td>
                      <td>
                        <span className="badge badge-neutral uppercase text-[10px]">
                          {r.scope}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">
                        {r.minPurchaseCents > 0 ? formatMoney(r.minPurchaseCents) : 'None'}
                      </td>
                      <td className="text-xs font-mono text-slate-300">
                        {r.usageCount} / {r.usageLimit ?? '∞'}
                      </td>
                      <td>
                        <span className={r.active ? 'badge badge-success' : 'badge badge-danger'}>
                          {r.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Create Discount Rule</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q4 Growth Promo 15%"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="input w-full text-xs"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {discountType === 'PERCENTAGE' ? 'Rate (%)' : 'Amount ($)'}
                    </label>
                    <input
                      type="number"
                      step={discountType === 'PERCENTAGE' ? '0.01' : '0.01'}
                      min="0"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={discountType === 'PERCENTAGE' ? '15' : '25.00'}
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Applicable Scope</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="input w-full text-xs"
                    >
                      <option value="SUBSCRIPTION">Whole Subscription</option>
                      <option value="PRODUCT">Specific Products</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Min. Purchase ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                      placeholder="0.00"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Usage Limit (Leave blank for unlimited)</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 500 redemptions"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary text-xs font-medium">
                    {submitting ? 'Creating...' : 'Create Rule'}
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
