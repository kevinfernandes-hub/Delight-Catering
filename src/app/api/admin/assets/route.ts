import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.imageAsset.findMany();
    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('Assets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, url, title } = body;
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const updated = await prisma.imageAsset.upsert({
      where: { key },
      update: { url, title },
      create: { key, url, title }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Assets PUT error:', error);
    return NextResponse.json({ error: 'Failed to update asset', details: error.message }, { status: 500 });
  }
}
