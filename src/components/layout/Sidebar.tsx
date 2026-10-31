'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/types';
import {
  DashboardIcon,
  UsersIcon,
  SubscriptionsIcon,
  QuotationIcon,
  InvoicesIcon,
  PaymentsIcon,
  ProductsIcon,
  PlansIcon,
  TaxRulesIcon,
  DiscountIcon,
  UsersKeyIcon,
  LogOutIcon,
  CloseIcon,
  SparklesIcon,
} from '@/components/ui/Icons';

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    role: Role;
    email: string;
  };
  onSignOut: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: Role[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon, roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Sales & Growth',
    items: [
      { label: 'Customers', href: '/customers', icon: UsersIcon, roles: ['ADMIN', 'STAFF'] },
      { label: 'Subscriptions', href: '/subscriptions', icon: SubscriptionsIcon, roles: ['ADMIN', 'STAFF'] },
      { label: 'Quotation Templates', href: '/quotation-templates', icon: QuotationIcon, roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Billing & Cash',
    items: [
      { label: 'Invoices', href: '/invoices', icon: InvoicesIcon, roles: ['ADMIN', 'STAFF'] },
      { label: 'Payments', href: '/payments', icon: PaymentsIcon, roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Products', href: '/products', icon: ProductsIcon, roles: ['ADMIN'] },
      { label: 'Plans', href: '/plans', icon: PlansIcon, roles: ['ADMIN'] },
      { label: 'Tax Rules', href: '/tax-rules', icon: TaxRulesIcon, roles: ['ADMIN'] },
      { label: 'Discount Rules', href: '/discount-rules', icon: DiscountIcon, roles: ['ADMIN'] },
      { label: 'Users & Access', href: '/users', icon: UsersKeyIcon, roles: ['ADMIN'] },
    ],
  },
];

const portalSections: NavSection[] = [
  {
    title: 'Customer Self-Service',
    items: [
      { label: 'My Subscriptions', href: '/portal/subscriptions', icon: SubscriptionsIcon, roles: ['CUSTOMER'] },
      { label: 'My Invoices', href: '/portal/invoices', icon: InvoicesIcon, roles: ['CUSTOMER'] },
    ],
  },
];

export default function Sidebar({ user, onSignOut, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sections = user.role === 'CUSTOMER' ? portalSections : navSections;

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`.toUpperCase();

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30';
      case 'STAFF':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30';
      case 'CUSTOMER':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <Link href={user.role === 'CUSTOMER' ? '/portal/subscriptions' : '/dashboard'} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-md shadow-blue-500/25 flex items-center justify-center font-black text-white text-base tracking-wider group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                Brightloop
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Pro
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Billing & Subscription
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {section.title}
              </div>
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-white border-l-2 border-blue-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/50'
                        }`}
                      >
                        <IconComponent size={18} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Quick Info Box in Admin/Staff */}
          {user.role !== 'CUSTOMER' && (
            <div className="mx-1 p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <SparklesIcon size={14} className="text-amber-400" />
                <span>Automated Billing</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Catch-up intervals and gap-free numbering are active.
              </p>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60 flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20 shrink-0">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOutIcon size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
