import Link from 'next/link';
import {
  DashboardIcon,
  SubscriptionsIcon,
  InvoicesIcon,
  PaymentsIcon,
  SparklesIcon,
  LightningIcon,
} from '@/components/ui/Icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-10 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-lg shadow-blue-500/25 flex items-center justify-center font-black text-white text-lg group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Brightloop
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  v1.0
                </span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/signin"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-900/80 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span>Next-Generation Recurring Billing Engine</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400 font-medium">Catch-up & Idempotency</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-white">
          The Complete Operating System for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Subscription Businesses
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal">
          From products and multi-variant pricing to automated idempotent invoice generation, real-time MRR analytics, and client self-service portals.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto">
          <Link
            href="/signin"
            className="btn btn-primary text-sm sm:text-base font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <LightningIcon size={18} />
            <span>Launch Live Dashboard</span>
          </Link>
          <Link
            href="/signup"
            className="btn btn-secondary text-sm sm:text-base font-semibold px-8 py-3.5 rounded-xl w-full sm:w-auto hover:bg-slate-800 transition-colors"
          >
            Create Customer Account
          </Link>
        </div>

        {/* Demo Quick Launcher Banner */}
        <div className="w-full max-w-2xl p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md mb-16 shadow-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-2">
            <SparklesIcon size={14} className="text-amber-400" />
            <span>Instant Role Simulation (1-Click Test Access)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Link
              href="/signin"
              className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-semibold transition-all flex flex-col items-center gap-1 group"
            >
              <span className="text-white group-hover:text-blue-200">Admin Console</span>
              <span className="text-[10px] text-slate-400">Full system & billing control</span>
            </Link>
            <Link
              href="/signin"
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all flex flex-col items-center gap-1 group"
            >
              <span className="text-white group-hover:text-emerald-200">Staff Portal</span>
              <span className="text-[10px] text-slate-400">Subscriptions & payments</span>
            </Link>
            <Link
              href="/signin"
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-semibold transition-all flex flex-col items-center gap-1 group"
            >
              <span className="text-white group-hover:text-purple-200">Client Self-Service</span>
              <span className="text-[10px] text-slate-400">Invoices & PDF downloads</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="card p-6 border-slate-800/80 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <SubscriptionsIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              Flexible Plans & Lifecycle
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Daily, weekly, monthly, and yearly cadences with strict state-machine controls for pausing, resuming, and auto-closing.
            </p>
          </div>

          <div className="card p-6 border-slate-800/80 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <LightningIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              Automated Catch-up Billing
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Idempotent billing cycles with unique compound key locks. Never double-charge; automatically recovers missed cycles.
            </p>
          </div>

          <div className="card p-6 border-slate-800/80 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <DashboardIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              Real-time MRR & ARR Metrics
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant KPI visibility computing Monthly Recurring Revenue, receivable aging, payment distribution, and CSV reports in sub-seconds.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">B</div>
            <span className="font-semibold text-slate-300">Brightloop Subscription Management</span>
          </div>
          <p>© 2026 Brightloop. Financial arithmetic precision with integer cents & half-up rounding.</p>
        </div>
      </footer>
    </div>
  );
}
