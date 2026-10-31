'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import {
  SubscriptionsIcon,
  InvoicesIcon,
  PaymentsIcon,
  LightningIcon,
  SparklesIcon,
} from '@/components/ui/Icons';

interface DashboardData {
  kpis: {
    activeSubsCount: number;
    mrrCents: number;
    totalRevenueCents: number;
    outstandingCents: number;
    overdueCount: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number; invoicesCount: number }>;
  paymentMethods: Array<{ method: string; total: number; count: number }>;
  recentInvoices: Array<{
    id: string;
    number: string;
    totalCents: number;
    status: string;
    dueDate: string;
    customer: { firstName: string; lastName: string; company?: string | null };
  }>;
  recentSubscriptions: Array<{
    id: string;
    number: string;
    status: string;
    startDate: string;
    plan: { name: string; billingPeriod: string };
    customer: { firstName: string; lastName: string; company?: string | null };
  }>;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingMessage, setBillingMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBilling = async () => {
    setBillingRunning(true);
    setBillingMessage('');
    try {
      const res = await fetch('/api/admin/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });
      const result = await res.json();
      setBillingMessage(result.message || 'Billing cycle execution finished.');
      await loadData();
    } catch {
      setBillingMessage('Error running billing cycle.');
    } finally {
      setBillingRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'ACTIVE' || s === 'PAID') return 'badge badge-success';
    if (s === 'CONFIRMED' || s === 'QUOTATION') return 'badge badge-info';
    if (s === 'PAUSED') return 'badge badge-warning';
    if (s === 'CLOSED' || s === 'CANCELLED') return 'badge badge-danger';
    return 'badge badge-neutral';
  };

  return (
    <AppShell allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
                <SparklesIcon size={16} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Operational Overview
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Revenue & Subscription Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live recurring revenue metrics, automated catch-up billing, and cashflow analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBilling}
              disabled={billingRunning}
              className="btn btn-primary flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {billingRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Cycle...</span>
                </>
              ) : (
                <>
                  <LightningIcon size={16} />
                  <span>Run Billing Engine</span>
                </>
              )}
            </button>

            <a
              href="/api/reports/export?type=invoices"
              className="btn btn-secondary text-xs sm:text-sm font-medium flex items-center gap-2 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
              download
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {billingMessage && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-blue-900/40 border border-blue-500/30 text-blue-200 text-xs sm:text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <LightningIcon size={16} />
              </span>
              <span className="font-medium">{billingMessage}</span>
            </div>
            <button
              onClick={() => setBillingMessage('')}
              className="text-xs text-blue-300 hover:text-white px-2 py-1 rounded-md hover:bg-blue-500/20"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading || !data ? (
          <div className="py-24 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs font-medium">Computing subscription intelligence...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* MRR Card */}
              <div className="card p-5 border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-blue-500/40 transition-all group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>MRR (Normalized)</span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <SubscriptionsIcon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {formatMoney(data.kpis.mrrCents)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400">Monthly Recurring</span>
                </div>
              </div>

              {/* Active Subscriptions */}
              <div className="card p-5 border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-emerald-500/40 transition-all group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>Active Subscriptions</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <SubscriptionsIcon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {data.kpis.activeSubsCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  <Link href="/subscriptions?status=ACTIVE" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                    <span>View active</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Cash Collected */}
              <div className="card p-5 border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-indigo-500/40 transition-all group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>Cash Collected</span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                    <PaymentsIcon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 tracking-tight">
                  {formatMoney(data.kpis.totalRevenueCents)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  Recorded payment total
                </div>
              </div>

              {/* Outstanding Receivables */}
              <div className="card p-5 border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-amber-500/40 transition-all group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>Outstanding Due</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                    <InvoicesIcon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-300 tracking-tight">
                  {formatMoney(data.kpis.outstandingCents)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  Unpaid invoice balance
                </div>
              </div>

              {/* Overdue Count */}
              <div className="card p-5 border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-red-500/40 transition-all group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>Overdue Invoices</span>
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-black text-red-400 tracking-tight">
                  {data.kpis.overdueCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  <Link href="/invoices" className="text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1">
                    <span>Inspect invoices</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Bars */}
              <div className="card p-6 border-slate-800/80 lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-white">Monthly Revenue Trend</h3>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                    6-Month Trajectory
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Historical cash payments collected per billing cycle</p>

                <div className="h-64 flex items-end gap-4 sm:gap-6 pt-6 border-b border-slate-800/80">
                  {data.monthlyRevenue.map((item, idx) => {
                    const maxRev = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 100);
                    const heightPercent = Math.max(8, Math.round((item.revenue / maxRev) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[11px] font-bold text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          ${item.revenue.toFixed(0)}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 via-indigo-600 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-300 transition-all shadow-lg shadow-blue-500/10 min-h-[14px]"
                        />
                        <div className="text-[11px] font-semibold text-slate-400 text-center whitespace-nowrap">
                          {item.month.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="card p-6 border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-white">Payment Methods</h3>
                  <span className="text-[11px] font-semibold text-slate-400">Distribution</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Settlement channel volume breakdown</p>

                {data.paymentMethods.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    No payment records yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.paymentMethods.map((pm, idx) => {
                      const totalRev = data.kpis.totalRevenueCents / 100 || 1;
                      const percent = Math.min(100, Math.max(8, Math.round((pm.total / totalRev) * 100)));

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-300">{pm.method.replace('_', ' ')}</span>
                            <span className="font-semibold text-white">
                              ${pm.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              <span className="text-slate-500 font-normal ml-1">({pm.count})</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <div className="card border-slate-800/80 overflow-hidden p-0">
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <InvoicesIcon size={16} className="text-blue-400" />
                    <h3 className="font-bold text-white text-sm sm:text-base">Recent Invoices</h3>
                  </div>
                  <Link href="/invoices" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <span>View all</span>
                    <span>→</span>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-500 text-xs">
                            No invoices generated yet. Click &apos;Run Billing Engine&apos; above!
                          </td>
                        </tr>
                      ) : (
                        data.recentInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="font-mono text-xs font-bold text-blue-400">
                              <Link href="/invoices" className="hover:underline">
                                {inv.number}
                              </Link>
                            </td>
                            <td className="text-xs text-slate-300 font-medium">
                              {inv.customer.company || `${inv.customer.firstName} ${inv.customer.lastName}`}
                            </td>
                            <td className="text-xs font-bold text-white">
                              {formatMoney(inv.totalCents)}
                            </td>
                            <td>
                              <span className={getStatusBadge(inv.status)}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Subscriptions */}
              <div className="card border-slate-800/80 overflow-hidden p-0">
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <SubscriptionsIcon size={16} className="text-emerald-400" />
                    <h3 className="font-bold text-white text-sm sm:text-base">Recent Subscriptions</h3>
                  </div>
                  <Link href="/subscriptions" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <span>View all</span>
                    <span>→</span>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Subscription</th>
                        <th>Customer</th>
                        <th>Plan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentSubscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-500 text-xs">
                            No subscriptions created yet.
                          </td>
                        </tr>
                      ) : (
                        data.recentSubscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="font-mono text-xs font-bold text-blue-400">
                              <Link href="/subscriptions" className="hover:underline">
                                {sub.number}
                              </Link>
                            </td>
                            <td className="text-xs text-slate-300 font-medium">
                              {sub.customer.company || `${sub.customer.firstName} ${sub.customer.lastName}`}
                            </td>
                            <td className="text-xs text-slate-400">
                              {sub.plan.name}
                            </td>
                            <td>
                              <span className={getStatusBadge(sub.status)}>
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
