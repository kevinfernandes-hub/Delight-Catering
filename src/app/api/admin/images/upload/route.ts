import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Save to public/uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      // Sanitize filename and append timestamp for uniqueness
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(uploadsDir, filename);

      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: fileUrl });
    } catch (fsError: any) {
      console.warn('Disk write failed, falling back to base64 encoding:', fsError?.message || fsError);
      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      const fileUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: fileUrl });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file upload', details: error.message || String(error) }, { status: 500 });
  }
}



