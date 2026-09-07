# DocFlow — Collaborative Rich-Text Document Editor

A full-stack rich-text document application inspired by Google Docs, built with **Node.js 24**, **TypeScript**, **Next.js (App Router)**, **TipTap 3**, and **SQLite (native WAL mode)**.

---

## ✨ Features

### 1. Document Creation & Rich-Text Editing
- **Format Options**: Headings (H1, H2, H3), **Bold**, *Italic*, <u>Underline</u>, Bulleted Lists, Numbered Lists, Blockquotes, Code Blocks, and Horizontal Dividers.
- **Inline Title Renaming**: Click document title in the header to rename with immediate auto-save.
- **Auto-Save & Status Indicator**: Debounced auto-save (1s after typing stops) with visual indicators (`Saved to cloud`, `Saving...`, `View Only`) plus `Ctrl+S` / `Cmd+S` keyboard shortcuts.
- **Word & Character Counters**: Real-time stats pill docked at bottom right.
- **Multi-Format Export**: Export any document as **PDF Document (`.pdf`)** with crisp A4 pagination and vector text, Markdown (`.md`), HTML (`.html`), or Plain Text (`.txt`).

### 2. File Upload & Document Ingestion
- **Formats Supported**: `.md`, `.txt`, `.docx` (Microsoft Word), and `.html`.
- **Ingestion Pathways**:
  - **Direct Conversion**: Upload on the dashboard to automatically parse formatting and create a new editable document.
  - **Draft Import**: Import external file content into an existing document draft directly from the editor toolbar.
- **Smart Parsing**: Converts Markdown AST (`marked`) and DOCX OpenXML (`mammoth`) into clean semantic HTML with headings, lists, and bold/italic styles intact.

### 3. Role-Based Sharing & Authentication
- **Authentication & User Management**: Full **Sign In** and **Create Account (Register)** modal with 1-click demo persona quick-picks (Alex, Beatrice, Charlie) and sign-out capabilities.
- **Document Owner**: The creator retains full control, can invite/revoke collaborators, update roles, and delete documents.
- **Editor Role**: Can edit document content, rename title, and save changes. Cannot delete or alter sharing settings.
- **Viewer Role**: Read-only access with an alert banner (`Viewing Mode: You have read-only access`). TipTap is locked in non-editable mode and formatting controls are disabled.
- **Visible Separation**: Distinct dashboard tabs for *"Owned by me"* vs *"Shared with me"*, with role pills (`Owner`, `Editor`, `Viewer`) and collaborator counts.

### 4. Persistence & Durability
- **SQLite Database**: Native Node 24 `node:sqlite` (`DatabaseSync`) located at `data/docflow.db`.
- **Write-Ahead Logging (WAL)**: Ensures immediate disk persistence, durability across restarts and page reloads, and multi-connection safety.
- **Automatic Seed Data**: Ships with realistic demo documents and collaborator relationships ready for exploration upon first launch.

### 5. Product & Engineering Quality
- **Pure Vanilla CSS**: Bespoke modern design system (tokens, dark/light themes, glassmorphism, responsive grid) without heavy CSS frameworks.
- **Zod Schema Validation**: Strict schema verification on all API inputs.
- **Automated Test Suite**: Vitest suite covering database operations, permission enforcement, and file conversion pipelines.
- **Docker Ready**: Production multi-stage `Dockerfile` and `docker-compose.yml`.
- **AI-Native Workflow Note**: Detailed reflection on practical AI usage, rejections, and verification in [AI_WORKFLOW.md](file:///d:/Portfolio/Ajaja%20test/AI_WORKFLOW.md).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v22.5.0` or later (tested on Node `v24.15.0`)
- **npm**: `v10+` or `v11+`

### Installation & Run

1. **Clone or navigate to the project folder**:
   ```bash
   cd "d:/Portfolio/Ajaja test"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run automated tests**:
   ```bash
   npm run test
   ```
   *Expected output: 9 tests passing across DB persistence and File Parser suites.*

4. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build and run production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Docker Deployment

To build and run DocFlow in a production container with persistent volume storage:

```bash
docker compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000). Data is persisted in the `docflow_data` docker volume.

---

## Step-by-Step Reviewer Guide

