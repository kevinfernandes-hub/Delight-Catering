import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: body.status,
      },
    });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Invoice deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
