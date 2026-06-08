import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getUserIdFromSession } from '@/lib/auth';
import { isRateLimited } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    // Auth guard — must be logged in to upload
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 uploads per 10 minutes per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const { limited, resetTime } = isRateLimited(ip, 'upload', { limit: 10, windowMs: 10 * 60 * 1000 });
    if (limited) {
      return NextResponse.json({ success: false, error: 'Too many uploads. Please wait before uploading again.' }, {
        status: 429,
        headers: { 'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString() }
      });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    // Convert the file to a base64 string for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'lost-and-found',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });


    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
