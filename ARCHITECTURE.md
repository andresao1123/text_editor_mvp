# Architecture Note: DocFlow

## 1. Executive Summary & Design Priorities

DocFlow is a collaborative rich-text document application inspired by Google Docs, built with **Node.js 24**, **TypeScript**, **Next.js (App Router)**, **TipTap 3**, and **SQLite (native WAL mode)**.

When architecting DocFlow under the time and capability constraints, we prioritized:
1. **Frictionless Document Experience**: Fast rich-text editing with full typography support (headings, bold, italic, underline, lists, quotes, code blocks) and real-time auto-saving.
2. **First-Class File Ingestion**: Seamless ingestion of Markdown (`.md`), Microsoft Word (`.docx`), and plain text (`.txt`) files, converting them directly into editable formatted documents.
3. **Transparent Sharing & Permissions**: Clear distinction between **Owner**, **Editor**, and **Viewer** roles, enforced on every database query and mutation, paired with an instant persona switcher so reviewers can test multi-user collaboration in seconds without login barriers.
4. **Zero-Friction Durability**: SQLite with Write-Ahead Logging (`WAL`), ensuring instant local and container persistence without requiring an external database cluster setup.
5. **Aesthetic & Responsive Excellence**: Pure Vanilla CSS design system with dark/light themes, Google Fonts (`Inter` & `Plus Jakarta Sans`), glassmorphic panels, and zero heavy styling dependencies.

---

## 2. Core System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  - TipTap ProseMirror Core (Headless Rich-Text Engine)      │
│  - UserContext (Active Persona, Demo Switcher, Theme State) │
│  - Modern Vanilla CSS Design Tokens (Dark / Light)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / FormData HTTP
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Route Layer                   │
│  - /api/documents (List / Create)                           │
│  - /api/documents/[id] (Read / Update / Delete)             │
│  - /api/documents/[id]/share (Collaborators & Roles)        │
│  - /api/upload (DOCX, Markdown, TXT Conversion via Mammoth) │
│  - Zod Request Schema Validation                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Persistence Layer (SQLite)                  │
│  - Node 24 native node:sqlite DatabaseSync                  │
│  - Tables: users, documents, document_shares, attachments   │
│  - Foreign keys, CASCADE constraints, and indexes           │
│  - Local file: data/docflow.db (WAL Mode)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Technical Decisions & Rationale

### A. TipTap 3 over Standard Textareas or Simple ContentEditable
- **Why**: Standard `contentEditable` produces inconsistent HTML cross-browser and lacks undo/redo stacks, structured heading trees, and atomic list operations. TipTap provides an enterprise-grade headless ProseMirror core with strict schema validation, markdown/HTML serialization, and full TypeScript typings.
- **Trade-off**: Higher bundle size compared to plain textarea, but essential for a genuine Google Docs-like editing experience.

### B. Node 24 Native `node:sqlite` (`DatabaseSync`)
- **Why**: Zero external native C++ compilation dependencies (avoiding Python / node-gyp build failures common on Windows and varied CI environments). Provides synchronous, high-throughput, ACID-compliant persistence directly to disk.
- **Trade-off**: Requires Node 22.5.0+, which is standard in 2025/2026 runtimes.

### C. Role-Based Access Control (RBAC) Matrix
Every API request checks permissions based on the active user identity (`x-user-id`):
| Action | Owner | Editor | Viewer | Unshared User |
| :--- | :---: | :---: | :---: | :---: |
| View document | ✅ | ✅ | ✅ | ❌ (404/403) |
| Edit content | ✅ | ✅ | ❌ (403) | ❌ (403) |
| Rename title | ✅ | ✅ | ❌ (403) | ❌ (403) |
| Share with others | ✅ | ❌ (403) | ❌ (403) | ❌ (403) |
| Delete document | ✅ | ❌ (403) | ❌ (403) | ❌ (403) |

- On the client side, if a user has the `Viewer` role, the editor automatically initializes with `editable: false`, renders a warning banner, and disables formatting controls.
- On the server side, attempts to update or delete without appropriate permissions are rejected with `403 Forbidden`.

### D. File Conversion Pipeline
- **DOCX**: Extracted with `mammoth.convertToHtml` to preserve headings, lists, bold, and italic styles while stripping binary metadata.
- **Markdown**: Parsed with `marked` into semantic HTML tags.
- **Plain Text**: Split into paragraphs and wrapped in `<p>` blocks.
- Users can choose either to create a new document from the file or to append/insert its content directly into their active draft.

---

## 4. What Was De-prioritized and Future Roadmap

1. **Real-time WebSockets / CRDTs (Yjs)**:
   - *Why de-prioritized*: Full Yjs / WebSocket sync requires WebRTC or dedicated WebSocket servers, introducing complexity beyond the scope of a fast, reliable MVP.
   - *Current solution*: Fast debounced HTTP auto-save (1 second) with optimistic save status indicators.
2. **Full OAuth2 / Auth0**:
   - *Why de-prioritized*: OAuth redirects and email verification slow down external reviewers.
   - *Current solution*: 1-click persona switcher (Alex, Beatrice, Charlie) with persistent user context + custom user registration, allowing reviewers to verify multi-user sharing in seconds.

---

## 5. AI-Native Workflow Reflection

A candid breakdown of AI tooling, acceleration points, rejected/modified suggestions, and reliability verification methods is documented in [AI_WORKFLOW.md](file:///d:/Portfolio/Ajaja%20test/AI_WORKFLOW.md).

