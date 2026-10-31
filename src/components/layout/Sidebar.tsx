'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/types';

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    role: Role;
    email: string;
  };
  onSignOut: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Customers', href: '/customers', icon: '👥', roles: ['ADMIN', 'STAFF'] },
      { label: 'Subscriptions', href: '/subscriptions', icon: '🔄', roles: ['ADMIN', 'STAFF'] },
      { label: 'Quotation Templates', href: '/quotation-templates', icon: '📋', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Billing',
    items: [
      { label: 'Invoices', href: '/invoices', icon: '📄', roles: ['ADMIN', 'STAFF'] },
      { label: 'Payments', href: '/payments', icon: '💳', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Products', href: '/products', icon: '📦', roles: ['ADMIN'] },
      { label: 'Plans', href: '/plans', icon: '📐', roles: ['ADMIN'] },
      { label: 'Tax Rules', href: '/tax-rules', icon: '🏛️', roles: ['ADMIN'] },
      { label: 'Discount Rules', href: '/discount-rules', icon: '🏷️', roles: ['ADMIN'] },
      { label: 'Users', href: '/users', icon: '🔑', roles: ['ADMIN'] },
    ],
  },
];

const portalSections: NavSection[] = [
  {
    title: 'My Account',
    items: [
      { label: 'My Subscriptions', href: '/portal/subscriptions', icon: '🔄', roles: ['CUSTOMER'] },
      { label: 'My Invoices', href: '/portal/invoices', icon: '📄', roles: ['CUSTOMER'] },
    ],
  },
];

export default function Sidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const sections = user.role === 'CUSTOMER' ? portalSections : navSections;

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">B</div>
        <span className="sidebar-logo-text">Brightloop</span>
      </div>

      <nav>
        {filteredSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user.firstName} {user.lastName}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="btn btn-ghost w-full mt-2"
          style={{ justifyContent: 'center', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
