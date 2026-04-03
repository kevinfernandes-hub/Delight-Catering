import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type MenuOrderPayload = {
  package?: {
    id?: string;
    name?: string;
    category?: string;
    per_plate_price?: number;
  };
  customer_phone?: string;
  linked_order_id?: string;
  linked_invoice_id?: string;
};

function parseItems(items: string): MenuOrderPayload {
  try {
    const parsed = JSON.parse(items);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as MenuOrderPayload;
    }
    return {};
  } catch {
    return {};
  }
}

async function getNextInvoiceNumber() {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { created_at: 'desc' },
    select: { invoice_number: true },
  });

  const current = lastInvoice?.invoice_number?.match(/INV-(\d+)/)?.[1];
  const currentNumber = current ? parseInt(current, 10) : 1000;
  const nextNumber = Number.isFinite(currentNumber) ? currentNumber + 1 : 1001;
  return `INV-${nextNumber}`;
}

async function createOrderAndInvoiceFromMenuOrder(id: string) {
  const menuOrder = await prisma.menuOrder.findUnique({ where: { id } });
  if (!menuOrder) {
    throw new Error('Menu order not found');
  }

  const payload = parseItems(menuOrder.items);
  if (payload.linked_order_id && payload.linked_invoice_id) {
    return {
      linked_order_id: payload.linked_order_id,
      linked_invoice_id: payload.linked_invoice_id,
    };
  }

  const customerPhone = payload.customer_phone || `menu-${id.slice(-8)}`;
  const customerEmail = `${customerPhone.replace(/\s+/g, '')}@menu-order.local`;

  let customer = await prisma.customer.findFirst({
    where: { phone: customerPhone },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: menuOrder.customer_name,
        phone: customerPhone,
        email: customerEmail,
        address: 'To be confirmed',
      },
    });
  }

  const pkg = payload.package;
  const packageNote = pkg
    ? `${pkg.name || 'Package'} (${pkg.category || 'Custom'}) - INR ${pkg.per_plate_price || 0} per plate`
    : 'Custom package request';

  const order = await prisma.order.create({
    data: {
      customer_id: customer.id,
      event_date: new Date(),
      event_type: pkg?.name ? `${pkg.name} Booking` : 'Package Booking',
      guest_count: menuOrder.guest_count,
      status: 'Confirmed',
      total_amount: menuOrder.total_price,
      venue: 'To be confirmed',
      notes: `Created from MenuOrder ${menuOrder.id}. ${packageNote}`,
    },
  });

  const invoiceNumber = await getNextInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      order_id: order.id,
      invoice_number: invoiceNumber,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subtotal: menuOrder.subtotal,
      tax_amount: menuOrder.tax_amount,
      total: menuOrder.total_price,
      status: 'Unpaid',
    },
  });

  const updatedPayload: MenuOrderPayload = {
    ...payload,
    linked_order_id: order.id,
    linked_invoice_id: invoice.id,
  };

  await prisma.menuOrder.update({
    where: { id: menuOrder.id },
    data: { items: JSON.stringify(updatedPayload) },
  });

  return {
    linked_order_id: order.id,
    linked_invoice_id: invoice.id,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await prisma.menuOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[MenuOrder GET]', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, subtotal, tax_amount, total_price } = body;

    const hasStatus = typeof status === 'string' && status.length > 0;
    const hasPriceUpdate =
      subtotal !== undefined || tax_amount !== undefined || total_price !== undefined;

    if (!hasStatus && !hasPriceUpdate) {
      return NextResponse.json({ error: 'Status or price fields are required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (hasStatus) {
      updateData.status = status;
    }
    if (subtotal !== undefined) {
      const parsed = Number(subtotal);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Invalid subtotal value' }, { status: 400 });
      }
      updateData.subtotal = parsed;
    }
    if (tax_amount !== undefined) {
      const parsed = Number(tax_amount);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Invalid tax value' }, { status: 400 });
      }
      updateData.tax_amount = parsed;
    }
    if (total_price !== undefined) {
      const parsed = Number(total_price);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Invalid total price value' }, { status: 400 });
      }
      updateData.total_price = parsed;
    }

    const order = await prisma.menuOrder.update({
      where: { id },
      data: updateData,
    });

    if (status === 'Confirmed') {
      await createOrderAndInvoiceFromMenuOrder(id);
    }

    if (hasPriceUpdate) {
      const payload = parseItems(order.items);
      if (payload.linked_order_id) {
        await prisma.order.update({
          where: { id: payload.linked_order_id },
          data: { total_amount: order.total_price },
        });
      }
      if (payload.linked_invoice_id) {
        await prisma.invoice.update({
          where: { id: payload.linked_invoice_id },
          data: {
            subtotal: order.subtotal,
            tax_amount: order.tax_amount,
            total: order.total_price,
          },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[MenuOrder PUT]', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.menuOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MenuOrder DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
