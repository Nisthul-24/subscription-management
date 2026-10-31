'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to sign in');
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected network error occurred');
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25 mb-4 text-2xl font-black text-white">
            B
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Welcome to Brightloop
          </h1>
          <p className="text-sm text-slate-400">
            Subscription, Billing & Revenue Management
          </p>
        </div>

        {/* Quick Demo Logins */}
        <div className="mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Instant Demo Fill
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@brightloop.dev', 'Admin@123!')}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-colors border border-blue-500/30"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('staff@brightloop.dev', 'Staff@123!')}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition-colors border border-emerald-500/30"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemo('customer@brightloop.dev', 'Customer@123!')}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors border border-purple-500/30"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="input w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 mt-2 flex items-center justify-center font-medium shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
