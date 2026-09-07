import { describe, it, expect, beforeAll } from 'vitest';
import { getDatabase, initSchema } from '@/lib/db';
import {
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentsForUser,
  getUserRoleForDocument,
  shareDocument,
  removeDocumentShare,
  createUser,
  getUserByEmail,
} from '@/lib/db/repository';

describe('Document Persistence & Sharing Repository', () => {
  let testOwner: { id: string };
  let testCollaborator: { id: string };

  beforeAll(() => {
    // Ensure DB is initialized
    const db = getDatabase();
    initSchema(db);

    testOwner = createUser('Test Owner', `owner-${Date.now()}@example.com`);
    testCollaborator = createUser('Test Collaborator', `collab-${Date.now()}@example.com`);
  });

  it('creates a new document with title and HTML content', () => {
    const title = 'Quarterly Strategy Plan';
    const html = '<h1>Strategic Goals</h1><p>Grow revenue by 25%</p>';
    const doc = createDocument(title, html, 'Strategic Goals Grow revenue by 25%', testOwner.id);

    expect(doc.id).toBeDefined();
    expect(doc.title).toBe(title);
    expect(doc.content_html).toBe(html);
    expect(doc.owner_id).toBe(testOwner.id);

    // Verify retrieval
    const fetched = getDocumentById(doc.id, testOwner.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe(title);
    expect(fetched?.user_role).toBe('owner');
  });

  it('updates document title and content', () => {
    const doc = createDocument('Draft v1', '<p>Initial</p>', 'Initial', testOwner.id);

    const updatedTitle = 'Finalized Document';
    const updatedContent = '<p>Updated content with <strong>bold</strong> text</p>';

    updateDocument(doc.id, {
      title: updatedTitle,
      contentHtml: updatedContent,
      plainText: 'Updated content with bold text',
    });

    const fetched = getDocumentById(doc.id, testOwner.id);
    expect(fetched?.title).toBe(updatedTitle);
    expect(fetched?.content_html).toBe(updatedContent);
  });

  it('handles role-based sharing and access verification', () => {
    const doc = createDocument('Collaborative Spec', '<p>Spec</p>', 'Spec', testOwner.id);

    // Collaborator should not have access yet
    const initialRole = getUserRoleForDocument(doc.id, testCollaborator.id);
    expect(initialRole).toBeNull();
    expect(getDocumentById(doc.id, testCollaborator.id)).toBeNull();

    // Share as VIEWER
    shareDocument(doc.id, testCollaborator.id, 'viewer');
    const viewerRole = getUserRoleForDocument(doc.id, testCollaborator.id);
    expect(viewerRole).toBe('viewer');

    const viewerDoc = getDocumentById(doc.id, testCollaborator.id);
    expect(viewerDoc).not.toBeNull();
    expect(viewerDoc?.user_role).toBe('viewer');

    // Upgrade to EDITOR
    shareDocument(doc.id, testCollaborator.id, 'editor');
    const editorRole = getUserRoleForDocument(doc.id, testCollaborator.id);
    expect(editorRole).toBe('editor');

    // Revoke share
    removeDocumentShare(doc.id, testCollaborator.id);
    expect(getUserRoleForDocument(doc.id, testCollaborator.id)).toBeNull();
  });

  it('properly partitions owned vs shared documents for a user', () => {
    const doc1 = createDocument('Owner Doc 1', '<p>Doc 1</p>', 'Doc 1', testOwner.id);
    const doc2 = createDocument('Collab Doc 1', '<p>Doc 2</p>', 'Doc 2', testCollaborator.id);

    // Share doc2 with testOwner
    shareDocument(doc2.id, testOwner.id, 'editor');

    const result = getDocumentsForUser(testOwner.id);
    const ownedIds = result.owned.map((d) => d.id);
    const sharedIds = result.shared.map((d) => d.id);

    expect(ownedIds).toContain(doc1.id);
    expect(sharedIds).toContain(doc2.id);
    expect(ownedIds).not.toContain(doc2.id);
  });

  it('deletes document and cascades cleanup', () => {
    const doc = createDocument('To Delete', '<p>Delete me</p>', 'Delete me', testOwner.id);
    shareDocument(doc.id, testCollaborator.id, 'viewer');

    deleteDocument(doc.id);

    expect(getDocumentById(doc.id, testOwner.id)).toBeNull();
    expect(getDocumentById(doc.id, testCollaborator.id)).toBeNull();
    expect(getUserRoleForDocument(doc.id, testCollaborator.id)).toBeNull();
  });

  it('authenticates user by email for login lookup', () => {
    const testEmail = `login-${Date.now()}@example.com`;
    const user = createUser('Login User', testEmail);
    const found = getUserByEmail(testEmail);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(user.id);
    expect(found?.name).toBe('Login User');

    // Case-insensitive email lookup check
    const caseFound = getUserByEmail(testEmail.toUpperCase());
    expect(caseFound).not.toBeNull();
    expect(caseFound?.id).toBe(user.id);

    // Non-existent email check
    expect(getUserByEmail('nonexistent-random-user@example.com')).toBeNull();
  });
});
