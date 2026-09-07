'use client';

import React, { useState } from 'react';
import { useUser, User } from '@/context/UserContext';
import {
  LogIn,
  UserPlus,
  Mail,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

export function AuthModal({
  initialMode = 'login',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { loginUser, registerUser, allUsers, switchUser } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast 1-click login for demo personas
  const handleDemoLogin = (userId: string) => {
    switchUser(userId);
    const user = allUsers.find((u) => u.id === userId);
    if (user && onSuccess) onSuccess(user);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const user = await loginUser(email.trim());
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and email are both required');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const user = await registerUser(name.trim(), email.trim());
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LogIn size={17} />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            <UserPlus size={17} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--accent-rose)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Mode: Sign In */}
          {mode === 'login' ? (
            <div>
              {/* Quick Demo Sign-in */}
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                  }}
                >
                  <Sparkles size={13} color="var(--primary)" />
                  <span>Instant Demo Sign-In</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {allUsers.slice(0, 3).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleDemoLogin(u.id)}
                      className="btn btn-secondary"
                      style={{
                        padding: '8px 6px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      title={`Sign in as ${u.name}`}
                    >
                      <div
                        className="user-avatar"
                        style={{ width: 22, height: 22, fontSize: '0.65rem' }}
                      >
                        {u.avatar_url || 'U'}
                      </div>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {u.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: '16px 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span>or sign in with email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 6,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="email"
                      className="input-text"
                      style={{ paddingLeft: 36 }}
                      placeholder="e.g. alex@docflow.dev"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Mode: Register */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    className="input-text"
                    style={{ paddingLeft: 36 }}
                    placeholder="e.g. Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    className="input-text"
                    style={{ paddingLeft: 36 }}
                    placeholder="e.g. sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create Account & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
