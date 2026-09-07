import { getDatabase } from './index';
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
export function getAllUsers(): User[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users ORDER BY name ASC');
  return stmt.all() as unknown as User[];
}

export function getUserById(id: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?');
  const result = stmt.get(id);
  return (result as unknown as User) || null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE LOWER(email) = LOWER(?)');
  const result = stmt.get(email);
  return (result as unknown as User) || null;
}

export function createUser(name: string, email: string): User {
  const db = getDatabase();
  const id = `user-${crypto.randomUUID()}`;
  const now = Date.now();
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, name, email, initials, now);

  return { id, name, email, avatar_url: initials, created_at: now };
}

// Document Queries
export function getDocumentsForUser(userId: string): {
  owned: DocumentWithRole[];
  shared: DocumentWithRole[];
} {
  const db = getDatabase();

  const ownedStmt = db.prepare(`
    SELECT 
      d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
      'owner' as user_role,
      u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
      (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
    FROM documents d
    JOIN users u ON d.owner_id = u.id
    WHERE d.owner_id = ?
    ORDER BY d.updated_at DESC
  `);

  const sharedStmt = db.prepare(`
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
  `);

  const owned = (ownedStmt.all(userId) as unknown as DocumentWithRole[]).map(row => ({
    ...row,
    collaborators_count: Number(row.collaborators_count)
  }));
  const shared = (sharedStmt.all(userId) as unknown as DocumentWithRole[]).map(row => ({
    ...row,
    collaborators_count: Number(row.collaborators_count)
  }));

  return { owned, shared };
}

export function getUserRoleForDocument(documentId: string, userId: string): UserRole | null {
  const db = getDatabase();

  const doc = db.prepare('SELECT owner_id FROM documents WHERE id = ?').get(documentId) as { owner_id: string } | undefined;
  if (!doc) return null;

  if (doc.owner_id === userId) return 'owner';

  const share = db.prepare('SELECT role FROM document_shares WHERE document_id = ? AND user_id = ?').get(documentId, userId) as { role: 'editor' | 'viewer' } | undefined;
  if (share) return share.role;

  return null;
}

export function getDocumentById(documentId: string, userId: string): DocumentWithRole | null {
  const role = getUserRoleForDocument(documentId, userId);
  if (!role) return null;

  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
      u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
      (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
    FROM documents d
    JOIN users u ON d.owner_id = u.id
    WHERE d.id = ?
  `);

  const result = stmt.get(documentId) as unknown as (Document & {
    owner_name: string;
    owner_email: string;
    owner_avatar: string | null;
    collaborators_count: number;
  }) | undefined;

  if (!result) return null;

  return {
    ...result,
    user_role: role,
    collaborators_count: Number(result.collaborators_count)
  };
}

export function createDocument(
  title: string,
  contentHtml: string = '<p></p>',
  plainText: string = '',
  ownerId: string
): Document {
  const db = getDatabase();
  const id = `doc-${crypto.randomUUID()}`;
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO documents (id, title, content_html, plain_text, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, title, contentHtml, plainText, ownerId, now, now);

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

export function updateDocument(
  documentId: string,
  updates: {
    title?: string;
    contentHtml?: string;
    plainText?: string;
  }
): boolean {
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

  const stmt = db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return true;
}

export function deleteDocument(documentId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  stmt.run(documentId);
  return true;
}

// Sharing Queries
export function getDocumentShares(documentId: string): ShareInfo[] {
  const db = getDatabase();
  const stmt = db.prepare(`
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
  `);

  return stmt.all(documentId) as unknown as ShareInfo[];
}

export function shareDocument(
  documentId: string,
  userId: string,
  role: 'editor' | 'viewer'
): ShareInfo {
  const db = getDatabase();
  const now = Date.now();
  const id = `share-${crypto.randomUUID()}`;

  const stmt = db.prepare(`
    INSERT INTO document_shares (id, document_id, user_id, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(document_id, user_id) DO UPDATE SET
      role = excluded.role,
      updated_at = excluded.updated_at
  `);

  stmt.run(id, documentId, userId, role, now, now);

  const user = getUserById(userId)!;
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

export function removeDocumentShare(documentId: string, userId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM document_shares WHERE document_id = ? AND user_id = ?');
  stmt.run(documentId, userId);
  return true;
}
