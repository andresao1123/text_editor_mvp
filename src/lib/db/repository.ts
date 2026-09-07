import { getDatabase, ensureInitialized } from './index';
import crypto from 'node:crypto';

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: number;
}

export interface Document {
  id: string;
  title: string;
  content_html: string;
  plain_text: string;
  owner_id: string;
  created_at: number;
  updated_at: number;
}

export interface DocumentWithRole extends Document {
  user_role: UserRole;
  owner_name: string;
  owner_email: string;
  owner_avatar: string | null;
  collaborators_count: number;
}

export interface ShareInfo {
  share_id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  role: 'editor' | 'viewer';
  created_at: number;
}

// User Queries
export async function getAllUsers(): Promise<User[]> {
  await ensureInitialized();
  const db = getDatabase();
  const result = await db.execute(
    'SELECT id, name, email, avatar_url, created_at FROM users ORDER BY name ASC'
  );
  return result.rows as unknown as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureInitialized();
  const db = getDatabase();
  const result = await db.execute({
    sql: 'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as unknown as User) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureInitialized();
  const db = getDatabase();
  const result = await db.execute({
    sql: 'SELECT id, name, email, avatar_url, created_at FROM users WHERE LOWER(email) = LOWER(?)',
    args: [email],
  });
  return (result.rows[0] as unknown as User) || null;
}

export async function createUser(name: string, email: string): Promise<User> {
  await ensureInitialized();
  const db = getDatabase();
  const id = `user-${crypto.randomUUID()}`;
  const now = Date.now();
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  await db.execute({
    sql: `INSERT INTO users (id, name, email, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)`,
    args: [id, name, email, initials, now],
  });

  return { id, name, email, avatar_url: initials, created_at: now };
}

// Document Queries
export async function getDocumentsForUser(userId: string): Promise<{
  owned: DocumentWithRole[];
  shared: DocumentWithRole[];
}> {
  await ensureInitialized();
  const db = getDatabase();

  const ownedResult = await db.execute({
    sql: `
      SELECT 
        d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
        'owner' as user_role,
        u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
        (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      WHERE d.owner_id = ?
      ORDER BY d.updated_at DESC
    `,
    args: [userId],
  });

  const sharedResult = await db.execute({
    sql: `
      SELECT 
        d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
        s.role as user_role,
        u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
        (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
      FROM documents d
      JOIN document_shares s ON d.id = s.document_id
      JOIN users u ON d.owner_id = u.id
      WHERE s.user_id = ?
      ORDER BY d.updated_at DESC
    `,
    args: [userId],
  });

  const owned = (ownedResult.rows as unknown as DocumentWithRole[]).map((row) => ({
    ...row,
    collaborators_count: Number(row.collaborators_count),
  }));
  const shared = (sharedResult.rows as unknown as DocumentWithRole[]).map((row) => ({
    ...row,
    collaborators_count: Number(row.collaborators_count),
  }));

  return { owned, shared };
}

export async function getUserRoleForDocument(
  documentId: string,
  userId: string
): Promise<UserRole | null> {
  await ensureInitialized();
  const db = getDatabase();

  const docResult = await db.execute({
    sql: 'SELECT owner_id FROM documents WHERE id = ?',
    args: [documentId],
  });
  const doc = docResult.rows[0] as unknown as { owner_id: string } | undefined;
  if (!doc) return null;

  if (doc.owner_id === userId) return 'owner';

  const shareResult = await db.execute({
    sql: 'SELECT role FROM document_shares WHERE document_id = ? AND user_id = ?',
    args: [documentId, userId],
  });
  const share = shareResult.rows[0] as unknown as { role: 'editor' | 'viewer' } | undefined;
  if (share) return share.role;

  return null;
}

export async function getDocumentById(
  documentId: string,
  userId: string
): Promise<DocumentWithRole | null> {
  const role = await getUserRoleForDocument(documentId, userId);
  if (!role) return null;

  const db = getDatabase();
  const result = await db.execute({
    sql: `
      SELECT 
        d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
        u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
        (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      WHERE d.id = ?
    `,
    args: [documentId],
  });

  const row = result.rows[0] as unknown as
    | (Document & {
      owner_name: string;
      owner_email: string;
      owner_avatar: string | null;
      collaborators_count: number;
    })
    | undefined;

  if (!row) return null;

  return {
    ...row,
    user_role: role,
    collaborators_count: Number(row.collaborators_count),
  };
}

export async function createDocument(
  title: string,
  contentHtml: string = '<p></p>',
  plainText: string = '',
  ownerId: string
): Promise<Document> {
  await ensureInitialized();
  const db = getDatabase();
  const id = `doc-${crypto.randomUUID()}`;
  const now = Date.now();

  await db.execute({
    sql: `
      INSERT INTO documents (id, title, content_html, plain_text, owner_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, title, contentHtml, plainText, ownerId, now, now],
  });

  return {
    id,
    title,
    content_html: contentHtml,
    plain_text: plainText,
    owner_id: ownerId,
    created_at: now,
    updated_at: now,
  };
}

export async function updateDocument(
  documentId: string,
  updates: {
    title?: string;
    contentHtml?: string;
    plainText?: string;
  }
): Promise<boolean> {
  await ensureInitialized();
  const db = getDatabase();
  const now = Date.now();

  const fields: string[] = ['updated_at = ?'];
  const values: (string | number)[] = [now];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.contentHtml !== undefined) {
    fields.push('content_html = ?');
    values.push(updates.contentHtml);
  }
  if (updates.plainText !== undefined) {
    fields.push('plain_text = ?');
    values.push(updates.plainText);
  }

  values.push(documentId);

  await db.execute({
    sql: `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });
  return true;
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  await ensureInitialized();
  const db = getDatabase();
  await db.execute({
    sql: 'DELETE FROM documents WHERE id = ?',
    args: [documentId],
  });
  return true;
}

// Sharing Queries
export async function getDocumentShares(documentId: string): Promise<ShareInfo[]> {
  await ensureInitialized();
  const db = getDatabase();
  const result = await db.execute({
    sql: `
      SELECT 
        s.id as share_id,
        s.document_id,
        s.user_id,
        s.role,
        s.created_at,
        u.name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar
      FROM document_shares s
      JOIN users u ON s.user_id = u.id
      WHERE s.document_id = ?
      ORDER BY s.created_at ASC
    `,
    args: [documentId],
  });

  return result.rows as unknown as ShareInfo[];
}

export async function shareDocument(
  documentId: string,
  userId: string,
  role: 'editor' | 'viewer'
): Promise<ShareInfo> {
  await ensureInitialized();
  const db = getDatabase();
  const now = Date.now();
  const id = `share-${crypto.randomUUID()}`;

  await db.execute({
    sql: `
      INSERT INTO document_shares (id, document_id, user_id, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(document_id, user_id) DO UPDATE SET
        role = excluded.role,
        updated_at = excluded.updated_at
    `,
    args: [id, documentId, userId, role, now, now],
  });

  const user = (await getUserById(userId))!;
  return {
    share_id: id,
    document_id: documentId,
    user_id: userId,
    user_name: user.name,
    user_email: user.email,
    user_avatar: user.avatar_url,
    role,
    created_at: now,
  };
}

export async function removeDocumentShare(documentId: string, userId: string): Promise<boolean> {
  await ensureInitialized();
  const db = getDatabase();
  await db.execute({
    sql: 'DELETE FROM document_shares WHERE document_id = ? AND user_id = ?',
    args: [documentId, userId],
  });
  return true;
}