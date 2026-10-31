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
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 w-64 bg-surface border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0">
          <Link href={user.role === 'CUSTOMER' ? '/portal/subscriptions' : '/dashboard'} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-ink shadow-sm flex items-center justify-center font-black text-base tracking-wider group-hover:opacity-90 transition-opacity">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-ink tracking-tight flex items-center gap-1.5">
                Brightloop
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Pro
                </span>
              </span>
              <span className="text-[11px] text-muted font-medium tracking-wide">
                Billing & Subscription
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
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
                        ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold'
                        : 'text-muted hover:text-ink hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'text-primary bg-primary/15'
                            : 'text-muted group-hover:text-ink'
                        }`}
                      >
                        <IconComponent size={18} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Quick Info Box in Admin/Staff */}
          {user.role !== 'CUSTOMER' && (
            <div className="mx-1 p-3.5 rounded-xl bg-bg border border-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-1">
                <SparklesIcon size={14} className="text-accent" />
                <span>Automated Billing</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Catch-up intervals and gap-free numbering are active.
              </p>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-border bg-surface shrink-0">
          <div className="p-2.5 rounded-xl bg-bg border border-border flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-ink flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-surface" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[11px] text-muted font-mono truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRoleBadgeClass(user.role)}`}>
              {user.role}
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-muted hover:text-danger hover:bg-danger/10 rounded-xl border border-transparent hover:border-danger/20 transition-all"
          >
            <LogOutIcon size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
