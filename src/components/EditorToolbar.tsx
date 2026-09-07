'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Minus,
  RemoveFormatting,
  Upload,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
  onOpenImport?: () => void;
}

export function EditorToolbar({
  editor,
  readOnly = false,
  onOpenImport,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      {/* History */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={readOnly || !editor.can().undo()}
          className="toolbar-btn"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={readOnly || !editor.can().redo()}
          className="toolbar-btn"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Headings */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={17} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={17} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={17} />
        </button>
      </div>

      {/* Basic Formatting */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      {/* Lists */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bulleted List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* Block Formats */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="Blockquote"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={readOnly}
          className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
        >
          <Code size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={readOnly}
          className="toolbar-btn"
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Utilities */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          disabled={readOnly}
          className="toolbar-btn"
          title="Clear Formatting"
        >
          <RemoveFormatting size={16} />
        </button>

        {onOpenImport && (
          <button
            onClick={onOpenImport}
            disabled={readOnly}
            className="toolbar-btn"
            title="Import file into document (.md, .txt, .docx)"
            style={{ color: 'var(--primary)' }}
          >
            <Upload size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
