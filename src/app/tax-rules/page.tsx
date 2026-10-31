'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface TaxRule {
  id: string;
  name: string;
  rateBps: number;
  applicability: string;
  active: boolean;
}

export default function TaxRulesPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [ratePercent, setRatePercent] = useState('18');
  const [applicability, setApplicability] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/tax-rules');
      if (res.ok) {
        const json = await res.json();
        setTaxRules(json.taxRules || []);
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

    try {
      const res = await fetch('/api/admin/tax-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rateBps: Math.round(parseFloat(ratePercent) * 100),
          applicability,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setRatePercent('18');
        await loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create tax rule');
      }
    } catch {
      alert('Error creating tax rule');
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
              Tax Rules
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configured tax rates in basis points, applied to lines post-discount with half-up rounding.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Tax Rule</span>
          </button>
        </div>

        <div className="card border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Effective Rate</th>
                  <th>Basis Points (Bps)</th>
                  <th>Applicability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                      Loading tax rules...
                    </td>
                  </tr>
                ) : taxRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                      No tax rules defined yet.
                    </td>
                  </tr>
                ) : (
                  taxRules.map((tr) => (
                    <tr key={tr.id}>
                      <td className="text-xs font-semibold text-white">{tr.name}</td>
                      <td className="text-xs font-bold text-blue-400">
                        {(tr.rateBps / 100).toFixed(2)}%
                      </td>
                      <td className="text-xs font-mono text-slate-400">{tr.rateBps} bps</td>
                      <td>
                        <span className="badge badge-neutral uppercase text-[10px]">
                          {tr.applicability}
                        </span>
                      </td>
                      <td>
                        <span className={tr.active ? 'badge badge-success' : 'badge badge-danger'}>
                          {tr.active ? 'ACTIVE' : 'INACTIVE'}
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Create Tax Rule</h3>
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
                    placeholder="e.g. GST 18% or State VAT"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rate Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={ratePercent}
                    onChange={(e) => setRatePercent(e.target.value)}
                    placeholder="18"
                    className="input w-full text-xs"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Saved internally as basis points ({Math.round(parseFloat(ratePercent || '0') * 100)} bps)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Applicability Scope</label>
                  <select
                    value={applicability}
                    onChange={(e) => setApplicability(e.target.value)}
                    className="input w-full text-xs"
                  >
                    <option value="ALL">All Items</option>
                    <option value="PRODUCT">Products (Software Tiers)</option>
                    <option value="SERVICE">Services (Add-ons)</option>
                  </select>
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
