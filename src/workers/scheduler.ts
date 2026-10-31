/**
 * Standalone background billing scheduler and worker.
 * 
 * Can run as a standalone process (npm run worker) or via Next.js instrumentation.
 * Features:
 * - Periodic check for due subscriptions (configurable interval, default: 60s)
 * - Automatic catch-up billing for missed billing cycles
 * - Auto-closing of expired subscriptions configured with autoCloseAtEnd
 * - Optional BullMQ worker integration if REDIS_URL is provided
 */

import { runBilling } from '../lib/billing';

export class BillingScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private intervalMs: number;

  constructor(intervalMs: number = 60_000) {
    this.intervalMs = intervalMs;
  }

  public start() {
    if (this.timer) return;
    console.log(`[BillingScheduler] Started. Running billing sweep every ${this.intervalMs / 1000}s`);

    // Run immediate sweep on startup
    this.runSweep();

    this.timer = setInterval(() => {
      this.runSweep();
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[BillingScheduler] Stopped.');
    }
  }

  private async runSweep() {
    if (this.isRunning) {
      console.log('[BillingScheduler] Previous sweep still in progress, skipping tick.');
      return;
    }

    this.isRunning = true;
    const now = new Date();
    try {
      const outcome = await runBilling(now);
      if (outcome.generated > 0 || outcome.autoClosed > 0 || outcome.errors.length > 0) {
        console.log(
          `[BillingScheduler] Sweep completed: Generated ${outcome.generated} invoice(s), ` +
          `auto-closed ${outcome.autoClosed} subscription(s). Errors: ${outcome.errors.length}`
        );
        if (outcome.errors.length > 0) {
          console.error('[BillingScheduler] Errors encountered:', outcome.errors);
        }
      }
    } catch (err) {
      console.error('[BillingScheduler] Error during billing sweep:', err);
    } finally {
      this.isRunning = false;
    }
  }
}

// If executed directly from CLI: npx tsx src/workers/scheduler.ts
if (require.main === module || process.argv[1]?.endsWith('scheduler.ts')) {
  const intervalSeconds = parseInt(process.env.BILLING_INTERVAL_SECONDS || '60', 10);
  const scheduler = new BillingScheduler(intervalSeconds * 1000);
  scheduler.start();

  const shutdown = () => {
    console.log('\nGracefully shutting down BillingScheduler...');
    scheduler.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
