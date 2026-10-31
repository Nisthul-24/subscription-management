'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  email: string;
}

interface Plan {
  id: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  pausable: boolean;
  closableEarly: boolean;
}

interface Product {
  id: string;
  name: string;
  salesPriceCents: number;
  attributes: Array<{
    id: string;
    name: string;
    variants: Array<{ id: string; value: string; extraPriceCents: number }>;
  }>;
}

interface TaxRule {
  id: string;
  name: string;
  rateBps: number;
}

interface SubscriptionLine {
  id: string;
  quantity: number;
  unitPriceCents: number;
  product: { name: string };
  variant?: { value: string } | null;
}

interface Subscription {
  id: string;
  number: string;
  status: string;
  startDate: string;
  nextBillingDate?: string | null;
  paymentTermsDays: number;
  customer: Customer;
  plan: Plan;
  lines: SubscriptionLine[];
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(15);
  const [formLines, setFormLines] = useState<
    Array<{ productId: string; variantId?: string; quantity: number; unitPriceCents: number; taxRuleIds?: string[] }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      if (res.ok) {
        const json = await res.json();
        setSubscriptions(json.subscriptions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [cRes, plRes, prRes, tRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/admin/plans'),
        fetch('/api/admin/products'),
        fetch('/api/admin/tax-rules'),
      ]);

      if (cRes.ok) {
        const json = await cRes.json();
        setCustomers(json.customers);
        if (json.customers.length > 0) setSelectedCustomerId(json.customers[0].id);
      }
      if (plRes.ok) {
        const json = await plRes.json();
        setPlans(json.plans);
        if (json.plans.length > 0) setSelectedPlanId(json.plans[0].id);
      }
      if (prRes.ok) {
        const json = await prRes.json();
        setProducts(json.products);
        if (json.products.length > 0) {
          setFormLines([
            {
              productId: json.products[0].id,
              quantity: 1,
              unitPriceCents: json.products[0].salesPriceCents,
            },
          ]);
        }
      }
      if (tRes.ok) {
        const json = await tRes.json();
        setTaxRules(json.taxRules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setStartDate(new Date().toISOString().split('T')[0]);
    loadData();
    loadDependencies();
  }, []);

  const handleTransition = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/transition`, {
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
      alert('Network error executing transition');
    }
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    setFormLines([
      ...formLines,
      {
        productId: products[0].id,
        quantity: 1,
        unitPriceCents: products[0].salesPriceCents,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setFormLines(formLines.filter((_, i) => i !== idx));
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLines.length === 0) {
      alert('Add at least one line item');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          planId: selectedPlanId,
          startDate: new Date(startDate).toISOString(),
          paymentTermsDays: Number(paymentTermsDays),
          lines: formLines,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to create subscription');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setMessage(`Subscription ${json.subscription.number} created successfully.`);
      await loadData();
    } catch {
      alert('Network error creating subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const numMatch = s.number.toLowerCase().includes(q);
      const nameMatch = `${s.customer.firstName} ${s.customer.lastName}`.toLowerCase().includes(q);
      const companyMatch = s.customer.company?.toLowerCase().includes(q);
      if (!numMatch && !nameMatch && !companyMatch) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'ACTIVE') return 'badge badge-success';
    if (s === 'CONFIRMED' || s === 'QUOTATION') return 'badge badge-info';
    if (s === 'PAUSED') return 'badge badge-warning';
    if (s === 'CLOSED') return 'badge badge-danger';
    return 'badge badge-neutral';
  };

  return (
    <AppShell allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Subscriptions
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage client subscription lifecycles, plans, contracts, and state transitions.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <span>+</span>
            <span>New Subscription</span>
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-xs text-blue-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
              placeholder="Search by #, client..."
              className="input text-xs w-full py-1.5"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Plan & Interval</th>
                  <th>Start Date</th>
                  <th>Next Billing</th>
                  <th>Status</th>
                  <th>Line Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                      No subscriptions found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const lineTotal = sub.lines.reduce((acc, l) => acc + l.quantity * l.unitPriceCents, 0);

                    return (
                      <tr key={sub.id}>
                        <td className="font-mono text-xs font-bold text-blue-400">
                          {sub.number}
                        </td>
                        <td className="text-xs">
                          <div className="font-semibold text-white">
                            {sub.customer.company || `${sub.customer.firstName} ${sub.customer.lastName}`}
                          </div>
                          <div className="text-slate-400 text-[11px]">{sub.customer.email}</div>
                        </td>
                        <td className="text-xs">
                          <div className="font-medium text-slate-200">{sub.plan.name}</div>
                          <div className="text-slate-400 text-[11px] uppercase tracking-wider">
                            {sub.plan.billingPeriod}
                          </div>
                        </td>
                        <td className="text-xs text-slate-400">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                        <td className="text-xs text-slate-300">
                          {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span className={getStatusBadge(sub.status)}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="text-xs font-semibold text-white">
                          {formatMoney(lineTotal)}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status === 'DRAFT' && (
                              <button
                                onClick={() => handleTransition(sub.id, 'submit_quotation')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30"
                              >
                                Send Quote
                              </button>
                            )}

                            {sub.status === 'QUOTATION' && (
                              <button
                                onClick={() => handleTransition(sub.id, 'confirm')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30"
                              >
                                Confirm
                              </button>
                            )}

                            {sub.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleTransition(sub.id, 'activate')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30"
                              >
                                Activate
                              </button>
                            )}

                            {sub.status === 'ACTIVE' && (
                              <>
                                {sub.plan.pausable && (
                                  <button
                                    onClick={() => handleTransition(sub.id, 'pause')}
                                    className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30"
                                  >
                                    Pause
                                  </button>
                                )}
                                {sub.plan.closableEarly && (
                                  <button
                                    onClick={() => handleTransition(sub.id, 'close')}
                                    className="px-2 py-1 rounded text-[11px] font-semibold bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30"
                                  >
                                    Close
                                  </button>
                                )}
                              </>
                            )}

                            {sub.status === 'PAUSED' && (
                              <button
                                onClick={() => handleTransition(sub.id, 'resume')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30"
                              >
                                Resume
                              </button>
                            )}

                            {sub.status === 'CLOSED' && (
                              <span className="text-[11px] text-slate-500 italic">Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Subscription */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">Create New Subscription</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Customer
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="input w-full"
                      required
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company ? `${c.company} (${c.firstName})` : `${c.firstName} ${c.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Subscription Plan
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="input w-full"
                      required
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatMoney(p.priceCents)} / {p.billingPeriod.toLowerCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Payment Terms (Days)
                    </label>
                    <input
                      type="number"
                      value={paymentTermsDays}
                      onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                      min={1}
                      max={365}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Subscription Line Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formLines.map((line, idx) => {
                      const currentProduct = products.find((p) => p.id === line.productId);

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3"
                        >
                          <div className="flex-1">
                            <select
                              value={line.productId}
                              onChange={(e) => {
                                const newProd = products.find((p) => p.id === e.target.value);
                                const updated = [...formLines];
                                updated[idx] = {
                                  ...updated[idx],
                                  productId: e.target.value,
                                  variantId: undefined,
                                  unitPriceCents: newProd?.salesPriceCents || 0,
                                };
                                setFormLines(updated);
                              }}
                              className="input text-xs w-full"
                            >
                              {products.map((pr) => (
                                <option key={pr.id} value={pr.id}>
                                  {pr.name} ({formatMoney(pr.salesPriceCents)})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Variant dropdown if product has variants */}
                          {currentProduct && currentProduct.attributes.length > 0 && (
                            <div className="w-36">
                              <select
                                value={line.variantId || ''}
                                onChange={(e) => {
                                  const updated = [...formLines];
                                  const vId = e.target.value || undefined;
                                  const vObj = currentProduct.attributes
                                    .flatMap((a) => a.variants)
                                    .find((v) => v.id === vId);
                                  const extra = vObj?.extraPriceCents || 0;
                                  updated[idx] = {
                                    ...updated[idx],
                                    variantId: vId,
                                    unitPriceCents: currentProduct.salesPriceCents + extra,
                                  };
                                  setFormLines(updated);
                                }}
                                className="input text-xs w-full"
                              >
                                <option value="">Base Variant</option>
                                {currentProduct.attributes.flatMap((a) =>
                                  a.variants.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.value} (+{formatMoney(v.extraPriceCents)})
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                          )}

                          <div className="w-20">
                            <input
                              type="number"
                              min={1}
                              value={line.quantity}
                              onChange={(e) => {
                                const updated = [...formLines];
                                updated[idx] = {
                                  ...updated[idx],
                                  quantity: Number(e.target.value),
                                };
                                setFormLines(updated);
                              }}
                              placeholder="Qty"
                              className="input text-xs w-full text-center"
                            />
                          </div>

                          <div className="w-24 text-right text-xs font-semibold text-white">
                            {formatMoney(line.quantity * line.unitPriceCents)}
                          </div>

                          {formLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-red-400 hover:text-red-300 text-xs px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary text-xs font-medium"
                  >
                    {submitting ? 'Creating...' : 'Create Subscription'}
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
