import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentShares,
  getUserRoleForDocument,
  shareDocument,
  removeDocumentShare,
  getUserByEmail,
  getUserById,
} from '@/lib/db/repository';
import { shareDocumentSchema } from '@/lib/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = req.headers.get('x-user-id') || 'user-alex';

    const role = getUserRoleForDocument(id, userId);
    if (!role) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    const shares = getDocumentShares(id);
    return NextResponse.json({ shares, userRole: role });
  } catch (error) {
    console.error('Error fetching document shares:', error);
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUserId = req.headers.get('x-user-id') || 'user-alex';

    const role = getUserRoleForDocument(id, currentUserId);
    if (!role) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (role !== 'owner') {
      return NextResponse.json(
        { error: 'Only the document owner can manage sharing permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = shareDocumentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let targetUserId = validated.data.userId;
    if (!targetUserId && validated.data.email) {
      const user = getUserByEmail(validated.data.email);
      if (!user) {
        return NextResponse.json(
          { error: `User with email "${validated.data.email}" not found` },
          { status: 404 }
        );
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'You are already the document owner' }, { status: 400 });
    }

    const share = shareDocument(id, targetUserId, validated.data.role);
    return NextResponse.json({ share }, { status: 200 });
  } catch (error) {
    console.error('Error sharing document:', error);
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUserId = req.headers.get('x-user-id') || 'user-alex';

    const role = getUserRoleForDocument(id, currentUserId);
    if (role !== 'owner') {
      return NextResponse.json(
        { error: 'Only the document owner can revoke access' },
        { status: 403 }
      );
    }

    const targetUserId = req.nextUrl.searchParams.get('userId');
    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    removeDocumentShare(id, targetUserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing share:', error);
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}
