import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ACTIVE_EVENT_STATUSES = ['Confirmed', 'In-Progress'];

function dayRange(value: Date) {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);
  const end = new Date(value);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function isVenueLockable(venue: string) {
  const normalized = (venue || '').trim().toLowerCase();
  if (!normalized) return false;
  return normalized !== 'to be confirmed' && normalized !== 'tbd';
}

async function hasVenueConflict(orderId: string, eventDate: Date, venue: string) {
  const range = dayRange(eventDate);
  const existingEvent = await prisma.order.findFirst({
    where: {
      id: { not: orderId },
      event_date: { gte: range.start, lte: range.end },
      venue: venue,
      status: { in: ACTIVE_EVENT_STATUSES },
    },
    select: { id: true },
  });
  return Boolean(existingEvent);
}

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
    
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { event_date: true, venue: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if this is a status-only update (from status dropdown)
    if (Object.keys(body).length === 1 && body.status) {
      if (ACTIVE_EVENT_STATUSES.includes(body.status) && isVenueLockable(existingOrder.venue || '')) {
        const conflict = await hasVenueConflict(id, new Date(existingOrder.event_date), existingOrder.venue || '');
        if (conflict) {
          return NextResponse.json(
            { error: 'Venue is already booked for this date. Please choose another date or venue.' },
            { status: 409 }
          );
        }
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status: body.status }
      });
      return NextResponse.json(order);
    }

    // Full order update (from OrderForm)
    const { customer_id, event_type, event_date, guest_count, venue, notes, status, total_amount, orderItems } = body;

    const parsedDate = new Date(event_date);
    const parsedVenue = venue || '';
    const nextStatus = status || 'Pending';

    if (ACTIVE_EVENT_STATUSES.includes(nextStatus) && isVenueLockable(parsedVenue)) {
      const conflict = await hasVenueConflict(id, parsedDate, parsedVenue);
      if (conflict) {
        return NextResponse.json(
          { error: 'Venue is already booked for this date. Please choose another date or venue.' },
          { status: 409 }
        );
      }
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        customer_id,
        event_type,
        event_date: parsedDate,
        guest_count: parseInt(guest_count),
        total_amount: parseFloat(total_amount),
        venue: parsedVenue,
        status: nextStatus,
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
