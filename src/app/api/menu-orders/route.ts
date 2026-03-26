import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.menuOrder.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('[MenuOrders GET]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, guest_count, items, subtotal, tax_amount, total_price } = body;

    if (!customer_name || !guest_count || !items || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await prisma.menuOrder.create({
      data: {
        customer_name,
        guest_count,
        items: JSON.stringify(items), // Store items as JSON string
        subtotal,
        tax_amount,
        total_price,
        status: 'Pending',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[MenuOrders POST]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
