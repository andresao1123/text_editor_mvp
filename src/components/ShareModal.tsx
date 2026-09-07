'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { ShareInfo } from '@/lib/db/repository';
import {
  Share2,
  Copy,
  Check,
  Trash2,
  Lock,
  Edit3,
  Eye,
  UserPlus,
} from 'lucide-react';

interface ShareModalProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

export function ShareModal({
  documentId,
  documentTitle,
  onClose,
}: ShareModalProps) {
  const { allUsers, currentUser, apiFetch } = useUser();
  const [shares, setShares] = useState<ShareInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchShares = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/api/documents/${documentId}/share`);
      if (!res.ok) throw new Error('Failed to fetch shares');
      const data = await res.json();
      setShares(data.shares || []);
    } catch (err) {
      console.error(err);
      setError('Could not load collaborators');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, documentId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  // Filter users that are not the current user and not already shared
  const availableUsersToInvite = allUsers.filter(
    (u) => u.id !== currentUser?.id && !shares.some((s) => s.user_id === u.id)
  );

  const handleAddShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user to invite');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await apiFetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to share document');
      }

      setSelectedUserId('');
      await fetchShares();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to share document';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'editor' | 'viewer') => {
    try {
      const res = await apiFetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update permission');
      await fetchShares();
    } catch (err) {
      console.error(err);
      setError('Failed to update permission');
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/documents/${documentId}/share?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove collaborator');
      await fetchShares();
    } catch (err) {
      console.error(err);
      setError('Failed to remove collaborator');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/doc/${documentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <Share2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Share Document</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {documentTitle}
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
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-rose)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Add collaborator form */}
          <form onSubmit={handleAddShare}>
            <label
              style={{
                display: 'block',
                marginBottom: 6,
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Invite Teammate
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                className="input-select"
                style={{ flex: 1 }}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {availableUsersToInvite.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <select
                className="input-select"
                style={{ width: 120 }}
                value={role}
                onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                type="submit"
                disabled={!selectedUserId || isSubmitting}
                className="btn btn-primary"
                style={{ padding: '8px 14px' }}
              >
                <UserPlus size={16} />
                <span>Invite</span>
              </button>
            </div>
          </form>

          {/* Collaborator List */}
          <div>
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 10,
              }}
            >
              Who has access
            </h4>

            {/* Document Owner entry */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  className="user-avatar"
                  style={{ width: 30, height: 30, fontSize: '0.75rem' }}
                >
                  {currentUser?.avatar_url || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {currentUser?.name} (You)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <span className="badge badge-owner">Owner</span>
            </div>

            {/* Collaborators list */}
            {isLoading ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                Loading collaborators...
              </p>
            ) : shares.length === 0 ? (
              <p
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '12px 0',
                }}
              >
                No collaborators yet. Invite teammates above!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {shares.map((share) => (
                  <div
                    key={share.share_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="user-avatar"
                        style={{ width: 28, height: 28, fontSize: '0.7rem' }}
                      >
                        {share.user_avatar || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {share.user_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {share.user_email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        className="input-select"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        value={share.role}
                        onChange={(e) =>
                          handleUpdateRole(
                            share.user_id,
                            e.target.value as 'editor' | 'viewer'
                          )
                        }
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      <button
                        onClick={() => handleRemoveShare(share.user_id)}
                        className="btn-icon"
                        title="Remove access"
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Copy Link */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem' }}
          >
            {copied ? (
              <>
                <Check size={16} color="var(--accent-emerald)" />
                <span style={{ color: 'var(--accent-emerald)' }}>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Share Link</span>
              </>
            )}
          </button>

          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
