'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import type { Role } from '@/lib/types';

interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

interface AppShellProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function AppShell({ children, allowedRoles }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push(`/signin?from=${encodeURIComponent(pathname)}`);
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        if (allowedRoles && !allowedRoles.includes(data.user.role)) {
          // If customer tries to access admin or vice versa, redirect appropriately
          if (data.user.role === 'CUSTOMER') {
            router.push('/portal/subscriptions');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch {
        router.push('/signin');
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, pathname, allowedRoles]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/signin');
      router.refresh();
    } catch {
      router.push('/signin');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Authenticating session...</span>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-950 flex">
      {/* Sidebar navigation */}
      <Sidebar user={user} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <div className="app-content flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-medium text-slate-200 capitalize">
              {pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{user.role}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {user.email}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
