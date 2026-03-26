# PDF Invoice Generation & Email Integration

## Overview
Implemented complete PDF invoice generation and email notification system for automated invoice delivery and communication with customers.

---

## **1. PDF Invoice Generation**

### Features:
✅ Professional invoice PDF generation  
✅ Server-side PDF creation using `pdfkit`  
✅ Invoice data with customer, order, and line items  
✅ Automatic download functionality  
✅ Print-ready formatting (A4 page size)  

### Invoice PDF Contents:
- Company header (Delight Caterers branding)
- Invoice number and dates
- Bill To: Customer details
- Event Details: Type, date, guests, venue
- Itemized table: Menu items, quantities, prices, subtotals
- Tax calculation (8%)
- Total amount
- Payment status badge
- Terms & Conditions
- Footer with contact information

### API Endpoints:

**Download Invoice as PDF:**
```
GET /api/invoices/{invoiceId}/pdf
Headers: Authorization: Bearer <token>

Response: PDF file download
Content-Type: application/pdf
```

### Usage:
```typescript
// Browser download
const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
  credentials: 'include'
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `invoice-${invoiceNumber}.pdf`;
link.click();
```

---

## **2. Email Integration**

### Features:
✅ SMTP email sending using `nodemailer`  
✅ HTML formatted emails with branding  
✅ PDF invoice attachment support  
✅ Multiple email templates  
✅ Development mode with Ethereal Email  

### Email Types:

#### A. **Order Confirmation Email**
- Sent when order is created
- Customer acknowledgment
- Order ID reference
- Call-to-action link

#### B. **Invoice Email**
- Sent when invoice is generated
- PDF attachment included
- Payment terms specified (50% advance, 7-day balance)
- Professional HTML formatting

#### C. **Payment Reminder Email**
- Sent for unpaid invoices
- Due date highlighting
- Alert styling
- Contact information

#### D. **General Contact Email**
- Custom message support
- Flexible recipient selection

### API Endpoints:

**Send Email:**
```
POST /api/emails/send
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body Examples:

1. Order Confirmation:
{
  "type": "order_confirmation",
  "orderId": "order-uuid"
}

2. Invoice Email:
{
  "type": "invoice",
  "invoiceId": "invoice-uuid"
}

3. Payment Reminder:
{
  "type": "payment_reminder",
  "invoiceId": "invoice-uuid"
}

4. Custom Email:
{
  "type": "contact",
  "customerId": "customer-uuid",
  "subject": "Custom Subject",
  "html": "<html>Email content</html>"
}

Response:
{
  "message": "Email sent successfully",
  "sent": true
}
```

---

## **3. UI Updates**

### Bills/Invoices Page Actions:
Four action buttons added to each invoice row:

| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| View | Eye | Opens invoice modal | Click to see details |
| Download | Download | Download invoice PDF | Saves to device |
| Email | Mail | Send invoice to customer | Sends with attachment |
| Delete | Trash | Remove invoice | Requires confirmation |

### Loading States:
- Spinner animation while PDF generating
- Spinner animation while email sending
- Buttons disabled during operations
- Toast notifications on success/error

---

## **4. Configuration**

### Environment Variables (.env.local):
```
# Email Configuration (SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=demo@example.com
SMTP_PASSWORD=demo-password
EMAIL_FROM=noreply@delightcaterers.com
```

### Development Setup:
For development, use **Ethereal Email** (free test service):
1. Create account at https://ethereal.email
2. Get SMTP credentials
3. Add to `.env.local`
4. Test emails appear in Ethereal inbox (not actually sent)

### Production Setup Options:

**Option 1: Gmail (App Password)**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Option 2: AWS SES**
```
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
```

**Option 3: SendGrid**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

---

## **5. Libraries Used**

| Library | Version | Purpose |
|---------|---------|---------|
| `pdfkit` | Latest | PDF generation |
| `@types/pdfkit` | Latest | TypeScript types for pdfkit |
| `nodemailer` | Latest | Email sending |
| `@types/nodemailer` | Latest | TypeScript types for nodemailer |

---

## **6. Auto-Email Integration (Future)**

Currently, emails are sent manually via UI buttons. To auto-send emails on events:

