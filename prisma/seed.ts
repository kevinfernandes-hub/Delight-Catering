import "dotenv/config";
import { PrismaClient } from '@prisma/client';

import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:dev.db' }),
} as any);
// Prisma 7 should pick up the URL from process.env.DATABASE_URL automatically if correctly generated

async function main() {
  console.log('Seeding data...');

  // 1. Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'John Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St', notes: 'Frequent customer' } }),
    prisma.customer.create({ data: { name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', address: '456 Oak Ave', notes: 'Corporate client' } }),
    prisma.customer.create({ data: { name: 'Alice Wilson', email: 'alice@example.com', phone: '5551234567', address: '789 Pine Rd' } }),
    prisma.customer.create({ data: { name: 'Bob Brown', email: 'bob@example.com', phone: '5559876543', address: '321 Elm St' } }),
    prisma.customer.create({ data: { name: 'Charlie Davis', email: 'charlie@example.com', phone: '1112223333', address: '555 Maple Dr' } }),
    prisma.customer.create({ data: { name: 'Diana Evans', email: 'diana@example.com', phone: '4445556666', address: '777 Birch Ln' } }),
  ]);

  // 2. Menu Items
  const menuItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Chicken Biryani', category: 'Mains', description: 'Fragrant basmati rice with tender chicken', price: 250, unit: 'per person' } }),
    prisma.menuItem.create({ data: { name: 'Paneer Tikka', category: 'Appetizers', description: 'Grilled paneer cubes with spices', price: 180, unit: 'per plate' } }),
    prisma.menuItem.create({ data: { name: 'Spring Rolls', category: 'Appetizers', description: 'Crispy rolls with veg filling', price: 150, unit: 'per plate' } }),
    prisma.menuItem.create({ data: { name: 'Butter Chicken', category: 'Mains', description: 'Creamy tomato gravy with chicken', price: 280, unit: 'per person' } }),
    prisma.menuItem.create({ data: { name: 'Dal Makhani', category: 'Mains', description: 'Slow cooked black lentils', price: 150, unit: 'per person' } }),
    prisma.menuItem.create({ data: { name: 'Jeera Rice', category: 'Sides', description: 'Cumin flavored basmati rice', price: 100, unit: 'per plate' } }),
    prisma.menuItem.create({ data: { name: 'Garlic Naan', category: 'Sides', description: 'Soft bread with garlic', price: 40, unit: 'per piece' } }),
    prisma.menuItem.create({ data: { name: 'Gulab Jamun', category: 'Desserts', description: 'Sweet milk dumplings', price: 60, unit: 'per plate' } }),
    prisma.menuItem.create({ data: { name: 'Ice Cream', category: 'Desserts', description: 'Vanilla / Chocolate / Strawberry', price: 80, unit: 'per scoop' } }),
    prisma.menuItem.create({ data: { name: 'Wedding Buffet Package', category: 'Packages', description: 'Full course meal for weddings', price: 800, unit: 'per person' } }),
    prisma.menuItem.create({ data: { name: 'Birthday Party Pack', category: 'Packages', description: 'Snacks + Main course + Cake', price: 500, unit: 'per person' } }),
    prisma.menuItem.create({ data: { name: 'Fish Fry', category: 'Appetizers', description: 'Crispy fried fish fillets', price: 220, unit: 'per plate' } }),
    prisma.menuItem.create({ data: { name: 'Mix Veg Curry', category: 'Mains', description: 'Assorted vegetables in gravy', price: 160, unit: 'per person' } }),
    prisma.menuItem.create({ data: { name: 'Fruit Salad', category: 'Desserts', description: 'Fresh seasonal fruits', price: 120, unit: 'per bowl' } }),
  ]);

  // 3. Orders
  const orders = await Promise.all([
    prisma.order.create({ data: { customer_id: customers[0].id, event_date: new Date('2026-04-10'), event_type: 'Wedding', guest_count: 100, status: 'Confirmed', total_amount: 80000, venue: 'Grand Plaza Hall' } }),
    prisma.order.create({ data: { customer_id: customers[1].id, event_date: new Date('2026-03-25'), event_type: 'Corporate', guest_count: 50, status: 'Pending', total_amount: 15000, venue: 'Skyway Tech Park' } }),
    prisma.order.create({ data: { customer_id: customers[2].id, event_date: new Date('2026-02-15'), event_type: 'Birthday', guest_count: 30, status: 'Completed', total_amount: 18000, venue: 'Private Villa' } }),
    prisma.order.create({ data: { customer_id: customers[3].id, event_date: new Date('2026-03-30'), event_type: 'Anniversary', guest_count: 40, status: 'Confirmed', total_amount: 25000, venue: 'Lakeside Resort' } }),
    prisma.order.create({ data: { customer_id: customers[4].id, event_date: new Date('2026-04-05'), event_type: 'Party', guest_count: 60, status: 'Cancelled', total_amount: 12000, venue: 'Community Center' } }),
    prisma.order.create({ data: { customer_id: customers[5].id, event_date: new Date('2026-05-12'), event_type: 'Mehendi', guest_count: 80, status: 'Confirmed', total_amount: 45000, venue: 'Heritage Garden' } }),
    prisma.order.create({ data: { customer_id: customers[0].id, event_date: new Date('2026-01-20'), event_type: 'Engagement', guest_count: 50, status: 'Completed', total_amount: 35000, venue: 'The Ritz' } }),
    prisma.order.create({ data: { customer_id: customers[1].id, event_date: new Date('2026-02-10'), event_type: 'Product Launch', guest_count: 120, status: 'Completed', total_amount: 95000, venue: 'Innovation Hub' } }),
  ]);

  // 4. Invoices
  await Promise.all([
    prisma.invoice.create({ data: { order_id: orders[0].id, invoice_number: 'INV-1001', due_date: new Date('2026-04-01'), subtotal: 74074.07, tax_rate: 0.08, tax_amount: 5925.93, total: 80000, status: 'Unpaid' } }),
    prisma.invoice.create({ data: { order_id: orders[1].id, invoice_number: 'INV-1002', due_date: new Date('2026-03-20'), subtotal: 13888.89, tax_rate: 0.08, tax_amount: 1111.11, total: 15000, status: 'Unpaid' } }),
    prisma.invoice.create({ data: { order_id: orders[2].id, invoice_number: 'INV-1003', due_date: new Date('2026-02-01'), subtotal: 16666.67, tax_rate: 0.08, tax_amount: 1333.33, total: 18000, status: 'Paid', paid_date: new Date('2026-02-05') } }),
    prisma.invoice.create({ data: { order_id: orders[3].id, invoice_number: 'INV-1004', due_date: new Date('2026-03-15'), subtotal: 23148.15, tax_rate: 0.08, tax_amount: 1851.85, total: 25000, status: 'Unpaid' } }),
    prisma.invoice.create({ data: { order_id: orders[5].id, invoice_number: 'INV-1005', due_date: new Date('2026-05-01'), subtotal: 41666.67, tax_rate: 0.08, tax_amount: 3333.33, total: 45000, status: 'Unpaid' } }),
    prisma.invoice.create({ data: { order_id: orders[6].id, invoice_number: 'INV-1006', due_date: new Date('2026-01-10'), subtotal: 32407.41, tax_rate: 0.08, tax_amount: 2592.59, total: 35000, status: 'Paid', paid_date: new Date('2026-01-15') } }),
    prisma.invoice.create({ data: { order_id: orders[7].id, invoice_number: 'INV-1007', due_date: new Date('2026-02-05'), subtotal: 87962.96, tax_rate: 0.08, tax_amount: 7037.04, total: 95000, status: 'Paid', paid_date: new Date('2026-02-12') } }),
    prisma.invoice.create({ data: { order_id: orders[4].id, invoice_number: 'INV-1008', due_date: new Date('2026-04-01'), subtotal: 11111.11, tax_rate: 0.08, tax_amount: 888.89, total: 12000, status: 'Unpaid' } }),
  ]);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
