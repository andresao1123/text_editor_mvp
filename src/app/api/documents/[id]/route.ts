import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentById,
  getUserRoleForDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/db/repository';
import { updateDocumentSchema } from '@/lib/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = req.headers.get('x-user-id') || 'user-alex';

    const doc = getDocumentById(id, userId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = req.headers.get('x-user-id') || 'user-alex';

    const role = getUserRoleForDocument(id, userId);
    if (!role) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    if (role !== 'owner' && role !== 'editor') {
      return NextResponse.json(
        { error: 'Viewers have read-only access and cannot edit this document' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateDocumentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    updateDocument(id, validated.data);
    const updated = getDocumentById(id, userId);

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = req.headers.get('x-user-id') || 'user-alex';

    const role = getUserRoleForDocument(id, userId);
    if (!role) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (role !== 'owner') {
      return NextResponse.json(
        { error: 'Only the document owner can delete this document' },
        { status: 403 }
      );
    }

    deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
