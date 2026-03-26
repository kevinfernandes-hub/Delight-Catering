import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateOrderSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled']),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: true,
        invoice: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if this is a status-only update (from status dropdown)
    if (Object.keys(body).length === 1 && body.status) {
      const order = await prisma.order.update({
        where: { id },
        data: { status: body.status }
      });
      return NextResponse.json(order);
    }

    // Full order update (from OrderForm)
    const { customer_id, event_type, event_date, guest_count, venue, notes, status, total_amount, orderItems } = body;

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        customer_id,
        event_type,
        event_date: new Date(event_date),
        guest_count: parseInt(guest_count),
        total_amount: parseFloat(total_amount),
        venue: venue || '',
        status: status || 'Pending',
        notes: notes || ''
      }
    });

    // Delete existing order items and create new ones
    if (orderItems && Array.isArray(orderItems)) {
      await prisma.orderItem.deleteMany({
        where: { order_id: id }
      });

      if (orderItems.length > 0) {
        await prisma.orderItem.createMany({
          data: orderItems.map((item: any) => ({
            order_id: id,
            menu_id: item.menu_id,
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price)
          }))
        });
      }
    }

    // Update invoice if total_amount changed
    if (total_amount) {
      const subtotal = total_amount / 1.08;
      const tax_amount = total_amount - subtotal;

      await prisma.invoice.update({
        where: { order_id: id },
        data: {
          subtotal,
          tax_amount,
          total: total_amount
        }
      });
    }

    // Return updated order with items
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true, customer: true }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invoice.deleteMany({
      where: { order_id: id }
    });

    await prisma.order.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
