import Link from 'next/link';
import {
  DashboardIcon,
  SubscriptionsIcon,
  LightningIcon,
  SparklesIcon,
} from '@/components/ui/Icons';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col relative overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-ink shadow-sm flex items-center justify-center font-black text-lg group-hover:opacity-90 transition-opacity">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-ink flex items-center gap-2">
                Brightloop
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v1.0
                </span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/signin"
              className="text-xs sm:text-sm font-semibold text-muted hover:text-ink px-3 sm:px-4 py-2 rounded-xl hover:bg-bg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center justify-center text-center">
        {/* Pill banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-primary text-xs font-semibold mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span>Next-Generation Recurring Billing Engine</span>
          <span className="text-border">•</span>
          <span className="text-muted font-medium">Catch-up & Idempotency</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-ink">
          The Complete Operating System for{' '}
          <span className="text-primary">
            Subscription Businesses
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-muted max-w-2xl mb-10 leading-relaxed font-normal">
          From products and multi-variant pricing to automated idempotent invoice generation, real-time MRR analytics, and client self-service portals.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto">
          <Link
            href="/signin"
            className="btn btn-primary text-sm sm:text-base font-semibold px-8 py-3.5 rounded-xl w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <LightningIcon size={18} />
            <span>Launch Live Dashboard</span>
          </Link>
          <Link
            href="/signup"
            className="btn btn-secondary text-sm sm:text-base font-semibold px-8 py-3.5 rounded-xl w-full sm:w-auto"
          >
            Create Customer Account
          </Link>
        </div>

        {/* Demo Quick Launcher Banner */}
        <div className="w-full max-w-2xl p-4 rounded-2xl bg-surface border border-border shadow-md mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center justify-center gap-2">
            <SparklesIcon size={14} className="text-accent" />
            <span>Instant Role Simulation (1-Click Test Access)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Link
              href="/signin"
              className="p-3 rounded-xl role-pill-admin text-xs font-semibold transition-all flex flex-col items-center gap-1 group"
            >
              <span className="font-bold">Admin Console</span>
              <span className="text-[10px] opacity-80">Full system & billing control</span>
            </Link>
            <Link
              href="/signin"
              className="p-3 rounded-xl role-pill-staff text-xs font-semibold transition-all flex flex-col items-center gap-1 group"
            >
              <span className="font-bold">Staff Portal</span>
              <span className="text-[10px] opacity-80">Subscriptions & payments</span>
            </Link>
            <Link
              href="/signin"
              className="p-3 rounded-xl role-pill-customer text-xs font-semibold transition-all flex flex-col items-center gap-1 group"
            >
              <span className="font-bold">Client Self-Service</span>
              <span className="text-[10px] opacity-80">Invoices & PDF downloads</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="card p-6 border-border hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <SubscriptionsIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-ink mb-2">
              Flexible Plans & Lifecycle
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Daily, weekly, monthly, and yearly cadences with strict state-machine controls for pausing, resuming, and auto-closing.
            </p>
          </div>

          <div className="card p-6 border-border hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <LightningIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-ink mb-2">
              Automated Catch-up Billing
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Idempotent billing cycles with unique compound key locks. Never double-charge; automatically recovers missed cycles.
            </p>
          </div>

          <div className="card p-6 border-border hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
              <DashboardIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-ink mb-2">
              Real-time MRR & ARR Metrics
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Instant KPI visibility computing Monthly Recurring Revenue, receivable aging, payment distribution, and CSV reports in sub-seconds.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-surface text-center text-xs text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-primary-ink font-bold text-[10px]">B</div>
            <span className="font-semibold text-ink">Brightloop Subscription Management</span>
          </div>
          <p>© 2026 Brightloop. Financial arithmetic precision with integer cents & half-up rounding.</p>
        </div>
      </footer>
    </div>
  );
}
