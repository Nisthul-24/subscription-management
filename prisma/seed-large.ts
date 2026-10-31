import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubscriptionStatus, InvoiceStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subDays, subMonths, format, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting Large-Scale Seed (5,000 Subscriptions & 20,000+ Invoices)...');
  const startTime = Date.now();

  // 1. Fetch seed references (plans, products, tax rules, admin/staff)
  const plans = await prisma.plan.findMany();
  const products = await prisma.product.findMany();
  const taxRules = await prisma.taxRule.findMany();
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (plans.length === 0 || products.length === 0 || !admin) {
    console.error('Base seed data not found! Please run `npx tsx prisma/seed.ts` first.');
    process.exit(1);
  }

  const defaultPasswordHash = await bcrypt.hash('Customer@123!', 8); // Fast salt for bulk

  // 2. Generate 500 Customers
  console.log('Generating 500 customers...');
  const customerCount = 500;
  const customerRows: Array<{
    id: string;
    email: string;
    passwordHash: string;
    role: 'CUSTOMER';
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    address: string;
  }> = [];

  const customerIds: string[] = [];
  for (let i = 1; i <= customerCount; i++) {
    const id = `cust-bulk-${i.toString().padStart(4, '0')}`;
    customerIds.push(id);
    customerRows.push({
      id,
      email: `customer${i}@enterprise-client.com`,
      passwordHash: defaultPasswordHash,
      role: 'CUSTOMER',
      firstName: `Client`,
      lastName: `${i}`,
      company: `Corp ${i} Solutions Inc.`,
      phone: `+1-555-${(1000 + i).toString()}`,
      address: `${100 + i} Market Street, Suite ${i}, San Francisco, CA`,
    });
  }

  // Insert customers in chunks of 500
  await prisma.user.createMany({
    data: customerRows,
    skipDuplicates: true,
  });
  console.log(`✓ 500 customers created in ${Date.now() - startTime}ms`);

  // 3. Generate 5,000 Subscriptions
  console.log('Generating 5,000 subscriptions...');
  const totalSubs = 5000;
  const subRows: Array<{
    id: string;
    number: string;
    customerId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    expiryDate: Date | null;
    paymentTermsDays: number;
    nextBillingDate: Date | null;
    notes: string | null;
  }> = [];

  const subLineRows: Array<{
    id: string;
    subscriptionId: string;
    productId: string;
    quantity: number;
    unitPriceCents: number;
  }> = [];

  const statuses: SubscriptionStatus[] = [
    'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', // 70% active
    'ACTIVE', 'ACTIVE', 'CONFIRMED', 'PAUSED', 'CLOSED'
  ];

  const subIds: string[] = [];
  const activeOrPastSubIds: Array<{ id: string; customerId: string; planId: string; startDate: Date; status: SubscriptionStatus }> = [];

  const now = new Date();

  for (let i = 1; i <= totalSubs; i++) {
    const id = `sub-bulk-${i.toString().padStart(5, '0')}`;
    subIds.push(id);
    const customerId = customerIds[i % customerIds.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const monthsAgo = (i % 12) + 1;
    const startDate = subMonths(now, monthsAgo);
    const expiryDate = plan.autoCloseAtEnd ? addDays(startDate, 365) : null;
    const nextBillingDate = status === 'ACTIVE' ? addDays(now, (i % 28) + 1) : null;

    subRows.push({
      id,
      number: `SUB-BULK-${i.toString().padStart(6, '0')}`,
      customerId,
      planId: plan.id,
      status,
      startDate,
      expiryDate,
      paymentTermsDays: 15,
      nextBillingDate,
      notes: `Bulk generated subscription #${i}`,
    });

    if (status === 'ACTIVE' || status === 'PAUSED' || status === 'CLOSED') {
      activeOrPastSubIds.push({ id, customerId, planId: plan.id, startDate, status });
    }

    // 1-2 lines per subscription
    const product = products[i % products.length];
    subLineRows.push({
      id: uuidv4(),
      subscriptionId: id,
      productId: product.id,
      quantity: (i % 5) + 1,
      unitPriceCents: product.salesPriceCents,
    });
  }

  // Batch insert subscriptions in chunks of 1000
  for (let i = 0; i < subRows.length; i += 1000) {
    const chunk = subRows.slice(i, i + 1000);
    await prisma.subscription.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // Batch insert subscription lines in chunks of 1000
  for (let i = 0; i < subLineRows.length; i += 1000) {
    const chunk = subLineRows.slice(i, i + 1000);
    await prisma.subscriptionLine.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
  console.log(`✓ 5,000 subscriptions and lines created in ${Date.now() - startTime}ms`);

  // 4. Generate 20,000+ Invoices & Payments
  console.log('Generating 22,000+ invoices and payments across past 12 months...');
  const invoiceRows: Array<{
    id: string;
    number: string;
    subscriptionId: string;
    customerId: string;
    status: InvoiceStatus;
    invoiceDate: Date;
    dueDate: Date;
    billingPeriodKey: string;
    subtotalCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
    paidCents: number;
  }> = [];

  const invoiceLineRows: Array<{
    id: string;
    invoiceId: string;
    productId: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    discountCents: number;
    taxCents: number;
    taxRateBps: number;
  }> = [];

  const paymentRows: Array<{
    id: string;
    invoiceId: string;
    method: PaymentMethod;
    amountCents: number;
    paymentDate: Date;
    note: string;
    recordedById: string;
  }> = [];

  const paymentMethods: PaymentMethod[] = ['CREDIT_CARD', 'BANK_TRANSFER', 'CHECK'];
  const taxRateBps = taxRules[0]?.rateBps || 1800;
  const product = products[0];

  let invoiceSeq = 1;
  // Generate ~5 invoices per active/past subscription (approx 4,400 subs * 5 = ~22,000 invoices)
  for (const sub of activeOrPastSubIds) {
    const monthsToBill = Math.min(5, Math.max(1, (sub.startDate ? 6 : 3)));

    for (let m = monthsToBill; m >= 1; m--) {
      const invId = `inv-bulk-${invoiceSeq.toString().padStart(6, '0')}`;
      const invNumber = `INV-BULK-${invoiceSeq.toString().padStart(7, '0')}`;
      const invoiceDate = subMonths(now, m);
      const dueDate = addDays(invoiceDate, 15);
      const periodKey = `${sub.id}_${format(invoiceDate, 'yyyy-MM-dd')}`;

      // Status distribution: ~85% PAID, ~10% CONFIRMED, ~5% DRAFT
      let status: InvoiceStatus = 'PAID';
      if (m === 1 && invoiceSeq % 10 === 0) {
        status = 'CONFIRMED';
      } else if (m === 1 && invoiceSeq % 20 === 0) {
        status = 'DRAFT';
      }

      const quantity = (invoiceSeq % 4) + 1;
      const unitPriceCents = product.salesPriceCents;
      const subtotalCents = quantity * unitPriceCents;
      const discountCents = invoiceSeq % 5 === 0 ? Math.round(subtotalCents * 0.1) : 0;
      const taxable = subtotalCents - discountCents;
      const taxCents = Math.round((taxable * taxRateBps) / 10000);
      const totalCents = taxable + taxCents;
      const paidCents = status === 'PAID' ? totalCents : 0;

      invoiceRows.push({
        id: invId,
        number: invNumber,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        status,
        invoiceDate,
        dueDate,
        billingPeriodKey: periodKey,
        subtotalCents,
        discountCents,
        taxCents,
        totalCents,
        paidCents,
      });

      invoiceLineRows.push({
        id: uuidv4(),
        invoiceId: invId,
        productId: product.id,
        description: `${product.name} (Bulk)`,
        quantity,
        unitPriceCents,
        lineTotalCents: subtotalCents,
        discountCents,
        taxCents,
        taxRateBps,
      });

      if (status === 'PAID') {
        paymentRows.push({
          id: uuidv4(),
          invoiceId: invId,
          method: paymentMethods[invoiceSeq % paymentMethods.length],
          amountCents: totalCents,
          paymentDate: addDays(invoiceDate, (invoiceSeq % 10) + 1),
          note: `Bulk recorded payment for invoice ${invNumber}`,
          recordedById: admin.id,
        });
      }

      invoiceSeq++;
    }
  }

  console.log(`Prepared ${invoiceRows.length} invoices and ${paymentRows.length} payments. Inserting in batches...`);

  // Batch insert invoices in chunks of 1000
  for (let i = 0; i < invoiceRows.length; i += 1000) {
    const chunk = invoiceRows.slice(i, i + 1000);
    await prisma.invoice.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // Batch insert invoice lines in chunks of 1000
  for (let i = 0; i < invoiceLineRows.length; i += 1000) {
    const chunk = invoiceLineRows.slice(i, i + 1000);
    await prisma.invoiceLine.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // Batch insert payments in chunks of 1000
  for (let i = 0; i < paymentRows.length; i += 1000) {
    const chunk = paymentRows.slice(i, i + 1000);
    await prisma.payment.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 Seed Large Complete!`);
  console.log(`- Customers: ${customerRows.length}`);
  console.log(`- Subscriptions: ${subRows.length}`);
  console.log(`- Invoices: ${invoiceRows.length}`);
  console.log(`- Payments: ${paymentRows.length}`);
  console.log(`- Total Time: ${durationSec}s\n`);
}

main()
  .catch((e) => {
    console.error('Seed large error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
