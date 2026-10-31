import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Admin@123!', 10);
  const staffHash = await bcrypt.hash('Staff@123!', 10);
  const customerHash = await bcrypt.hash('Customer@123!', 10);

  // 1. Demo Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.dev' },
    update: {},
    create: {
      email: 'admin@brightloop.dev',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Alex',
      lastName: 'Vance',
      company: 'Brightloop Technologies',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@brightloop.dev' },
    update: {},
    create: {
      email: 'staff@brightloop.dev',
      passwordHash: staffHash,
      role: 'STAFF',
      firstName: 'Sarah',
      lastName: 'Chen',
      company: 'Brightloop Operations',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@brightloop.dev' },
    update: {},
    create: {
      email: 'customer@brightloop.dev',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      firstName: 'David',
      lastName: 'Miller',
      company: 'Acme Global Corp',
      phone: '+1 555-0199',
      address: '100 Innovation Way, Suite 400, San Francisco, CA',
    },
  });

  console.log('✓ Users created:', { admin: admin.email, staff: staff.email, customer: customer.email });

  // 2. Tax Rules
  const standardTax = await prisma.taxRule.upsert({
    where: { id: 'tax-standard-18' },
    update: {},
    create: {
      id: 'tax-standard-18',
      name: 'Standard VAT / GST (18%)',
      rateBps: 1800,
      applicability: 'ALL',
      active: true,
    },
  });

  const serviceTax = await prisma.taxRule.upsert({
    where: { id: 'tax-service-10' },
    update: {},
    create: {
      id: 'tax-service-10',
      name: 'Cloud Services Surcharge (10%)',
      rateBps: 1000,
      applicability: 'SERVICE',
      active: true,
    },
  });

  console.log('✓ Tax rules created');

  // 3. Plans
  const monthlyStarter = await prisma.plan.upsert({
    where: { id: 'plan-starter-monthly' },
    update: {},
    create: {
      id: 'plan-starter-monthly',
      name: 'Starter Cloud (Monthly)',
      priceCents: 4900, // $49.00 / mo
      billingPeriod: 'MONTHLY',
      minQuantity: 1,
      pausable: true,
      closableEarly: true,
      renewable: true,
      active: true,
    },
  });

  const yearlyPro = await prisma.plan.upsert({
    where: { id: 'plan-pro-yearly' },
    update: {},
    create: {
      id: 'plan-pro-yearly',
      name: 'Enterprise Cloud (Yearly)',
      priceCents: 99000, // $990.00 / yr
      billingPeriod: 'YEARLY',
      minQuantity: 1,
      pausable: false,
      closableEarly: false,
      renewable: true,
      active: true,
    },
  });

  console.log('✓ Plans created');

  // 4. Products & Variants
  const platformLicense = await prisma.product.upsert({
    where: { id: 'prod-brightloop-core' },
    update: {},
    create: {
      id: 'prod-brightloop-core',
      name: 'Brightloop Platform Core License',
      type: 'product',
      salesPriceCents: 4900,
      costPriceCents: 1200,
      notes: 'Core SaaS seat license with full API access',
      active: true,
    },
  });

  // Variant attribute
  const brandAttr = await prisma.productAttribute.upsert({
    where: { id: 'attr-hosting-tier' },
    update: {},
    create: {
      id: 'attr-hosting-tier',
      productId: platformLicense.id,
      name: 'Hosting Tier',
    },
  });

  await prisma.productVariant.upsert({
    where: { id: 'var-dedicated-vpc' },
    update: {},
    create: {
      id: 'var-dedicated-vpc',
      attributeId: brandAttr.id,
      value: 'Dedicated VPC Cloud',
      extraPriceCents: 2500, // +$25.00
    },
  });

  const analyticsAddon = await prisma.product.upsert({
    where: { id: 'prod-analytics-addon' },
    update: {},
    create: {
      id: 'prod-analytics-addon',
      name: 'Advanced Real-time Analytics Add-on',
      type: 'service',
      salesPriceCents: 2900,
      costPriceCents: 500,
      notes: 'Granular telemetry and real-time alerts',
      active: true,
    },
  });

  console.log('✓ Products & Variants created');

  // 5. Discount Rules
  await prisma.discountRule.upsert({
    where: { id: 'disc-welcome-15' },
    update: {},
    create: {
      id: 'disc-welcome-15',
      name: 'New Client 15% Launch Promo',
      discountType: 'PERCENTAGE',
      valueBps: 1500, // 15.00%
      minPurchaseCents: 3000,
      minQuantity: 1,
      scope: 'SUBSCRIPTION',
      usageLimit: 500,
      usageCount: 0,
      active: true,
    },
  });

  console.log('✓ Discount rules created');

  // 6. Quotation Template
  await prisma.quotationTemplate.upsert({
    where: { id: 'tmpl-starter-pack' },
    update: {},
    create: {
      id: 'tmpl-starter-pack',
      name: 'Standard Starter Pack',
      planId: monthlyStarter.id,
      validDays: 30,
      active: true,
      lines: {
        create: [
          {
            productId: platformLicense.id,
            quantity: 1,
            unitPriceCents: platformLicense.salesPriceCents,
          },
          {
            productId: analyticsAddon.id,
            quantity: 1,
            unitPriceCents: analyticsAddon.salesPriceCents,
          },
        ],
      },
    },
  });

  console.log('✓ Quotation templates created');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
