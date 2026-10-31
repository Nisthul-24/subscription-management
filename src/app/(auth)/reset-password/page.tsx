'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Requirements
  const hasMinLength = password.length >= 9;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet complexity requirements');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">Password Updated!</h2>
        <p className="text-sm text-slate-300">
          Your password has been securely reset. You can now log into your account.
        </p>
        <div className="pt-2">
          <Link href="/signin" className="btn btn-primary w-full py-2.5 inline-block text-center font-medium">
            Sign In with New Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          New Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="input w-full"
        />

        <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span>{hasMinLength ? '✓' : '○'}</span>
              <span>≥ 9 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span>{hasUpper ? '✓' : '○'}</span>
              <span>1 uppercase</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span>{hasLower ? '✓' : '○'}</span>
              <span>1 lowercase</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span>{hasSpecial ? '✓' : '○'}</span>
              <span>1 special char</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Confirm New Password
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          className="input w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !isPasswordValid || password !== confirmPassword}
        className="btn btn-primary w-full py-2.5 mt-2 flex items-center justify-center font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50"
      >
        {loading ? 'Updating password...' : 'Update Password'}
      </button>

      <div className="text-center pt-2">
        <Link href="/signin" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Cancel and Return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25 mb-3 text-xl font-black text-white">
            B
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Choose New Password
          </h1>
          <p className="text-sm text-slate-400">
            Create a strong, unique password for your Brightloop account.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-400 py-8">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
