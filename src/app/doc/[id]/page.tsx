'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { DocumentEditor } from '@/components/DocumentEditor';
import { ShareModal } from '@/components/ShareModal';
import { DocumentWithRole } from '@/lib/db/repository';
import '@/styles/editor.css';
import {
  ArrowLeft,
  Share2,
  FileText,
  Sun,
  Moon,
  Users,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, switchUser, allUsers, theme, toggleTheme, apiFetch } = useUser();
  const [doc, setDoc] = useState<DocumentWithRole | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch document
  const fetchDoc = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await apiFetch(`/api/documents/${id}`);

      if (res.status === 404 || res.status === 403) {
        setError('Document not found or you do not have permission to view it.');
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load document');
      }

      const data = await res.json();
      setDoc(data.document);
      setTitle(data.document.title);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching document';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, currentUser, id]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // Handle title rename
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleTitleBlur = async () => {
    if (!doc || !title.trim() || title === doc.title || doc.user_role === 'viewer') return;
    try {
      await apiFetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      setDoc((prev) => (prev ? { ...prev, title: title.trim() } : null));
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  // Handle content save
  const handleSaveContent = async (contentHtml: string, plainText: string) => {
    if (!doc || doc.user_role === 'viewer') return;
    const res = await apiFetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentHtml, plainText }),
    });

    if (!res.ok) {
      throw new Error('Save failed');
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 16,
          background: 'var(--bg-app)',
        }}
      >
        <Loader2 size={36} className="animate-spin" color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Opening document...
        </p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          background: 'var(--bg-app)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem' }}>Access Denied or Not Found</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 450, fontSize: '0.9rem' }}>
          {error || 'This document either does not exist or has not been shared with your current persona.'}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>

          {/* Quick persona switcher in error state */}
          <div className="user-switcher-container">
            <select
              className="input-select"
              value={currentUser?.id || ''}
              onChange={(e) => switchUser(e.target.value)}
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  Switch to {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly = doc.user_role === 'viewer';
  const isOwner = doc.user_role === 'owner';

  return (
    <div className="editor-page">
      {/* Top Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          {/* Back button */}
          <Link href="/" className="btn-icon" title="Back to Dashboard">
            <ArrowLeft size={20} />
          </Link>

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <FileText size={18} />
          </div>

          {/* Document Title Input */}
          <div className="editor-title-container">
            <input
              type="text"
              className="editor-title-input"
              value={title}
              disabled={isReadOnly}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Untitled Document"
              title={isReadOnly ? 'View only: Cannot rename' : 'Click to rename'}
            />
            <div className="editor-status-bar">
              <span className={`status-dot ${isReadOnly ? 'saving' : 'saved'}`} />
              <span>
                {isReadOnly
                  ? 'Viewing only'
                  : doc.user_role === 'owner'
                  ? 'Owner'
                  : 'Editor'}
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Owned by {isOwner ? 'you' : doc.owner_name}</span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="editor-header-right">
          {/* Active persona pill / switcher */}
          <select
            className="input-select"
            value={currentUser?.id || ''}
            onChange={(e) => switchUser(e.target.value)}
            title="Switch active user to test permissions"
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                👤 {u.name} {u.id === doc.owner_id ? '(Owner)' : ''}
              </option>
            ))}
          </select>

          {/* Share Button (Active for owner; visible with role for editor) */}
          {isOwner ? (
            <button
              onClick={() => setShowShareModal(true)}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.825rem' }}
            >
              <Share2 size={15} />
              <span>Share</span>
              {doc.collaborators_count > 0 && (
                <span
                  style={{
                    marginLeft: 2,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.25)',
                    fontSize: '0.7rem',
                  }}
                >
                  {doc.collaborators_count}
                </span>
              )}
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Users size={14} />
              <span>{doc.user_role === 'editor' ? 'Editor Access' : 'Viewer Access'}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Editor Main Canvas */}
      <DocumentEditor
        initialContent={doc.content_html}
        readOnly={isReadOnly}
        onSave={handleSaveContent}
        documentTitle={title}
      />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          documentId={doc.id}
          documentTitle={doc.title}
          onClose={() => {
            setShowShareModal(false);
            fetchDoc();
          }}
        />
      )}
    </div>
  );
}
