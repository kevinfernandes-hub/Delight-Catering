import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const videos = await prisma.galleryVideo.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(videos);
  } catch (error: any) {
    console.error('Videos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title } = body;
    
    if (!url || !title) {
      return NextResponse.json({ error: 'URL and title are required' }, { status: 400 });
    }

    const newVideo = await prisma.galleryVideo.create({
      data: { url, title }
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error: any) {
    console.error('Videos POST error:', error);
    return NextResponse.json({ error: 'Failed to add video', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    await prisma.galleryVideo.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    console.error('Videos DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete video', details: error.message }, { status: 500 });
  }
}
