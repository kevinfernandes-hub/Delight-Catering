import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    
    // Check if body is an array for bulk upload
    if (Array.isArray(body)) {
      const dataToInsert = body
        .filter((item: any) => item && item.url)
        .map((item: any) => ({
          url: item.url,
          title: item.title || '',
        }));

      if (dataToInsert.length === 0) {
        return NextResponse.json({ error: 'No valid images provided' }, { status: 400 });
      }

      const result = await prisma.galleryImage.createMany({
        data: dataToInsert
      });

      return NextResponse.json({ message: `Successfully added ${result.count} images`, count: result.count }, { status: 201 });
    }

    // Single upload
    const { url, title } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const newImage = await prisma.galleryImage.create({
      data: { url, title: title || '' }
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
