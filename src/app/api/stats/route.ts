import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      revenueData, 
      customersCount, 
      recentOrders,
      pendingInvoicesCount,
      todayOrdersCount
    ] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { 
          status: 'Paid',
          created_at: { gte: firstDayOfMonth }
        }
      }),
      prisma.customer.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { customer: true }
      }),
      prisma.invoice.count({
        where: { status: 'Unpaid' }
      }),
      prisma.order.count({
        where: { created_at: { gte: today } }
      })
    ]);

    const stats = {
      revenue: revenueData?._sum?.total || 0,
      todayOrdersCount,
      customersCount,
      recentOrders: recentOrders || [],
      pendingInvoicesCount
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
