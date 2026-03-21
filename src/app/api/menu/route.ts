import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateMenuItemSchema } from '@/lib/validations';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = CreateMenuItemSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const item = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        unit: data.unit,
        available: data.available,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
