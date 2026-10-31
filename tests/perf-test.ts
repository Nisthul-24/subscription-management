import 'dotenv/config';
import { prisma } from '../src/lib/db';
import { createAccessToken } from '../src/lib/auth';

async function main() {
  console.log('⏱️ Testing Performance on 5,000 Subscriptions & 22,500+ Invoices...');

  // Test Direct Database Query Speed
  const dbStart = performance.now();
  const activeSubs = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
  const totalInvoices = await prisma.invoice.count();
  const totalPayments = await prisma.payment.count();
  const dbDuration = (performance.now() - dbStart).toFixed(2);

  console.log(`✓ Direct DB Counts in ${dbDuration}ms:`, {
    activeSubscriptions: activeSubs,
    totalInvoices,
    totalPayments,
  });

  // Test Next.js Dashboard Endpoint
  const token = await createAccessToken({
    userId: 'admin-user',
    email: 'admin@brightloop.dev',
    role: 'ADMIN',
    firstName: 'Alex',
    lastName: 'Vance',
  });

  const apiStart = performance.now();
  const res = await fetch('http://localhost:3000/api/dashboard', {
    headers: {
      Cookie: `accessToken=${token}`,
    },
  });
  const apiDuration = (performance.now() - apiStart).toFixed(2);

  if (!res.ok) {
    const text = await res.text();
    console.error(`Dashboard API failed with status ${res.status}:`, text);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`✓ Dashboard API responded in ${apiDuration}ms:`);
  console.log('KPIs:', {
    activeSubsCount: data.kpis.activeSubsCount,
    mrr: `$${(data.kpis.mrrCents / 100).toLocaleString()}`,
    arr: `$${((data.kpis.mrrCents * 12) / 100).toLocaleString()}`,
    totalRevenue: `$${(data.kpis.totalRevenueCents / 100).toLocaleString()}`,
    outstanding: `$${(data.kpis.outstandingCents / 100).toLocaleString()}`,
    overdueCount: data.kpis.overdueCount,
  });
  console.log('Monthly Revenue (Last 6 Months):', data.monthlyRevenue);
  console.log('Payment Methods Breakdown:', data.paymentMethods);

  if (parseFloat(apiDuration) < 2000) {
    console.log(`\n🎉 PERFORMANCE SLA MET: Dashboard loaded in ${apiDuration}ms (<2000ms SLA target)!`);
  } else {
    console.warn(`\n⚠️ Performance SLA Warning: Dashboard took ${apiDuration}ms (target <2000ms)`);
  }
}

main()
  .catch((e) => {
    console.error('Performance test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
