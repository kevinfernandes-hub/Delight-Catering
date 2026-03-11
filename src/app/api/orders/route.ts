import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create or find customer (simplified for beta)
    let customer;
    if (body.customer_id) {
       customer = { id: body.customer_id };
    } else {
       customer = await prisma.customer.create({
         data: {
           name: body.customerName,
           email: body.email,
           phone: body.phone,
           address: body.address || 'N/A'
         }
       });
    }

    const order = await prisma.order.create({
      data: {
        customer_id: customer.id,
        event_type: body.event_type,
        event_date: new Date(body.event_date),
        guest_count: parseInt(body.guest_count),
        total_amount: parseFloat(body.total_amount),
        venue: body.venue,
        status: 'Pending',
      },
    });

    // Automatically generate invoice
    const subtotal = order.total_amount / 1.08;
    const tax_amount = order.total_amount - subtotal;
    
    await prisma.invoice.create({
      data: {
        order_id: order.id,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        subtotal: subtotal,
        tax_amount: tax_amount,
        total: order.total_amount,
        status: 'Unpaid'
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
