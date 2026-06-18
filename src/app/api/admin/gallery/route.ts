import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title } = body;
    
    if (!url || !title) {
      return NextResponse.json({ error: 'URL and title are required' }, { status: 400 });
    }

    const newImage = await prisma.galleryImage.create({
      data: { url, title }
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error: any) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Failed to add gallery image', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    
    if (!id) {
      // Fallback to body
      try {
        const body = await request.json();
        id = body.id;
      } catch (_) {
        // ignore JSON parsing errors if body is empty
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await prisma.galleryImage.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Gallery image deleted successfully' });
  } catch (error: any) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete gallery image', details: error.message }, { status: 500 });
  }
}
