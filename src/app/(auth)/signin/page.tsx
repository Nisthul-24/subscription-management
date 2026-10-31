'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SparklesIcon, LightningIcon } from '@/components/ui/Icons';
import ThemeToggle from '@/components/ui/ThemeToggle';

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
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="p-8 rounded-3xl bg-surface border border-border shadow-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-ink shadow-sm mb-4 text-2xl font-black group-hover:opacity-90 transition-opacity">
              B
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-ink mb-1.5">
              Welcome to Brightloop
            </h1>
            <p className="text-xs text-muted">
              Enterprise Subscription & Recurring Revenue Engine
            </p>
          </div>

          {/* Quick 1-Click Demo Logins */}
          <div className="mb-6 p-3.5 rounded-2xl bg-bg border border-border">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <SparklesIcon size={13} className="text-accent" />
                Quick Demo Auto-Fill
              </span>
              <span className="text-[10px] text-muted">Pick role</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin', 'admin@brightloop.dev', 'Admin@123!')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  activeDemo === 'admin'
                    ? 'bg-accent text-accent-ink border-accent font-bold shadow-sm'
                    : 'role-pill-admin'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff', 'staff@brightloop.dev', 'Staff@123!')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  activeDemo === 'staff'
                    ? 'bg-primary text-primary-ink border-primary font-bold shadow-sm'
                    : 'role-pill-staff'
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillDemo('customer', 'customer@brightloop.dev', 'Customer@123!')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  activeDemo === 'customer'
                    ? 'bg-success text-success-ink border-success font-bold shadow-sm'
                    : 'role-pill-customer'
                }`}
              >
                Customer
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@brightloop.dev"
                className="input w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline transition-colors"
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
                  className="input w-full pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs px-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-ink/30 border-t-primary-ink rounded-full animate-spin" />
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

          <div className="mt-6 text-center text-xs text-muted">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
