import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  sendEmail, 
  getOrderConfirmationEmail, 
  getInvoiceEmail, 
  getPaymentReminderEmail 
} from '@/lib/email';
import { generateInvoicePDF } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, orderId, invoiceId, customerId } = body;

    if (!type) {
      return NextResponse.json({ error: 'Email type is required' }, { status: 400 });
    }

    let sent = false;

    // Order Confirmation Email
    if (type === 'order_confirmation' && orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
      });

      if (!order || !order.customer) {
        return NextResponse.json({ error: 'Order or customer not found' }, { status: 404 });
      }

      sent = await sendEmail({
        to: order.customer.email,
        subject: 'Order Confirmation - Delight Caterers',
        html: getOrderConfirmationEmail(order.customer.name, order.id),
      });
    }

    // Invoice Email with PDF Attachment
    if (type === 'invoice' && invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
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

      if (!invoice || !invoice.order?.customer) {
        return NextResponse.json({ error: 'Invoice or customer not found' }, { status: 404 });
      }

      // Generate PDF (type assertion due to Prisma return type differences)
      const pdfBuffer = await generateInvoicePDF(invoice as any);

      sent = await sendEmail({
        to: invoice.order.customer.email,
        subject: `Invoice ${invoice.invoice_number} - Delight Caterers`,
        html: getInvoiceEmail(
          invoice.order.customer.name,
          invoice.invoice_number,
          invoice.total
        ),
        attachments: [
          {
            filename: `invoice-${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    }

    // Payment Reminder Email
    if (type === 'payment_reminder' && invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
      });

      if (!invoice || !invoice.order?.customer) {
        return NextResponse.json({ error: 'Invoice or customer not found' }, { status: 404 });
      }

      sent = await sendEmail({
        to: invoice.order.customer.email,
        subject: `Payment Reminder - Invoice ${invoice.invoice_number}`,
        html: getPaymentReminderEmail(
          invoice.order.customer.name,
          invoice.invoice_number,
          new Date(invoice.due_date).toLocaleDateString()
        ),
      });
    }

    // General contact email
    if (type === 'contact' && customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      sent = await sendEmail({
        to: customer.email,
        subject: body.subject || 'Message from Delight Caterers',
        html: body.html || body.message || 'No message provided',
      });
    }

    return NextResponse.json(
      {
        message: sent
          ? 'Email sent successfully'
          : 'Email could not be sent - check SMTP configuration',
        sent,
      },
      { status: sent ? 200 : 400 }
    );
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
