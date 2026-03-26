import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

// Initialize email transporter
function getTransporter(): Transporter {
  if (transporter) return transporter;

  // Use SMTP configuration from environment
  // For development, configure fake SMTP (ethereal) or use Gmail App Password
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'demo@example.com',
      pass: process.env.SMTP_PASSWORD || 'demo-password',
    },
  };

  transporter = nodemailer.createTransport(emailConfig);
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

// Send email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@delightcaterers.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Email templates
export function getOrderConfirmationEmail(customerName: string, orderId: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #111; color: #C9A84C; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; color: #666; font-size: 12px; }
          .button { background: #C9A84C; color: #000; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Delight Caterers</p>
          </div>
          
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <p>Your order has been successfully created and confirmed.</p>
            
            <p><strong>Order ID:</strong> #${orderId}</p>
            
            <p>Our team will contact you shortly with additional details about your event.</p>
            
            <p>If you have any questions, please feel free to reach out to us.</p>
            
            <p><a href="https://www.delightcaterers.com" class="button">View Order Details</a></p>
          </div>
          
          <div class="footer">
            <p>Delight Caterers | Exquisite Culinary Experiences</p>
            <p>Flat No 2, Shakun Apartment, Sheela Nagar Colony | Katol Road, Nagpur</p>
            <p>Phone: 9689330035 | Email: merwynfernandes2015@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getInvoiceEmail(customerName: string, invoiceNumber: string, totalAmount: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #111; color: #C9A84C; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; color: #666; font-size: 12px; }
          .amount { font-size: 24px; font-weight: bold; color: #C9A84C; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice Generated</h1>
            <p>Delight Caterers</p>
          </div>
          
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <p>Your invoice has been generated for your catering order.</p>
            
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Total Amount:</strong> <span class="amount">₹${totalAmount.toFixed(2)}</span></p>
            
            <p><strong>Payment Terms:</strong> 50% advance required for confirmation, balance due within 7 days of event completion.</p>
            
            <p>Please find the detailed invoice attached to this email.</p>
            
            <p>Thank you for choosing Delight Caterers!</p>
          </div>
          
          <div class="footer">
            <p>Delight Caterers | Exquisite Culinary Experiences</p>
            <p>Flat No 2, Shakun Apartment, Sheela Nagar Colony | Katol Road, Nagpur</p>
            <p>Phone: 9689330035 | Email: merwynfernandes2015@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPaymentReminderEmail(customerName: string, invoiceNumber: string, dueDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #111; color: #C9A84C; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; color: #666; font-size: 12px; }
          .alert { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
            <p>Delight Caterers</p>
          </div>
          
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <div class="alert">
              <strong>⚠️ Invoice Payment Reminder</strong><br>
              Invoice <strong>${invoiceNumber}</strong> is due on <strong>${dueDate}</strong>
            </div>
            
            <p>This is a friendly reminder that payment for your invoice is due soon.</p>
            
            <p>Please arrange the payment at your earliest convenience to avoid any inconvenience.</p>
            
            <p>For payment details or any queries, please contact us.</p>
          </div>
          
          <div class="footer">
            <p>Delight Caterers | Exquisite Culinary Experiences</p>
            <p>Phone: 9689330035 | Email: merwynfernandes2015@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
