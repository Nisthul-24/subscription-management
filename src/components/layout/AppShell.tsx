'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import type { Role } from '@/lib/types';
import { MenuIcon, BellIcon } from '@/components/ui/Icons';
import ThemeToggle from '@/components/ui/ThemeToggle';
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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-muted gap-4 p-4 antialiased">
        <div className="relative p-6 rounded-2xl bg-surface border border-border shadow-md flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-ink shadow-sm flex items-center justify-center font-black text-xl animate-pulse">
            B
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-ink">
            <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span>Authenticating workspace session...</span>
          </div>
        </div>
      </div>
    );
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const currentTitle = pathSegments.length > 0
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ')
    : 'Dashboard';

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-pill-admin';
      case 'STAFF':
        return 'role-pill-staff';
      case 'CUSTOMER':
        return 'role-pill-customer';
      default:
        return 'bg-bg text-muted border-border';
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        user={user}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-surface px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-muted hover:text-ink hover:bg-bg border border-transparent hover:border-border lg:hidden"
              aria-label="Open sidebar"
            >
              <MenuIcon size={20} />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs">
              <Link href={user.role === 'CUSTOMER' ? '/portal/subscriptions' : '/dashboard'} className="font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors">
                Workspace
              </Link>
              <span className="text-border">/</span>
              <span className="font-semibold text-ink capitalize bg-bg px-2.5 py-1 rounded-lg border border-border">
                {currentTitle}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live status beacon */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg border border-border text-xs text-muted">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-[11px] font-medium text-ink">Live Sync</span>
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Notification indicator */}
            <button
              className="relative p-2 rounded-xl text-muted hover:text-ink hover:bg-bg border border-border transition-colors"
              title="Notifications"
            >
              <BellIcon size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-ink flex items-center justify-center font-bold text-xs shadow-sm">
                {`${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-ink">
                  {user.firstName} {user.lastName}
                </div>
                <div className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full inline-block border mt-0.5 ${getRoleBadgeClass(user.role)}`}>
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
