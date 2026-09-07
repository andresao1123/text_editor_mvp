'use client';

import React, { useState } from 'react';
import { useUser, User } from '@/context/UserContext';
import {
  FileText,
  LogIn,
  UserPlus,
  Mail,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  ShieldCheck,
  FileDown,
  Upload,
  Users,
} from 'lucide-react';

export function LoginPage() {
  const { allUsers, loginUser, registerUser, switchUser, theme, toggleTheme } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast 1-click login for demo personas
  const handleDemoLogin = (userId: string) => {
    switchUser(userId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await loginUser(email.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and email are both required');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await registerUser(name.trim(), email.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoPersonas = [
    {
      id: 'user-alex',
      title: 'Alex Carter',
      subtitle: 'Product Designer',
      role: 'Owner',
      badgeClass: 'badge-owner',
      description: 'Owns launch plan, can invite & delete',
    },
    {
      id: 'user-beatrice',
      title: 'Beatrice Vance',
      subtitle: 'Lead Engineer',
      role: 'Editor',
      badgeClass: 'badge-editor',
      description: 'Can edit shared documents & save changes',
    },
    {
      id: 'user-charlie',
      title: 'Charlie Davis',
      subtitle: 'Marketing Lead',
      role: 'Viewer',
      badgeClass: 'badge-viewer',
      description: 'Read-only view access to documents',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Bar with Logo & Theme Toggle */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-icon">
            <FileText size={20} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            DocFlow
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Hero & Login Box */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          maxWidth: 620,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Hero Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to DocFlow
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            Collaborative rich-text documents with Google Docs formatting, role-based sharing, and file import.
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card"
          style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-medium)',
          }}
        >
          {/* Tabs */}
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

          <div style={{ padding: '24px 28px' }}>
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
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              <div>
                {/* 1-Click Demo Personas */}
                <div style={{ marginBottom: 24 }}>
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
                      marginBottom: 10,
                    }}
                  >
                    <Sparkles size={14} color="var(--primary)" />
                    <span>Quick Access — Select a Demo Persona</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {demoPersonas.map((persona) => {
                      const user = allUsers.find((u) => u.id === persona.id);
                      if (!user) return null;
                      return (
                        <button
                          key={persona.id}
                          onClick={() => handleDemoLogin(persona.id)}
                          className="btn btn-secondary"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            textAlign: 'left',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              className="user-avatar"
                              style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                            >
                              {user.avatar_url || 'U'}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {user.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {persona.description}
                              </div>
                            </div>
                          </div>

                          <span className={`badge ${persona.badgeClass}`}>
                            {persona.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '20px 0',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                  <span>or sign in with email</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                </div>

                {/* Email Sign In Form */}
                <form onSubmit={handleLogin}>
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
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                        }}
                      />
                      <input
                        type="email"
                        className="input-text"
                        style={{ paddingLeft: 40 }}
                        placeholder="e.g. alex@docflow.dev"
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
                    style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
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
              /* Mode: Create Account */
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: 16 }}>
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
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      className="input-text"
                      style={{ paddingLeft: 40 }}
                      placeholder="e.g. Dana Scully"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
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
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="email"
                      className="input-text"
                      style={{ paddingLeft: 40 }}
                      placeholder="e.g. dana@docflow.dev"
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
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Create Account & Start</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 16,
            marginTop: 28,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <FileText size={14} color="var(--primary)" /> TipTap Rich-Text
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <FileDown size={14} color="var(--primary)" /> PDF Export
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Upload size={14} color="var(--primary)" /> Word & MD Import
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={14} color="var(--primary)" /> Role Permissions
          </span>
        </div>
      </main>
    </div>
  );
}
