import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
      },
    });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orders = await prisma.order.findMany({
      where: { customer_id: params.id }
    });
    
    for (const order of orders) {
      await prisma.invoice.deleteMany({ where: { order_id: order.id } });
    }
    
    await prisma.order.deleteMany({
      where: { customer_id: params.id }
    });

    await prisma.customer.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Customer deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