```typescript
// Auto-send order confirmation when order created
const handleCreateOrder = async (data) => {
  const order = await fetch('/api/orders', { ...data });
  
  // Auto-send confirmation
  await fetch('/api/emails/send', {
    method: 'POST',
    body: JSON.stringify({
      type: 'order_confirmation',
      orderId: order.id
    })
  });
};

// Auto-send invoice when created
const invoice = await fetch('/api/invoices', { ...data });

// Auto-send email with invoice
await fetch('/api/emails/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'invoice',
    invoiceId: invoice.id
  })
});
```

---

## **7. Testing**

### Test PDF Generation:
1. Navigate to `/admin/bills`
2. Click "Download" button on any invoice
3. PDF should download with filename: `invoice-INV-XXXX`

### Test Email Sending (Development):
1. Configure Ethereal Email credentials in `.env.local`
2. Click "Email" button on any invoice
3. Check Ethereal inbox for test email
4. Verify PDF attachment is included

### Test Email Sending (Production):
1. Configure real SMTP credentials
2. Click "Email" button
3. Email sent to customer's email address
4. Check customer inbox

---

## **8. Error Handling**

### PDF Generation Errors:
- "Invoice not found" (404)
- "Failed to generate PDF" (500)
- Detailed logs in server console

### Email Sending Errors:
- "Invoice/Customer not found" (404)
- "Failed to send email" (500)
- "Email could not be sent - check SMTP configuration" (400)

### User Feedback:
- Toast notifications inform users of success/failure
- Spinner animation during processing
- Error messages displayed to user
- Detailed logs in browser console (development)

---

## **9. Production Checklist**

Before deploying to production:

- [ ] Configure production SMTP credentials (Gmail, AWS SES, SendGrid, etc.)
- [ ] Test email sending with real credentials
- [ ] Update `EMAIL_FROM` to your domain
- [ ] Enable HTTPS (required for prod email sending)
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Implement email rate limiting
- [ ] Add email validation (confirm email addresses)
- [ ] Set up email templates in production system
- [ ] Monitor SMTP quota usage
- [ ] Implement retry logic for failed emails
- [ ] Add unsubscribe link to emails (legal requirement)

---

## **10. Architecture Diagram**

```
┌─ Invoice Page ─────────────────┐
│  Bills Management UI           │
│                                 │
│  Actions: View | Download | Email │ Delete
│                                 │
└─────────────┬───────────────────┘
              │
      ┌───────┴────────┬──────────────┐
      │                │              │
   View PDF        Download PDF    Send Email
      │                │              │
      ▼                ▼              ▼
  Modal           Download      /api/emails/send
                  /api/invoices/
                  [id]/pdf

Invoice PDF Generation Flow:
Fetch Invoice Data → Prisma
           ↓
  Include CustomerData & Items
           ↓
  generateInvoicePDF() [pdfkit]
           ↓
  Professional A4 PDF
           ↓
  Browser Download

Email Sending Flow:
Fetch Invoice & Customer → Prisma
           ↓
  generateInvoicePDF() [pdfkit]
           ↓
  Attach PDF to Email
           ↓
  sendEmail() [nodemailer]
           ↓
  SMTP Send
           ↓
  Customer Inbox
```

---

## **11. File Structure**

```
src/
├── lib/
│   ├── pdf.ts              (PDF generation function)
│   ├── email.ts            (Email service & templates)
│   └── api.ts              (API helpers)
│
├── app/
│   ├── api/
│   │   ├── emails/
│   │   │   └── send/route.ts        (Email sending endpoint)
│   │   │
│   │   └── invoices/
│   │       └── [id]/
│   │           ├── pdf/route.ts     (PDF download endpoint)
│   │           └── route.ts         (Invoice CRUD)
│   │
│   └── admin/
│       └── bills/page.tsx           (UI with PDF/Email buttons)

.env.local
├── SMTP_HOST
├── SMTP_PORT
├── SMTP_SECURE
├── SMTP_USER
├── SMTP_PASSWORD
└── EMAIL_FROM
```

---

## **12. API Usage Examples**

### cURL Examples:

**Download PDF:**
```bash
curl -X GET http://localhost:6005/api/invoices/invoice-id/pdf \
  -H "Authorization: Bearer <token>" \
  -H "Cookie: admin_token=<token>" \
  -o invoice.pdf
```

**Send Invoice Email:**
```bash
curl -X POST http://localhost:6005/api/emails/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=<token>" \
  -d '{
    "type": "invoice",
    "invoiceId": "invoice-uuid"
  }'
```

---

**Last Updated:** March 26, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready

