'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to process request');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 text-xl">
            🔑
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Forgot Password
          </h1>
          <p className="text-sm text-slate-400">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm text-center space-y-3">
            <p className="font-semibold text-emerald-400">Check your inbox</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              If an account with <strong>{email}</strong> exists, we have sent a secure password reset link. In development console mode, the link is logged to the server logs.
            </p>
            <div className="pt-2">
              <Link href="/signin" className="btn btn-outline text-xs px-4 py-1.5 inline-block">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 mt-2 flex items-center justify-center font-medium shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link href="/signin" className="text-xs text-slate-400 hover:text-white transition-colors">
                ← Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
