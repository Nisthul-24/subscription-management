'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface UserItem {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  company?: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Requirements
  const hasMinLength = password.length >= 9;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      alert('Password must satisfy all complexity requirements');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          phone,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPhone('');
        await loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch {
      alert('Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (r: string) => {
    if (r === 'ADMIN') return 'badge badge-danger';
    if (r === 'STAFF') return 'badge badge-accent';
    return 'badge badge-neutral';
  };

  return (
    <AppShell allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              User & Role Management
            </h1>
            <p className="text-sm text-muted mt-1">
              Administer team accounts, assign staff permissions, and review audit accesses.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Create Staff User</span>
          </button>
        </div>

        <div className="card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Organization</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted text-xs">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="text-xs font-semibold text-ink">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="text-xs font-mono text-primary">
                        {u.email}
                      </td>
                      <td>
                        <span className={getRoleBadge(u.role)}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {u.phone || '—'}
                      </td>
                      <td className="text-xs text-ink">
                        {u.company || 'Brightloop'}
                      </td>
                      <td className="text-xs text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Staff User */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <h3 className="text-base font-bold text-ink">Create Staff Member</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-ink">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Sarah"
                      className="input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Chen"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@brightloop.dev"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'STAFF' | 'ADMIN')}
                      className="input w-full text-xs"
                    >
                      <option value="STAFF">Staff (Operations)</option>
                      <option value="ADMIN">Admin (Full Control)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0150"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input w-full text-xs"
                  />

                  <div className="mt-2.5 p-2.5 rounded-lg bg-bg border border-border text-[11px] grid grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1 ${hasMinLength ? 'text-success' : 'text-muted'}`}>
                      <span>{hasMinLength ? '✓' : '○'}</span>
                      <span>≥ 9 chars</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasUpper ? 'text-success' : 'text-muted'}`}>
                      <span>{hasUpper ? '✓' : '○'}</span>
                      <span>1 uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasLower ? 'text-success' : 'text-muted'}`}>
                      <span>{hasLower ? '✓' : '○'}</span>
                      <span>1 lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasSpecial ? 'text-success' : 'text-muted'}`}>
                      <span>{hasSpecial ? '✓' : '○'}</span>
                      <span>1 special</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting || !isPasswordValid}
                    className="btn btn-primary text-xs font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Account'}
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
