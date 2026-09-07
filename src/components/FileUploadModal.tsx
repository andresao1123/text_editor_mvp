'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface FileUploadModalProps {
  onClose: () => void;
  // If provided, imports into active editor instead of creating a new document
  onImportContent?: (contentHtml: string) => void;
}

export function FileUploadModal({
  onClose,
  onImportContent,
}: FileUploadModalProps) {
  const router = useRouter();
  const { apiFetch } = useUser();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['txt', 'md', 'markdown', 'docx', 'html', 'htm'];

  const validateAndSetFile = (file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file format (.${ext}). Please upload .md, .txt, or .docx`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large (maximum 10MB)');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // If we are creating a new document, pass createDocument=true
      if (!onImportContent) {
        formData.append('createDocument', 'true');
      }

      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();

      if (onImportContent) {
        onImportContent(data.contentHtml);
        onClose();
      } else if (data.document?.id) {
        onClose();
        router.push(`/doc/${data.document.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {onImportContent ? 'Import File Content' : 'Upload & Create Document'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Convert Markdown, TXT, or DOCX into an editable rich-text document
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-rose)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            className={`dropzone ${dragOver ? 'dragover' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".txt,.md,.markdown,.docx,.html"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0]);
                }
              }}
            />

            <div className="dropzone-icon">
              <Upload size={26} />
            </div>

            {selectedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {selectedFile.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop another to change
                </span>
              </div>
            ) : (
              <>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Click to select or drag and drop your file here
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span className="badge" style={{ background: 'var(--bg-surface-elevated)' }}>
                    .MD (Markdown)
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-surface-elevated)' }}>
                    .DOCX (Word)
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-surface-elevated)' }}>
                    .TXT (Plain Text)
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-surface-elevated)' }}>
                    .HTML
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost" disabled={isUploading}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="btn btn-primary"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>
                  {onImportContent ? 'Insert Content' : 'Create & Open Document'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