### Step 1: Testing Document Creation & Formatting
1. Open [http://localhost:3000](http://localhost:3000). Active persona defaults to **Alex Carter**.
2. Click **"New Doc"** or choose the **"Blank Document"** template.
3. Click on the title at the top left and rename it (e.g. *"Engineering Roadmap"*). Press Enter or click outside to save.
4. Use the toolbar buttons or keyboard shortcuts:
   - Press `Ctrl+B` for bold, `Ctrl+I` for italic, `Ctrl+U` for underline.
   - Choose **Heading 1** and **Heading 2** from the toolbar.
   - Insert a bulleted list or blockquote.
5. Notice the auto-save indicator transition from *"Saving..."* to *"Saved to cloud"*.
6. Refresh the page: notice your title, formatting, and content are fully preserved.

### Step 2: Testing File Upload & Ingestion
1. On the dashboard, click **"Import File"** (or click the *"Import (.md, .docx, .txt)"* template card).
2. Drag and drop any `.md`, `.txt`, or `.docx` file (or select one).
3. Click **"Create & Open Document"**:
   - The file is converted into rich HTML and opened immediately.
   - Headings, bold text, and lists from the file are preserved as editable rich text!

### Step 3: Testing Role-Based Sharing & Access Control
1. Open a document owned by **Alex Carter** (e.g., *"🚀 DocFlow Product Launch Plan"*).
2. Click the blue **"Share"** button in the top right.
3. In the modal, pick **Charlie Davis** from the dropdown and assign role **"Viewer"**. Click **"Invite"**.
4. Now, switch personas using the top-right persona switcher dropdown: switch to **Charlie Davis**.
5. Observe:
   - On the top bar, a lock badge and alert banner appear: *"Viewing Mode: You have read-only access to this document."*
   - Formatting buttons are disabled and the editor cannot be typed into.
   - Attempting to rename the title is prevented.
6. Return to the Dashboard as Charlie:
   - Notice the document appears under the **"Shared with me"** tab with a yellow **Viewer** badge and attribution *"Owned by Alex Carter"*.
7. Switch persona to **Beatrice Vance**:
   - Beatrice has **Editor** access on this document.
   - Open it: Beatrice can edit content and save, but the **Share** and **Delete** actions are restricted to Alex.

---

## Architecture & Project Structure

Detailed architecture notes and trade-off rationales are documented in [ARCHITECTURE.md](file:///d:/Portfolio/Ajaja%20test/ARCHITECTURE.md).

```
src/
├── app/
│   ├── api/
│   │   ├── documents/          # Document CRUD endpoints
│   │   │   ├── [id]/           # Read, update, delete document
│   │   │   │   └── share/      # Share management & collaborator roles
│   │   │   └── route.ts        # List & create documents
│   │   ├── upload/             # File upload & conversion endpoint
│   │   └── users/              # User persona listing & creation
│   ├── doc/[id]/               # Rich-text document editor page
│   ├── layout.tsx              # Root HTML, Google Fonts, theme provider
│   └── page.tsx                # Dashboard with templates & document tabs
├── components/
│   ├── DocumentCard.tsx        # Document card preview, badges, actions
│   ├── DocumentEditor.tsx      # TipTap editor wrapper with autosave & stats
│   ├── EditorToolbar.tsx       # Formatting controls (bold, headings, lists)
│   ├── FileUploadModal.tsx     # File drag-and-drop & parser dialog
│   ├── Navbar.tsx              # Brand, search, persona switcher, theme toggle
│   └── ShareModal.tsx          # Collaborator management & permissions modal
├── context/
│   └── UserContext.tsx         # Active user state, switching, and theme
├── lib/
│   ├── db/
│   │   ├── index.ts            # SQLite database initialization & demo seeds
│   │   └── repository.ts       # Type-safe queries & RBAC role checks
│   ├── parser.ts               # File parser (Mammoth for DOCX, Marked for MD)
│   └── validation.ts           # Zod schema validation
├── styles/
│   ├── tokens.css              # Color tokens, glassmorphism, transitions
│   ├── globals.css             # Base reset, typography, buttons, modals
│   ├── dashboard.css           # Dashboard layout, cards, templates, tabs
│   └── editor.css              # Google Docs paper sheet, toolbar, banners
└── tests/
    ├── db.test.ts              # Database CRUD & sharing permission tests
    └── upload.test.ts          # File conversion pipeline tests
```

---

## 📄 License
MIT License.
