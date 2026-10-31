'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import type { Role } from '@/lib/types';
import { MenuIcon, BellIcon, SearchIcon, SparklesIcon } from '@/components/ui/Icons';
import Link from 'next/link';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4 p-4 selection:bg-blue-600 selection:text-white">
        {/* Glow backdrop */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 flex items-center justify-center font-black text-white text-xl animate-pulse">
            B
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
            <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span>Authenticating workspace session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Format breadcrumb title
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentTitle = pathSegments.length > 0
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ')
    : 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-600 selection:text-white antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        user={user}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area - with lg:pl-64 to match fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <MenuIcon size={20} />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs">
              <Link href={user.role === 'CUSTOMER' ? '/portal/subscriptions' : '/dashboard'} className="font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors">
                Workspace
              </Link>
              <span className="text-slate-600">/</span>
              <span className="font-semibold text-slate-100 capitalize bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/60">
                {currentTitle}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick status beacon */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-slate-300">Live Sync</span>
            </div>

            {/* Notification indicator */}
            <button
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/60 transition-colors"
              title="Notifications"
            >
              <BellIcon size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20">
                {`${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
