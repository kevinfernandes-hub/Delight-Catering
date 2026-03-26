import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.menuPackage.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, category, items, active } = body;

    // Delete existing items
    await prisma.packageItem.deleteMany({
      where: { package_id: id },
    });

    // Update package with new items
    const pkg = await prisma.menuPackage.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        active: active !== undefined ? active : true,
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

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.menuPackage.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Package deleted' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
