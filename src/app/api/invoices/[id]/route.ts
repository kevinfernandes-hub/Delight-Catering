import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateInvoiceStatusSchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validationResult = UpdateInvoiceStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: validationResult.data.status,
        paid_date: validationResult.data.status === 'Paid' ? new Date() : null,
      },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Invoice PUT error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Invoice DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
