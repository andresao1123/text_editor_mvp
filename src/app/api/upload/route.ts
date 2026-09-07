import { NextRequest, NextResponse } from 'next/server';
import { parseFileContent } from '@/lib/parser';
import { createDocument } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'user-alex';
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const shouldCreateDoc = formData.get('createDocument') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseFileContent(file.name, buffer);

    if (shouldCreateDoc) {
      const newDoc = createDocument(
        parsed.title,
        parsed.contentHtml,
        parsed.plainText,
        userId
      );
      return NextResponse.json({ document: newDoc }, { status: 201 });
    }

    return NextResponse.json({
      title: parsed.title,
      contentHtml: parsed.contentHtml,
      plainText: parsed.plainText,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
