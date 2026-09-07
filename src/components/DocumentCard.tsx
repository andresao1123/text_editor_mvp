'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DocumentWithRole } from '@/lib/db/repository';
import {
  FileText,
  Share2,
  Trash2,
  Edit2,
  MoreVertical,
  Users,
} from 'lucide-react';

interface DocumentCardProps {
  doc: DocumentWithRole;
  onShare?: (doc: DocumentWithRole) => void;
  onRename?: (doc: DocumentWithRole) => void;
  onDelete?: (doc: DocumentWithRole) => void;
}

export function DocumentCard({
  doc,
  onShare,
  onRename,
  onDelete,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="badge badge-owner">Owner</span>;
      case 'editor':
        return <span className="badge badge-editor">Editor</span>;
      case 'viewer':
        return <span className="badge badge-viewer">Viewer</span>;
      default:
        return null;
    }
  };

  return (
    <div className="doc-card" onClick={() => (window.location.href = `/doc/${doc.id}`)}>
      <div className="doc-preview">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <FileText size={24} style={{ color: 'var(--primary)' }} />
          {getRoleBadge(doc.user_role)}
        </div>
        <p className="doc-preview-text">
          {doc.plain_text || 'No additional text in this document.'}
        </p>
      </div>

      <div className="doc-info" onClick={(e) => e.stopPropagation()}>
        <div className="doc-title-row">
          <Link href={`/doc/${doc.id}`} className="doc-title" title={doc.title}>
            {doc.title}
          </Link>

          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="btn-icon"
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                className="user-dropdown"
                style={{ right: 0, width: 170 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              >
                <Link
                  href={`/doc/${doc.id}`}
                  className="user-option"
                  style={{ fontSize: '0.85rem' }}
                >
                  <FileText size={15} />
                  <span>Open</span>
                </Link>

                {doc.user_role === 'owner' && onShare && (
                  <button
                    onClick={() => onShare(doc)}
                    className="user-option"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>
                )}

                {(doc.user_role === 'owner' || doc.user_role === 'editor') && onRename && (
                  <button
                    onClick={() => onRename(doc)}
                    className="user-option"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Edit2 size={15} />
                    <span>Rename</span>
                  </button>
                )}

                {doc.user_role === 'owner' && onDelete && (
                  <button
                    onClick={() => onDelete(doc)}
                    className="user-option"
                    style={{ fontSize: '0.85rem', color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="doc-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              className="user-avatar"
              style={{ width: 20, height: 20, fontSize: '0.65rem' }}
              title={`Owner: ${doc.owner_name}`}
            >
              {doc.owner_avatar || 'U'}
            </div>
            <span>{doc.user_role === 'owner' ? 'You' : doc.owner_name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {doc.collaborators_count > 0 && (
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                title={`${doc.collaborators_count} collaborator${doc.collaborators_count > 1 ? 's' : ''}`}
              >
                <Users size={12} />
                {doc.collaborators_count}
              </span>
            )}
            <span>{formatRelativeTime(doc.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
