'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SparklesIcon, LightningIcon } from '@/components/ui/Icons';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState('');

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

  const fillDemo = (role: string, roleEmail: string, rolePass: string) => {
    setActiveDemo(role);
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="p-8 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-xl shadow-blue-500/30 mb-4 text-2xl font-black text-white hover:scale-105 transition-transform">
              B
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
              Welcome to Brightloop
            </h1>
            <p className="text-xs text-slate-400">
              Enterprise Subscription & Recurring Revenue Engine
            </p>
          </div>

          {/* Quick 1-Click Demo Logins */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <SparklesIcon size={13} className="text-amber-400" />
                Quick Demo Auto-Fill
              </span>
              <span className="text-[10px] text-slate-500">Pick role</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin', 'admin@brightloop.dev', 'Admin@123!')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  activeDemo === 'admin'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                    : 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff', 'staff@brightloop.dev', 'Staff@123!')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  activeDemo === 'staff'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillDemo('customer', 'customer@brightloop.dev', 'Customer@123!')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  activeDemo === 'customer'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
                }`}
              >
                Customer
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-shake">
              <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@brightloop.dev"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LightningIcon size={16} />
                  <span>Sign In to Workspace</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
