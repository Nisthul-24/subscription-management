/**
 * Gap-free sequence number generator.
 * Uses atomic upsert with increment to prevent gaps within a month.
 * Format: PREFIX-YYYYMM-XXXXX (e.g. SUB-202610-00001, INV-202610-00001)
 */

import { prisma } from './db';

export async function generateSequenceNumber(
  type: 'SUB' | 'INV',
  date: Date = new Date()
): Promise<string> {
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `${type}-${yearMonth}`;

  // Use atomic upsert to ensure gap-free monotonic sequence
  const seq = await prisma.sequence.upsert({
    where: { prefix },
    update: { lastValue: { increment: 1 } },
    create: { prefix, lastValue: 1 },
  });

  return `${prefix}-${String(seq.lastValue).padStart(5, '0')}`;
}
