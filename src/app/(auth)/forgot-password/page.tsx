'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

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
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="p-8 rounded-3xl bg-surface border border-border shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-3 text-xl">
              🔑
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mb-1">
              Forgot Password
            </h1>
            <p className="text-sm text-muted">
              Enter your email and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm text-center space-y-3">
              <p className="font-semibold text-success">Check your inbox</p>
              <p className="text-muted text-xs leading-relaxed">
                If an account with <strong>{email}</strong> exists, we have sent a secure password reset link. In development console mode, the link is logged to the server logs.
              </p>
              <div className="pt-2">
                <Link href="/signin" className="btn btn-secondary text-xs px-4 py-1.5 inline-block">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
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
                className="btn btn-primary w-full py-2.5 mt-2 flex items-center justify-center font-medium"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link href="/signin" className="text-xs text-muted hover:text-ink transition-colors">
                  ← Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
