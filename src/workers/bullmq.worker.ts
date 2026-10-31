/**
 * BullMQ Worker implementation for distributed billing queues.
 * Used when Redis is configured via REDIS_URL.
 */

import { Worker, Queue } from 'bullmq';
import { runBilling } from '../lib/billing';

const redisUrl = process.env.REDIS_URL;

export const billingQueueName = 'billing-runs';

export function getBillingQueue() {
  if (!redisUrl) return null;
  return new Queue(billingQueueName, {
    connection: { url: redisUrl },
  });
}

export function startBullMqWorker() {
  if (!redisUrl) {
    console.log('[BullMQ] REDIS_URL not configured. BullMQ worker not started.');
    return null;
  }

  const worker = new Worker(
    billingQueueName,
    async (job) => {
      console.log(`[BullMQ] Processing billing job ${job.id} for date:`, job.data.date);
      const billingDate = job.data.date ? new Date(job.data.date) : new Date();
      const outcome = await runBilling(billingDate);
      return outcome;
    },
    {
      connection: { url: redisUrl },
      concurrency: 1, // Ensure single instance billing sweep to avoid concurrent invoice generation
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[BullMQ] Job ${job.id} completed.`, result);
  });

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} failed:`, err);
  });

  return worker;
}
