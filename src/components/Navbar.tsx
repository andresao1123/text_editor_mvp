'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { AuthModal } from '@/components/AuthModal';
import {
  FileText,
  Search,
  Sun,
  Moon,
  Plus,
  ChevronDown,
  UserCheck,
  UserPlus,
  Upload,
  LogIn,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNewDoc?: () => void;
  onOpenUpload?: () => void;
}

export function Navbar({
  searchQuery = '',
  onSearchChange,
  onNewDoc,
  onOpenUpload,
}: NavbarProps) {
  const { currentUser, allUsers, switchUser, logout, theme, toggleTheme } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="navbar">
        {/* Brand */}
        <Link href="/" className="nav-brand">
          <div className="brand-icon">
            <FileText size={20} />
          </div>
          <span>DocFlow</span>
        </Link>

        {/* Search bar */}
        {onSearchChange && (
          <div className="nav-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search documents by title or content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-text"
            />
          </div>
        )}

        {/* Actions */}
        <div className="nav-actions">
          {/* Quick Upload */}
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="btn btn-secondary"
              title="Import or upload document file (.md, .txt, .docx)"
            >
              <Upload size={16} />
              <span>Import File</span>
            </button>
          )}

          {/* New Document */}
          {onNewDoc && (
            <button onClick={onNewDoc} className="btn btn-primary">
              <Plus size={16} />
              <span>New Doc</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile / Switcher or Login button */}
          {currentUser ? (
            <div className="user-switcher-container" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="user-pill"
                title="Click to switch active user profile or manage account"
              >
                <div className="user-avatar">{currentUser.avatar_url || 'U'}</div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {currentUser.name}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">Active Persona (1-Click Switch)</div>
                  {allUsers.map((user) => {
                    const isActive = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setDropdownOpen(false);
                        }}
                        className={`user-option ${isActive ? 'active' : ''}`}
                      >
                        <div className="user-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                          {user.avatar_url || 'U'}
                        </div>
                        <div className="user-option-info">
                          <span className="user-option-name">{user.name}</span>
                          <span className="user-option-email">{user.email}</span>
                        </div>
                        {isActive && <UserCheck size={16} color="var(--primary)" />}
                      </button>
                    );
                  })}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 6, paddingTop: 6 }}>
                    <button
                      onClick={() => openAuth('login')}
                      className="user-option"
                      style={{ fontSize: '0.825rem' }}
                    >
                      <LogIn size={15} />
                      <span>Sign In as Another User</span>
                    </button>

                    <button
                      onClick={() => openAuth('register')}
                      className="user-option"
                      style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}
                    >
                      <UserPlus size={15} />
                      <span>+ Register New User</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="user-option"
                      style={{ fontSize: '0.825rem', color: 'var(--accent-rose)' }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="btn btn-primary"
              style={{ padding: '6px 14px' }}
            >
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal (Sign In / Register) */}
      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
