import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsForUser, createDocument } from '@/lib/db/repository';
import { createDocumentSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'user-alex';
    const { owned, shared } = getDocumentsForUser(userId);
    return NextResponse.json({ owned, shared });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'user-alex';
    const body = await req.json();

    const validated = createDocumentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const doc = createDocument(
      validated.data.title,
      validated.data.contentHtml,
      validated.data.plainText,
      userId
    );

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
