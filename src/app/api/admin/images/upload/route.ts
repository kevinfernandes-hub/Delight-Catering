import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique filename using timestamp and a random string
    const originalName = file.name || 'image.jpg';
    const ext = originalName.split('.').pop() || 'jpg';
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const filePath = join(uploadDir, filename);
    
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image', details: error.message }, { status: 500 });
  }
}
