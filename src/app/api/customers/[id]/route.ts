import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateCustomerSchema } from '@/lib/validations';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validationResult = CreateCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || '',
        notes: data.notes,
      },
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer PUT error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = await prisma.order.findMany({
      where: { customer_id: id }
    });
    
    for (const order of orders) {
      await prisma.invoice.deleteMany({ where: { order_id: order.id } });
    }
    
    await prisma.order.deleteMany({
      where: { customer_id: id }
    });

    await prisma.customer.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
