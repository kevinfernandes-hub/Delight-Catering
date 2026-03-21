import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateOrderSchema } from '@/lib/validations';

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
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = CreateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Create or find customer
    let customer;
    if (data.customer_id) {
       customer = { id: data.customer_id };
    } else {
       customer = await prisma.customer.create({
         data: {
           name: data.customerName,
           email: data.email,
           phone: data.phone,
           address: data.address || 'N/A'
         }
       });
    }

    const order = await prisma.order.create({
      data: {
        customer_id: customer.id,
        event_type: data.event_type,
        event_date: new Date(data.event_date),
        guest_count: data.guest_count,
        total_amount: data.total_amount,
        venue: data.venue || '',
        status: 'Pending',
        notes: data.notes
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
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
