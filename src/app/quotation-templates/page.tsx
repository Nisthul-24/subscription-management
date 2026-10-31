'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface QuotationTemplate {
  id: string;
  name: string;
  validDays: number;
  plan: { name: string; billingPeriod: string };
  lines: Array<{
    id: string;
    quantity: number;
    unitPriceCents: number;
    product: { name: string };
    variant?: { value: string } | null;
  }>;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotation-templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Quotation Templates
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Pre-configured product bundles and plan tiers to quickly draft subscriptions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              Loading quotation templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              No quotation templates configured yet.
            </div>
          ) : (
            templates.map((tmpl) => {
              const total = tmpl.lines.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0);

              return (
                <div key={tmpl.id} className="card p-6 border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white">{tmpl.name}</h3>
                      <span className="badge badge-info text-[10px]">
                        {tmpl.validDays}d validity
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-4">
                      Plan: <span className="font-semibold text-slate-200">{tmpl.plan.name}</span> ({tmpl.plan.billingPeriod.toLowerCase()})
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Included Products:
                      </div>
                      {tmpl.lines.map((l) => (
                        <div key={l.id} className="flex justify-between text-xs py-1">
                          <span className="text-slate-300">
                            {l.quantity}x {l.product.name}
                            {l.variant && <span className="text-blue-400 ml-1">({l.variant.value})</span>}
                          </span>
                          <span className="font-medium text-white">{formatMoney(l.quantity * l.unitPriceCents)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Bundle Total</div>
                      <div className="text-lg font-extrabold text-blue-400">{formatMoney(total)}</div>
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
