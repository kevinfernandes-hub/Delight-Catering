import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch invoice with relationships
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Generate PDF (type assertion due to Prisma return type differences)
    const pdfBuffer = await generateInvoicePDF(invoice as any);

    // Return PDF file
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
