import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'docflow.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL and foreign keys
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  initSchema(db);
  seedDemoData(db);

  dbInstance = db;
  return dbInstance;
}

export function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      plain_text TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_shares (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('viewer', 'editor')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(document_id, user_id),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_attachments (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_docs_owner ON documents(owner_id);
    CREATE INDEX IF NOT EXISTS idx_shares_doc ON document_shares(document_id);
    CREATE INDEX IF NOT EXISTS idx_shares_user ON document_shares(user_id);
  `);
}

export function seedDemoData(db: DatabaseSync): void {
  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | undefined;
  if (userCountRow && userCountRow.count > 0) {
    return;
  }

  const now = Date.now();

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('user-alex', 'Alex Carter', 'alex@docflow.dev', 'AC', now);
  insertUser.run('user-beatrice', 'Beatrice Vance', 'beatrice@docflow.dev', 'BV', now);
  insertUser.run('user-charlie', 'Charlie Davis', 'charlie@docflow.dev', 'CD', now);

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, title, content_html, plain_text, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const alexDocContent = `
    <h1>🚀 DocFlow Product Launch Plan</h1>
    <p>Welcome to <strong>DocFlow</strong>, the modern collaborative document editor inspired by Google Docs.</p>
    <h2>Key Capabilities</h2>
    <ul>
      <li><strong>Rich-text editing</strong>: Bold, italics, underline, headings, lists, quotes, and code blocks.</li>
      <li><strong>File upload & import</strong>: Turn Markdown, TXT, and DOCX files into documents.</li>
      <li><strong>Role-based sharing</strong>: Grant <em>Viewer</em> or <em>Editor</em> permissions seamlessly.</li>
      <li><strong>Instant persistence</strong>: Fully backed by SQLite with auto-save.</li>
    </ul>
    <blockquote>"Simplicity is the ultimate sophistication." — Leonardo da Vinci</blockquote>
    <p>Feel free to rename this document, edit the text, or click <strong>Share</strong> to invite your teammates.</p>
  `.trim();

  const beatriceDocContent = `
    <h1>📐 System Architecture & Specs</h1>
    <p>This technical specification outlines the core mechanics of our cloud persistence layer.</p>
    <h2>Architecture Overview</h2>
    <ol>
      <li>Node.js 24 + TypeScript with native SQLite engine.</li>
      <li>TipTap 3 headless ProseMirror core for rock-solid formatting.</li>
      <li>Zod schema validation on all API route endpoints.</li>
    </ol>
    <pre><code>// Clean access check example
if (role !== 'owner' && role !== 'editor') {
  return Response.json({ error: 'Permission denied' }, { status: 403 });
}</code></pre>
  `.trim();

  const charlieDocContent = `
    <h1>📊 Q3 Marketing Strategy & Metrics</h1>
    <p>This document is shared with you as <u>Viewer</u> to review campaign highlights.</p>
    <h2>Goals & Milestones</h2>
    <ul>
      <li>Target 10,000 monthly active collaborative editors.</li>
      <li>Community engagement through live templates and file imports.</li>
    </ul>
  `.trim();

  insertDoc.run('doc-launch-plan', '🚀 DocFlow Product Launch Plan', alexDocContent, 'Welcome to DocFlow...', 'user-alex', now - 3600000, now - 3600000);
  insertDoc.run('doc-architecture', '📐 System Architecture & Specs', beatriceDocContent, 'This technical specification...', 'user-beatrice', now - 7200000, now - 7200000);
  insertDoc.run('doc-marketing', '📊 Q3 Marketing Strategy & Metrics', charlieDocContent, 'This document is shared with you...', 'user-charlie', now - 10800000, now - 10800000);

  const insertShare = db.prepare(`
    INSERT INTO document_shares (id, document_id, user_id, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Beatrice shared Architecture with Alex as EDITOR
  insertShare.run('share-1', 'doc-architecture', 'user-alex', 'editor', now, now);

  // Charlie shared Marketing with Alex as VIEWER
  insertShare.run('share-2', 'doc-marketing', 'user-alex', 'viewer', now, now);

  // Alex shared Launch Plan with Beatrice as EDITOR and Charlie as VIEWER
  insertShare.run('share-3', 'doc-launch-plan', 'user-beatrice', 'editor', now, now);
  insertShare.run('share-4', 'doc-launch-plan', 'user-charlie', 'viewer', now, now);
}
