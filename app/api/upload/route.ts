import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId') as string;

  if (!file || !projectId) {
    return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 });
  }

  try {
    const blob = await put(
      `projects/${projectId}/${Date.now()}-${file.name}`,
      file,
      { access: 'public' }
    );
    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Upload error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
