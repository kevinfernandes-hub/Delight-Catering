import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const order = await prisma.menuOrder.update({
      where: { id },
      data: { status },
    });

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
