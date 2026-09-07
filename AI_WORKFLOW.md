# AI-Native Workflow Note

*Evaluating practical, discerning AI usage — prioritizing engineering discipline, speed, and critical evaluation over volume.*

---

## 1. AI Tools Used

- **Antigravity AI Agent & Gemini 3.8 Flash**: Employed as an autonomous pair-programmer and architectural sounding board for real-time code generation, refactoring, and integration.
- **Autonomous Tooling Environment**: Leveraged file-system tools, shell command execution, and automated test runners for rapid test-driven iteration and verification.

---

## 2. Where AI Materially Sped Up Work

1. **Rapid Multi-Tier Scaffolding**:
   - Scaffolded the database schema, parameter-bound repository queries, Zod validation schemas, and Next.js API route handlers in a fraction of traditional setup time.
2. **Bespoke Vanilla CSS Design System**:
   - Generated cohesive design tokens (`tokens.css`), dark/light theme variables, paper elevation shadows, and Google Docs-inspired ProseMirror typography rules without needing heavy third-party UI libraries.
3. **File Ingestion Pipeline**:
   - Rapidly composed the format conversion logic combining `mammoth` (for `.docx` OpenXML extraction) and `marked` (for `.md` AST parsing) into unified semantic HTML.
4. **Automated Test Generation**:
   - Instantly created a 9-case automated test suite in Vitest covering edge cases: role-based access checks, cascading deletes, empty file fallbacks, and markdown-to-HTML conversion.

---

## 3. What AI-Generated Output Was Changed or Rejected

| Area | Initial AI Tendency | Practical Engineering Decision / Change | Rationale |
| :--- | :--- | :--- | :--- |
| **Styling Framework** | Defaulted to Tailwind CSS utility classes | **Rejected Tailwind**; implemented pure Vanilla CSS with design tokens (`src/styles/tokens.css`, `editor.css`) | Satisfied requirements cleanly, maintained 100% control over ProseMirror styling, and avoided build-tool bloat. |
| **Database Engine** | Recommended Prisma or `better-sqlite3` | **Rejected native addons**; used Node 24's native `node:sqlite` (`DatabaseSync`) | Native addons frequently suffer from Python / C++ compiler build failures on Windows and varied CI environments. `node:sqlite` provides zero-dependency, instant WAL persistence. |
| **TipTap Next.js Hydration** | Standard client component without SSR guard | **Adjusted configuration** with `immediatelyRender: false` | TipTap renders differently on server vs client. Blindly using standard AI snippets causes hydration mismatches in Next.js 15. |
| **Access Control Architecture** | Initially placed role filtering in client-side React state | **Refactored to Server-Side RBAC**: enforced role checks (`owner`, `editor`, `viewer`) at the SQLite query level and returned HTTP 403 on unauthorized mutations | Client-only filtering is insecure. True engineering quality requires server-level enforcement. |
| **Authentication Flow** | Proposed NextAuth / OAuth2 / Supabase setup | **Designed 1-Click Persona Switcher** (Alex, Beatrice, Charlie) + user creation API | Reviewers should not have to configure OAuth credentials, verify emails, or juggle multiple browser incognito windows to test multi-user sharing. |

---

## 4. Verification of Correctness, UX Quality & Implementation Reliability

1. **Automated Unit & Integration Testing**:
   - Executed `npm run test` with Vitest, validating all 9 test cases across repository mutations, permission elevation/revocation, and file format conversions.
2. **Type Safety & Build Verification**:
   - Executed `npm run build` under strict TypeScript configuration (`ES2022`, Next.js 15 App Router) to guarantee zero type errors or broken imports.
3. **Live Server & REST Verification**:
   - Started the live production server on port 3000 and verified endpoints via `curl`:
     - `/api/users`: Correct persona retrieval.
     - `/api/documents`: Verified user-scoped queries (Alex sees 1 owned, 2 shared; Charlie sees 1 owned, 1 shared; Beatrice's private docs remain invisible to unauthorized users).
     - `/api/upload`: Verified multipart file upload and AST conversion from raw markdown to semantic HTML tags.
4. **UX & Interaction Quality Review**:
   - Verified realistic paper sheet dimensions (`850px` width with subtle drop shadow), debounced auto-save behavior (1s delay), read-only lock banner for Viewers, word/character live counters, and dark/light mode toggle persistence via `localStorage`.
