import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: true
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Order API received body:', body);
    
    const { 
      customer_id, 
      customer_name, 
      customer_email, 
      customer_phone,
      event_type, 
      event_date, 
      guest_count, 
      total_amount, 
      venue, 
      notes, 
      orderItems,
      items // alternative name for items array
    } = body;

    console.log('Extracted fields:', { customer_name, customer_email, customer_phone });

    // Either use existing customer_id or create new customer
    let finalCustomerId = customer_id;
    
    if (!finalCustomerId && customer_name) {
      console.log('Creating/finding customer...');
      // Create customer if not exists
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          phone: customer_phone
        }
      });

      if (existingCustomer) {
        console.log('Found existing customer:', existingCustomer.id);
        finalCustomerId = existingCustomer.id;
      } else {
        console.log('Creating new customer...');
        const newCustomer = await prisma.customer.create({
          data: {
            name: customer_name,
            email: customer_email || `${customer_phone}@menu-order.local`,
            phone: customer_phone || '',
            address: 'To be confirmed'
          }
        });
        console.log('Created new customer:', newCustomer.id);
        finalCustomerId = newCustomer.id;
      }
    }

    if (!finalCustomerId) {
      console.log('No customer ID available');
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 });
    }

    console.log('Creating order with customer_id:', finalCustomerId);

    // Create order
    const order = await prisma.order.create({
      data: {
        customer_id: finalCustomerId,
        event_type,
        event_date: new Date(event_date),
        guest_count: parseInt(guest_count),
        total_amount: parseFloat(total_amount),
        venue: venue || '',
        status: 'Pending',
        notes: notes || ''
      }
    });

    console.log('Order created:', order.id);

    // Add order items if provided (support both 'items' and 'orderItems')
    const itemsArray = items || orderItems || [];
    console.log('Items array:', itemsArray);
    
    if (itemsArray && Array.isArray(itemsArray) && itemsArray.length > 0) {
      console.log('Processing order items...');
      // For menu items without existing unit_price, calculate from menu
      const itemsToCreate = await Promise.all(
        itemsArray.map(async (item: any) => {
          if (item.unit_price) {
            return {
              order_id: order.id,
              menu_id: item.menu_id,
              quantity: parseInt(item.quantity),
              unit_price: parseFloat(item.unit_price)
            };
          } else {
            // Fetch menu item price
            const menuItem = await prisma.menuItem.findUnique({
              where: { id: item.menu_id }
            });
            console.log('Menu item price for', item.menu_id, ':', menuItem?.price);
            return {
              order_id: order.id,
              menu_id: item.menu_id,
              quantity: parseInt(item.quantity),
              unit_price: menuItem?.price || 0
            };
          }
        })
      );

      console.log('Creating order items:', itemsToCreate.length);
      await prisma.orderItem.createMany({
        data: itemsToCreate
      });
    }

    // Automatically generate invoice
    const subtotal = total_amount / 1.05; // 5% GST
    const tax_amount = total_amount - subtotal;
    
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { created_at: 'desc' },
      take: 1
    });
    const invoiceNumber = `INV-${String(1001 + (lastInvoice ? parseInt(lastInvoice.invoice_number.split('-')[1]) : 0)).padStart(4, '0')}`;

    console.log('Creating invoice with number:', invoiceNumber);

    await prisma.invoice.create({
      data: {
        order_id: order.id,
        invoice_number: invoiceNumber,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subtotal,
        tax_amount,
        total: total_amount,
        status: 'Unpaid'
      }
    });

    // Return order with items
    const createdOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true, customer: true }
    });

    console.log('Order successfully created:', createdOrder?.id);
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: (error as any).message,
      stack: (error as any).stack 
    }, { status: 500 });
  }
}
