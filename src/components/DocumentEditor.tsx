'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
import { FileUploadModal } from './FileUploadModal';
import {
  Check,
  Loader2,
  Lock,
  Download,
  FileText,
  Code2,
  FileCode,
  Printer,
} from 'lucide-react';

interface DocumentEditorProps {
  initialContent: string;
  readOnly?: boolean;
  onSave: (contentHtml: string, plainText: string) => Promise<void>;
  documentTitle: string;
}

export function DocumentEditor({
  initialContent,
  readOnly = false,
  onSave,
  documentTitle,
}: DocumentEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: readOnly
          ? 'No content in this document.'
          : 'Start typing your document, or import Markdown/DOCX...',
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (readOnly) return;
      setSaveStatus('saving');

      // Update counts
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);

      // Debounce auto-save (1 second)
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          const html = editor.getHTML();
          await onSave(html, text);
          setSaveStatus('saved');
        } catch (err) {
          console.error('Auto-save error:', err);
          setSaveStatus('error');
        }
      }, 1000);
    },
  });

  // Calculate initial word and character counts
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
    }
  }, [editor]);

  // Handle Ctrl+S / Cmd+S manual save
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editor && !readOnly) {
          if (timerRef.current) clearTimeout(timerRef.current);
          setSaveStatus('saving');
          try {
            await onSave(editor.getHTML(), editor.getText());
            setSaveStatus('saved');
          } catch {
            setSaveStatus('error');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave, readOnly]);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle file import into editor
  const handleImportContent = (contentHtml: string) => {
    if (editor && !readOnly) {
      editor.commands.insertContent(contentHtml);
      const text = editor.getText();
      onSave(editor.getHTML(), text);
      setSaveStatus('saved');
    }
  };

  // Export file helper
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export as PDF (High-fidelity vector print-to-PDF)
  const exportAsPdf = () => {
    if (!editor) return;
    setShowExportMenu(false);

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${documentTitle || 'Document'}</title>
  <style>
    @page {
      margin: 25mm 20mm;
      size: A4 portrait;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: #1e293b;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    h1 {
      font-size: 24pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12pt;
      page-break-after: avoid;
    }
    h2 {
      font-size: 18pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 18pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14pt;
      font-weight: 600;
      color: #334155;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    p {
      font-size: 11pt;
      margin-bottom: 10pt;
      orphans: 3;
      widows: 3;
    }
    ul, ol {
      padding-left: 22pt;
      margin-bottom: 10pt;
      font-size: 11pt;
    }
    li {
      margin-bottom: 4pt;
    }
    blockquote {
      border-left: 4px solid #6366f1;
      padding-left: 14pt;
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 10pt;
      color: #475569;
      font-style: italic;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 10pt 14pt;
      border-radius: 6px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      overflow-x: auto;
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }
    code {
      background: #f1f5f9;
      color: #4338ca;
      font-family: 'Courier New', Courier, monospace;
      padding: 1pt 4pt;
      border-radius: 3px;
      font-size: 9.5pt;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16pt 0;
    }
  </style>
</head>
<body>
  ${editor.getHTML()}
</body>
</html>`);
    doc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1000);
    }, 250);
  };

  const exportAsHtml = () => {
    if (!editor) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${documentTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    pre { background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 14px; margin-left: 0; color: #475569; }
  </style>
</head>
<body>
  ${editor.getHTML()}
</body>
</html>`;
    downloadFile(html, `${documentTitle || 'document'}.html`, 'text/html');
  };

  const exportAsTxt = () => {
    if (!editor) return;
    downloadFile(editor.getText(), `${documentTitle || 'document'}.txt`, 'text/plain');
  };

  const exportAsMarkdown = () => {
    if (!editor) return;
    // Simple HTML to MD conversion
    let text = editor.getHTML();
    text = text.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
    text = text.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
    text = text.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
    text = text.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    text = text.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    text = text.replace(/<u>(.*?)<\/u>/gi, '_$1_');
    text = text.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
    text = text.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    text = text.replace(/<br\s*[\/]?>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    downloadFile(text.trim(), `${documentTitle || 'document'}.md`, 'text/markdown');
  };

  return (
    <>
      {/* Read-only Alert Banner for Viewers */}
      {readOnly && (
        <div className="viewer-banner">
          <Lock size={16} />
          <span>Viewing Mode: You have read-only access to this document. Contact the owner to request edit permission.</span>
        </div>
      )}

      {/* Formatting Toolbar */}
      <div style={{ position: 'relative' }}>
        <EditorToolbar
          editor={editor}
          readOnly={readOnly}
          onOpenImport={() => setShowImportModal(true)}
        />

        {/* Export Dropdown in Toolbar Right */}
        <div
          ref={exportMenuRef}
          style={{ position: 'absolute', right: 16, top: 6, zIndex: 50 }}
        >
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.8rem', height: 32 }}
            title="Export or download document"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div
              className="user-dropdown"
              style={{ right: 0, width: 190, top: 'calc(100% + 4px)' }}
            >
              <div className="user-dropdown-header">Export Format</div>
              <button onClick={exportAsPdf} className="user-option">
                <Printer size={15} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>PDF Document (.pdf)</span>
              </button>
              <button onClick={exportAsMarkdown} className="user-option">
                <FileCode size={15} />
                <span>Markdown (.md)</span>
              </button>
              <button onClick={exportAsHtml} className="user-option">
                <Code2 size={15} />
                <span>HTML (.html)</span>
              </button>
              <button onClick={exportAsTxt} className="user-option">
                <FileText size={15} />
                <span>Plain Text (.txt)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Paper Canvas */}
      <main className="editor-content-area">
        <div className="editor-paper">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Floating Word & Char Counter and Save Status Pill */}
      <div className="editor-stats-pill">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {readOnly ? (
            <>
              <Lock size={13} color="var(--accent-amber)" />
              <span style={{ color: 'var(--accent-amber)' }}>View Only</span>
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <Loader2 size={13} className="animate-spin" color="var(--accent-amber)" />
              <span>Saving...</span>
            </>
          ) : saveStatus === 'error' ? (
            <span style={{ color: 'var(--accent-rose)' }}>Save Failed</span>
          ) : (
            <>
              <Check size={14} color="var(--accent-emerald)" />
              <span>Saved to cloud</span>
            </>
          )}
        </div>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>{wordCount} words</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>{charCount} chars</span>
      </div>

      {/* Import Content Modal */}
      {showImportModal && (
        <FileUploadModal
          onClose={() => setShowImportModal(false)}
          onImportContent={handleImportContent}
        />
      )}
    </>
  );
}
