import { createClient, type Client } from '@libsql/client';

let dbInstance: Client | null = null;
let initPromise: Promise<void> | null = null;

export function getDatabase(): Client {
  if (dbInstance) {
    return dbInstance;
  }

  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

  dbInstance = isTest
    ? createClient({ url: ':memory:' })
    : createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

  return dbInstance;
}

// Llama esto una vez (por ejemplo al arrancar la app o de forma lazy en cada
// route handler) antes de hacer queries. Evita correr el schema/seed más de
// una vez por instancia gracias a initPromise.
export function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    const db = getDatabase();
    initPromise = (async () => {
      await initSchema(db);
      await seedDemoData(db);
    })();
  }
  return initPromise;
}

export async function initSchema(db: Client): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      plain_text TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS document_shares (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('viewer', 'editor')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(document_id, user_id),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS document_attachments (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_docs_owner ON documents(owner_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shares_doc ON document_shares(document_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shares_user ON document_shares(user_id)`,
  ];

  for (const sql of statements) {
    await db.execute(sql);
  }
}

export async function seedDemoData(db: Client): Promise<void> {
  const userCountResult = await db.execute('SELECT COUNT(*) as count FROM users');
  const count = userCountResult.rows[0]?.count as number | undefined;
  if (count && count > 0) {
    return;
  }

  const now = Date.now();

  const insertUser = async (id: string, name: string, email: string, avatarUrl: string) =>
    db.execute({
      sql: `INSERT INTO users (id, name, email, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [id, name, email, avatarUrl, now],
    });

  await insertUser('user-alex', 'Alex Carter', 'alex@docflow.dev', 'AC');
  await insertUser('user-beatrice', 'Beatrice Vance', 'beatrice@docflow.dev', 'BV');
  await insertUser('user-charlie', 'Charlie Davis', 'charlie@docflow.dev', 'CD');

  const insertDoc = async (
    id: string,
    title: string,
    contentHtml: string,
    plainText: string,
    ownerId: string,
    createdAt: number
  ) =>
    db.execute({
      sql: `INSERT INTO documents (id, title, content_html, plain_text, owner_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, title, contentHtml, plainText, ownerId, createdAt, createdAt],
    });

  const alexDocContent = `
    <h1>🚀 DocFlow Product Launch Plan</h1>
    <p>Welcome to <strong>DocFlow</strong>, the modern collaborative document editor inspired by Google Docs.</p>
    <h2>Key Capabilities</h2>
    <ul>
      <li><strong>Rich-text editing</strong>: Bold, italics, underline, headings, lists, quotes, and code blocks.</li>
      <li><strong>File upload & import</strong>: Turn Markdown, TXT, and DOCX files into documents.</li>
      <li><strong>Role-based sharing</strong>: Grant <em>Viewer</em> or <em>Editor</em> permissions seamlessly.</li>
      <li><strong>Instant persistence</strong>: Fully backed by Turso with auto-save.</li>
    </ul>
    <blockquote>"Simplicity is the ultimate sophistication." — Leonardo da Vinci</blockquote>
    <p>Feel free to rename this document, edit the text, or click <strong>Share</strong> to invite your teammates.</p>
  `.trim();

  const beatriceDocContent = `
    <h1>📐 System Architecture & Specs</h1>
    <p>This technical specification outlines the core mechanics of our cloud persistence layer.</p>
    <h2>Architecture Overview</h2>
    <ol>
      <li>Next.js API routes on Vercel, backed by Turso (libSQL) for persistence.</li>
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

  await insertDoc('doc-launch-plan', '🚀 DocFlow Product Launch Plan', alexDocContent, 'Welcome to DocFlow...', 'user-alex', now - 3600000);
  await insertDoc('doc-architecture', '📐 System Architecture & Specs', beatriceDocContent, 'This technical specification...', 'user-beatrice', now - 7200000);
  await insertDoc('doc-marketing', '📊 Q3 Marketing Strategy & Metrics', charlieDocContent, 'This document is shared with you...', 'user-charlie', now - 10800000);

  const insertShare = async (id: string, documentId: string, userId: string, role: 'viewer' | 'editor') =>
    db.execute({
      sql: `INSERT INTO document_shares (id, document_id, user_id, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, documentId, userId, role, now, now],
    });

  // Beatrice shared Architecture with Alex as EDITOR
  await insertShare('share-1', 'doc-architecture', 'user-alex', 'editor');
  // Charlie shared Marketing with Alex as VIEWER
  await insertShare('share-2', 'doc-marketing', 'user-alex', 'viewer');
  // Alex shared Launch Plan with Beatrice as EDITOR and Charlie as VIEWER
  await insertShare('share-3', 'doc-launch-plan', 'user-beatrice', 'editor');
  await insertShare('share-4', 'doc-launch-plan', 'user-charlie', 'viewer');
}