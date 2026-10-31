import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 flex items-center justify-center font-black text-white text-lg">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Brightloop
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary text-sm font-medium px-4 py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Unified Subscription Management Platform
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-white">
          The Full Life of Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Subscription Business
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          From products, plans, and quotations to automated idempotent invoicing, partial payments, and real-time MRR analytics. No spreadsheets. No missed renewals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/signin"
            className="btn btn-primary text-base font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-blue-500/25 w-full sm:w-auto"
          >
            Launch Demo Dashboard →
          </Link>
          <Link
            href="/signup"
            className="btn btn-secondary text-base font-semibold px-8 py-3.5 rounded-xl w-full sm:w-auto"
          >
            Create Customer Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
          <div className="card p-6 border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="text-lg font-bold text-white mb-2">Flexible Plans & Lifecycle</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Support daily, weekly, monthly, and yearly intervals with state-machine enforced pauses, renewals, and early closings.
            </p>
          </div>

          <div className="card p-6 border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Billing Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Catch-up billing with idempotency protection. Auto-applies discounts and computes taxes down to integer cents with half-up rounding.
            </p>
          </div>

          <div className="card p-6 border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Live Revenue & MRR Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant visibility into normalized Monthly Recurring Revenue, aging overdue receivables, payment methods, and CSV data export.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Brightloop Software. Engineered for scalable subscription businesses.</p>
      </footer>
    </div>
  );
}
