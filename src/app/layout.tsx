import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brightloop — Subscription Management',
  description: 'Unified platform for managing subscriptions, invoicing, payments and revenue reporting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
