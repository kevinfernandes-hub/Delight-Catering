import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to Base64 Data URI
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const fileUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image', details: error.message }, { status: 500 });
  }
}

