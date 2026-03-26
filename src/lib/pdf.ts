import jsPDF from 'jspdf';
import { Invoice } from '@/lib/types';

export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.text('Delight Caterers', 20, yPosition);

    doc.setFontSize(11);
    yPosition += 8;
    doc.text('Exquisite Culinary Experiences', 20, yPosition);

    doc.setFontSize(10);
    yPosition += 6;
    doc.text('Flat No 2, Shakun Apartment, Sheela Nagar Colony', 20, yPosition);
    yPosition += 5;
    doc.text('Katol Road, Nagpur, Maharashtra 440013', 20, yPosition);
    yPosition += 5;
    doc.text('Phone: 9689330035 | Email: merwynfernandes2015@gmail.com', 20, yPosition);

    // Horizontal line
    yPosition += 8;
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    // Invoice title
    doc.setFontSize(20);
    yPosition += 10;
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });

    // Invoice details
    doc.setFontSize(10);
    yPosition += 10;
    doc.text(`Invoice Number: #${invoice.invoice_number}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, yPosition);

    // Bill To section
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Bill To:', 20, yPosition);
    doc.setFontSize(10);
    if (invoice.order?.customer) {
      yPosition += 6;
      doc.text(invoice.order.customer.name, 20, yPosition);
      yPosition += 5;
      doc.text(invoice.order.customer.email, 20, yPosition);
      yPosition += 5;
      doc.text(invoice.order.customer.phone, 20, yPosition);
      yPosition += 5;
      doc.text(invoice.order.customer.address, 20, yPosition);
    }

    // Event details
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Event Details:', 120, yPosition - 10);
    doc.setFontSize(10);
    if (invoice.order) {
      yPosition -= 4;
      doc.text(`Type: ${invoice.order.event_type}`, 120, yPosition);
      yPosition += 5;
      doc.text(`Date: ${new Date(invoice.order.event_date).toLocaleDateString()}`, 120, yPosition);
      yPosition += 5;
      doc.text(`Guests: ${invoice.order.guest_count}`, 120, yPosition);
      yPosition += 5;
      doc.text(`Venue: ${invoice.order.venue}`, 120, yPosition);
    }

    // Line items table
    yPosition += 15;
    const tableTop = yPosition;
    doc.line(20, tableTop, pageWidth - 20, tableTop);

    yPosition += 5;
    doc.setFontSize(11);
    doc.text('Item', 20, yPosition);
    doc.text('Qty', 100, yPosition);
    doc.text('Price', 130, yPosition);
    doc.text('Subtotal', pageWidth - 40, yPosition, { align: 'right' });

    yPosition += 5;
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    // Items
    yPosition += 5;
    doc.setFontSize(10);
    if (invoice.order?.orderItems && invoice.order.orderItems.length > 0) {
      invoice.order.orderItems.forEach((item) => {
        const itemName = item.menuItem?.name || 'Menu Item';
        const subtotal = item.quantity * item.unit_price;

        // Wrap long item names
        const itemLines = doc.splitTextToSize(itemName, 70);
        itemLines.forEach((line: string, index: number) => {
          if (index === 0) {
            doc.text(line, 20, yPosition);
            doc.text(item.quantity.toString(), 100, yPosition);
            doc.text(`₹${item.unit_price.toFixed(2)}`, 130, yPosition);
            doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
          } else {
            yPosition += 4;
            doc.text(line, 20, yPosition);
          }
        });

        yPosition += 6;
      });
    }

    // Totals section
    yPosition += 2;
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 6;

    const labelX = 130;
    const valueX = pageWidth - 20;

    doc.setFontSize(11);
    doc.text('Subtotal:', labelX, yPosition);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, valueX, yPosition, { align: 'right' });

    yPosition += 6;
    doc.text('Tax (8%):', labelX, yPosition);
    doc.text(`₹${invoice.tax_amount.toFixed(2)}`, valueX, yPosition, { align: 'right' });

    yPosition += 8;
    doc.setFontSize(12);
    doc.text('Total:', labelX, yPosition);
    doc.text(`₹${invoice.total.toFixed(2)}`, valueX, yPosition, { align: 'right' });

    yPosition += 5;
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    // Status
    yPosition += 6;
    doc.setFontSize(11);
    const statusText = `Status: ${invoice.status}`;
    doc.text(statusText, pageWidth - 20, yPosition, { align: 'right' });

    // Terms and conditions
    yPosition += 15;
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', 20, yPosition);
    yPosition += 5;
    doc.setFontSize(9);

    const terms = [
      '1. 50% advance payment required for confirmation.',
      '2. Balance payment due within 7 days of event completion.',
      '3. Cancellations within 48 hours are non-refundable.',
    ];

    terms.forEach((term) => {
      const lines = doc.splitTextToSize(term, pageWidth - 40);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 4;
      });
    });

    // Footer
    yPosition = pageHeight - 15;
    doc.setFontSize(9);
    const footerText = 'Thank you for choosing Delight Caterers. We look forward to serving you again!';
    const footerLines = doc.splitTextToSize(footerText, pageWidth - 40);
    footerLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
    });

    // Convert to buffer
    const pdfBytes = doc.output('arraybuffer');
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}
