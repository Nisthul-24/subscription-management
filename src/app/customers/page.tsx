'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';

interface CustomerItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  _count: {
    subscriptions: number;
    invoices: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell allowedRoles={['ADMIN', 'STAFF']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Customer Accounts
            </h1>
            <p className="text-sm text-muted mt-1">
              Active clients, subscriber directory, and linked contract portfolios.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, company, email..."
              className="input w-full text-xs"
            />
          </div>
        </div>

        <div className="card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subscriptions</th>
                  <th>Invoices</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted text-xs">
                      Loading customer accounts...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted text-xs">
                      No customers found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id}>
                      <td className="text-xs font-semibold text-ink">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="text-xs text-ink font-medium">
                        {c.company || '—'}
                      </td>
                      <td className="text-xs text-primary font-mono">
                        {c.email}
                      </td>
                      <td className="text-xs text-muted">
                        {c.phone || '—'}
                      </td>
                      <td className="text-xs font-semibold text-ink">
                        <Link
                          href={`/subscriptions?customerId=${c.id}`}
                          className="hover:underline text-primary"
                        >
                          {c._count.subscriptions} active
                        </Link>
                      </td>
                      <td className="text-xs font-semibold text-ink">
                        <Link
                          href={`/invoices?customerId=${c.id}`}
                          className="hover:underline text-primary"
                        >
                          {c._count.invoices} records
                        </Link>
                      </td>
                      <td className="text-xs text-muted">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/subscriptions?customerId=${c.id}`}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-surface text-ink hover:text-ink hover:bg-border"
                        >
                          View Contracts →
                        </Link>
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
