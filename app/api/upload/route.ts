import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// Client-upload token route.
// The browser uploads the file DIRECTLY to Vercel Blob (bypassing the 4.5 MB
// serverless body limit); this route only verifies the user and signs the upload.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only an authenticated admin may upload.
        const session = await getSession();
        if (!session || session.role !== 'admin') {
          throw new Error('Forbidden');
        }
        return {
          access: 'public',
          addRandomSuffix: true,
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB per photo
        };
      },
      onUploadCompleted: async () => {
        // The browser saves the returned URL to the project record itself,
        // so nothing is required here.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 400 },
    );
  }
}
