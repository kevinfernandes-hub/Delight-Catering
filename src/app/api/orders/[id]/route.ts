import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status,
      },
    });

    // If order is completed, ensure invoice exists or update it
    if (body.status === 'Completed') {
       // Logic to handle invoice could go here
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.deleteMany({
      where: { order_id: params.id }
    });

    await prisma.order.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Order deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
