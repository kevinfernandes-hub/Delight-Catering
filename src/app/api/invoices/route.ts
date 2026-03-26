import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Check if invoice already exists for this order
    const existingInvoice = await prisma.invoice.findUnique({
      where: { order_id }
    });

    if (existingInvoice) {
      return NextResponse.json(existingInvoice);
    }

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { orderItems: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate totals
    const subtotal = order.orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxRate = 0.08;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { created_at: 'desc' },
      take: 1
    });
    const invoiceNumber = `INV-${1001 + (lastInvoice ? parseInt(lastInvoice.invoice_number.split('-')[1]) : 0)}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        order_id,
        invoice_number: invoiceNumber,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'Unpaid'
      },
      include: {
        order: {
          include: {
            customer: true
          }
        }
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
