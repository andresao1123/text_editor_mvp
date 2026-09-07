'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { DocumentCard } from '@/components/DocumentCard';
import { ShareModal } from '@/components/ShareModal';
import { FileUploadModal } from '@/components/FileUploadModal';
import { DocumentWithRole } from '@/lib/db/repository';
import '@/styles/dashboard.css';
import {
  Plus,
  FileText,
  FileCheck2,
  Briefcase,
  Upload,
  FolderLock,
  Loader2,
  FolderOpen,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, apiFetch } = useUser();
  const [ownedDocs, setOwnedDocs] = useState<DocumentWithRole[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [sharingDoc, setSharingDoc] = useState<DocumentWithRole | null>(null);
  const [renamingDoc, setRenamingDoc] = useState<DocumentWithRole | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [deletingDoc, setDeletingDoc] = useState<DocumentWithRole | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch documents for the active user
  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/documents');
      if (!res.ok) throw new Error('Failed to load documents');
      const data = await res.json();
      setOwnedDocs(data.owned || []);
      setSharedDocs(data.shared || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, currentUser]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Create new document handler
  const handleCreateDocument = async (title: string = 'Untitled Document', contentHtml?: string) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await apiFetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          contentHtml: contentHtml || '<p></p>',
          plainText: '',
        }),
      });

      if (!res.ok) throw new Error('Failed to create document');
      const data = await res.json();
      router.push(`/doc/${data.document.id}`);
    } catch (err) {
      console.error(err);
      alert('Could not create document');
      setIsCreating(false);
    }
  };

  // Pre-made template handlers
  const handleCreateProposal = () => {
    const html = `
      <h1>📋 Project Proposal</h1>
      <h2>1. Executive Summary</h2>
      <p>Brief summary of project objectives, goals, and anticipated impact.</p>
      <h2>2. Problem Statement</h2>
      <p>Identify the core challenge and current bottleneck.</p>
      <h2>3. Proposed Solution</h2>
      <ul>
        <li>Deliverable 1: Core infrastructure setup</li>
        <li>Deliverable 2: Interactive user interface</li>
        <li>Deliverable 3: Automated test pipeline</li>
      </ul>
      <h2>4. Timeline & Milestones</h2>
      <p>Target delivery within the next four weeks.</p>
    `.trim();
    handleCreateDocument('Project Proposal', html);
  };

  const handleCreateMeetingNotes = () => {
    const today = new Date().toLocaleDateString();
    const html = `
      <h1>📝 Meeting Notes — ${today}</h1>
      <h2>Attendees</h2>
      <ul>
        <li>Alex Carter</li>
        <li>Beatrice Vance</li>
        <li>Charlie Davis</li>
      </ul>
      <h2>Agenda</h2>
      <ol>
        <li>Product launch milestones review</li>
        <li>Feedback on file upload & sharing ergonomics</li>
        <li>Next sprint priorities</li>
      </ol>
      <h2>Action Items</h2>
      <ul>
        <li>[ ] Alex: Finalize UI typography & dark mode tweaks</li>
        <li>[ ] Beatrice: Verify SQLite WAL durability</li>
        <li>[ ] Charlie: Prepare marketing announcement</li>
      </ul>
    `.trim();
    handleCreateDocument(`Meeting Notes — ${today}`, html);
  };

  // Rename document
  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingDoc || !renameTitle.trim()) return;

    try {
      const res = await apiFetch(`/api/documents/${renamingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: renameTitle.trim() }),
      });

      if (!res.ok) throw new Error('Failed to rename document');
      setRenamingDoc(null);
      await fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to rename document');
    }
  };

  // Delete document
  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      const res = await apiFetch(`/api/documents/${deletingDoc.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setDeletingDoc(null);
      await fetchDocuments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting document';
      alert(msg);
    }
  };

  // Filter documents based on active tab and search query
  const allDocs = [...ownedDocs, ...sharedDocs];
  let displayedDocs =
    activeTab === 'owned'
      ? ownedDocs
      : activeTab === 'shared'
      ? sharedDocs
      : allDocs;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayedDocs = displayedDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.plain_text && d.plain_text.toLowerCase().includes(q))
    );
  }

  return (
    <div>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewDoc={() => handleCreateDocument()}
        onOpenUpload={() => setShowUploadModal(true)}
      />

      <div className="dashboard-container">
        {/* Quickstart Templates */}
        <section className="quickstart-section">
          <div className="section-title">
            <span>Start a new document</span>
          </div>

          <div className="templates-grid">
            {/* Blank Document */}
            <div
              className="template-card"
              onClick={() => handleCreateDocument()}
              role="button"
              tabIndex={0}
            >
              <div className="template-icon">
                {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />}
              </div>
              <span className="template-title">Blank Document</span>
            </div>

            {/* Project Proposal */}
            <div
              className="template-card"
              onClick={handleCreateProposal}
              role="button"
              tabIndex={0}
            >
              <div className="template-icon" style={{ color: 'var(--accent-purple)' }}>
                <Briefcase size={20} />
              </div>
              <span className="template-title">Project Proposal</span>
            </div>

            {/* Meeting Notes */}
            <div
              className="template-card"
              onClick={handleCreateMeetingNotes}
              role="button"
              tabIndex={0}
            >
              <div className="template-icon" style={{ color: 'var(--accent-emerald)' }}>
                <FileCheck2 size={20} />
              </div>
              <span className="template-title">Meeting Notes</span>
            </div>

            {/* Import / Upload File */}
            <div
              className="template-card"
              onClick={() => setShowUploadModal(true)}
              role="button"
              tabIndex={0}
            >
              <div className="template-icon" style={{ color: 'var(--accent-cyan)' }}>
                <Upload size={20} />
              </div>
              <span className="template-title">Import (.md, .docx, .txt)</span>
            </div>
          </div>
        </section>

        {/* Filter and Tab Bar */}
        <div className="filter-bar">
          <div className="tabs-group">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              <span>All Documents</span>
              <span className="tab-count">{allDocs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('owned')}
              className={`tab-btn ${activeTab === 'owned' ? 'active' : ''}`}
            >
              <span>Owned by me</span>
              <span className="tab-count">{ownedDocs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
            >
              <span>Shared with me</span>
              <span className="tab-count">{sharedDocs.length}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Showing {displayedDocs.length} document{displayedDocs.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Document Grid or Empty State */}
        {isLoading ? (
          <div className="empty-state">
            <Loader2 size={36} className="animate-spin" color="var(--primary)" />
            <p>Loading your documents...</p>
          </div>
        ) : displayedDocs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === 'shared' ? <FolderLock size={32} /> : <FolderOpen size={32} />}
            </div>
            <h3>
              {searchQuery
                ? `No documents found for "${searchQuery}"`
                : activeTab === 'shared'
                ? 'No documents shared with you yet'
                : 'No documents yet'}
            </h3>
            <p style={{ maxWidth: 400, fontSize: '0.875rem' }}>
              {activeTab === 'shared'
                ? 'When another user shares a document with your account, it will appear here.'
                : 'Create a new document, choose a template, or import a file from your computer.'}
            </p>
            {activeTab !== 'shared' && (
              <button
                onClick={() => handleCreateDocument()}
                className="btn btn-primary"
                style={{ marginTop: 8 }}
              >
                <Plus size={16} />
                <span>Create Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="docs-grid">
            {displayedDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onShare={(d) => setSharingDoc(d)}
                onRename={(d) => {
                  setRenamingDoc(d);
                  setRenameTitle(d.title);
                }}
                onDelete={(d) => setDeletingDoc(d)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {sharingDoc && (
        <ShareModal
          documentId={sharingDoc.id}
          documentTitle={sharingDoc.title}
          onClose={() => {
            setSharingDoc(null);
            fetchDocuments();
          }}
        />
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <FileUploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {/* Rename Modal */}
      {renamingDoc && (
        <div className="modal-overlay" onClick={() => setRenamingDoc(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Rename Document</h3>
              <button onClick={() => setRenamingDoc(null)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmRename}>
              <div className="modal-body">
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                  Document Title
                </label>
                <input
                  type="text"
                  className="input-text"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setRenamingDoc(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <div className="modal-overlay" onClick={() => setDeletingDoc(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-rose)' }}>Delete Document</h3>
              <button onClick={() => setDeletingDoc(null)} className="btn-icon">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem' }}>
                Are you sure you want to permanently delete <strong>{deletingDoc.title}</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                This action cannot be undone. All shared collaborator permissions will also be removed.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingDoc(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn btn-danger">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
