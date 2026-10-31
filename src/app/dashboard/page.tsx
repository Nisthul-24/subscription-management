'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';

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
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Revenue & Subscription Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live operational metrics, automated recurring billing, and cashflow health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBilling}
              disabled={billingRunning}
              className="btn btn-primary flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              {billingRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Invoices...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Run Billing Engine</span>
                </>
              )}
            </button>

            <a
              href="/api/reports/export?type=invoices"
              className="btn btn-secondary text-sm font-medium flex items-center gap-2"
              download
            >
              <span>📥</span>
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {billingMessage && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span>🔔</span>
              <span>{billingMessage}</span>
            </div>
            <button
              onClick={() => setBillingMessage('')}
              className="text-xs text-blue-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading || !data ? (
          <div className="py-24 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <span>Loading dashboard analytics...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* MRR Card */}
              <div className="card p-5 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>MRR (Normalized)</span>
                  <span className="text-blue-400 text-base">📈</span>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {formatMoney(data.kpis.mrrCents)}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <span className="text-emerald-400 font-medium">Monthly Recurring</span>
                </div>
              </div>

              {/* Active Subscriptions */}
              <div className="card p-5 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Active Subscriptions</span>
                  <span className="text-emerald-400 text-base">🔄</span>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {data.kpis.activeSubsCount}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  <Link href="/subscriptions?status=ACTIVE" className="text-blue-400 hover:underline">
                    View active subs →
                  </Link>
                </div>
              </div>

              {/* Total Revenue Received */}
              <div className="card p-5 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Cash Collected</span>
                  <span className="text-purple-400 text-base">💰</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400">
                  {formatMoney(data.kpis.totalRevenueCents)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Sum of recorded payments
                </div>
              </div>

              {/* Outstanding Receivables */}
              <div className="card p-5 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Outstanding Due</span>
                  <span className="text-amber-400 text-base">⏳</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-300">
                  {formatMoney(data.kpis.outstandingCents)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Unpaid invoice balance
                </div>
              </div>

              {/* Overdue Count */}
              <div className="card p-5 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Overdue Invoices</span>
                  <span className="text-red-400 text-base">⚠️</span>
                </div>
                <div className="text-2xl font-extrabold text-red-400">
                  {data.kpis.overdueCount}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  <Link href="/invoices?overdue=true" className="text-red-400 hover:underline">
                    Filter overdue →
                  </Link>
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Bars */}
              <div className="card p-6 border-slate-800 lg:col-span-2">
                <h3 className="text-base font-bold text-white mb-1">Monthly Revenue Trend</h3>
                <p className="text-xs text-slate-400 mb-6">Cash payments collected over the last 6 months</p>

                <div className="h-64 flex items-end gap-6 pt-6 border-b border-slate-800">
                  {data.monthlyRevenue.map((item, idx) => {
                    const maxRev = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 100);
                    const heightPercent = Math.max(8, Math.round((item.revenue / maxRev) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-xs font-semibold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          ${item.revenue.toFixed(0)}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-md shadow-blue-500/10 min-h-[12px]"
                        />
                        <div className="text-xs font-medium text-slate-400 text-center whitespace-nowrap">
                          {item.month.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="card p-6 border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">Payment Methods</h3>
                <p className="text-xs text-slate-400 mb-6">Distribution across payment channels</p>

                {data.paymentMethods.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    No payment records yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.paymentMethods.map((pm, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-300">{pm.method}</span>
                          <span className="font-semibold text-white">${pm.total.toFixed(2)} ({pm.count})</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(10, (pm.total / (data.kpis.totalRevenueCents / 100 || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <div className="card border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Recent Invoices</h3>
                  <Link href="/invoices" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                    View all invoices →
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
                          <tr key={inv.id}>
                            <td className="font-mono text-xs font-semibold text-blue-400">
                              <Link href={`/invoices`} className="hover:underline">
                                {inv.number}
                              </Link>
                            </td>
                            <td className="text-xs text-slate-300 font-medium">
                              {inv.customer.company || `${inv.customer.firstName} ${inv.customer.lastName}`}
                            </td>
                            <td className="text-xs font-semibold text-white">
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
              <div className="card border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Recent Subscriptions</h3>
                  <Link href="/subscriptions" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                    View all subscriptions →
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
                          <tr key={sub.id}>
                            <td className="font-mono text-xs font-semibold text-blue-400">
                              <Link href={`/subscriptions`} className="hover:underline">
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
