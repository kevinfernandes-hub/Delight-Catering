import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const filter = category ? { category, active: true } : { active: true };

    const packages = await prisma.menuPackage.findMany({
      where: filter,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, items } = body;

    if (!name || !price || !category || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create package with items
    const pkg = await prisma.menuPackage.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        items: {
          create: items.map((item: any) => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
