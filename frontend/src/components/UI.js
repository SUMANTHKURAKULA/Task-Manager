import React from 'react';

// ─── Button ─────────────────────────────────────────────────
export const Button = ({
  children, variant = 'primary', size = 'md',
  loading, disabled, onClick, style, type = 'button', ...props
}) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: 10,
    border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', outline: 'none',
    opacity: disabled || loading ? 0.6 : 1,
  };

  const sizes = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '13px 28px', fontSize: 15 },
  };

  const variants = {
    primary: {
      background: 'var(--accent)', color: '#fff',
      boxShadow: '0 0 20px var(--accent-glow)',
    },
    secondary: {
      background: 'var(--bg-card)', color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--danger-bg)', color: 'var(--danger)',
      border: '1px solid rgba(248,113,113,0.3)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    success: {
      background: 'var(--success-bg)', color: 'var(--success)',
      border: '1px solid rgba(52,211,153,0.3)',
    },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {loading && <span style={{ display: 'inline-block', width: 14, height: 14,
        border: '2px solid currentColor', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
      {children}
    </button>
  );
};

// ─── Badge / Status Chip ────────────────────────────────────
export const Badge = ({ children, color = 'var(--accent)', bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 600,
    color, background: bg || `${color}18`,
    border: `1px solid ${color}30`, whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
);

// ─── Card ────────────────────────────────────────────────────
export const Card = ({ children, style, hover, onClick }) => (
  <div onClick={onClick} style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: 24,
    transition: 'all 0.2s',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }}
    onMouseEnter={hover ? e => {
      e.currentTarget.style.borderColor = 'var(--border-active)';
      e.currentTarget.style.background = 'var(--bg-card-hover)';
    } : undefined}
    onMouseLeave={hover ? e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.background = 'var(--bg-card)';
    } : undefined}
  >
    {children}
  </div>
);

// ─── Spinner ─────────────────────────────────────────────────
export const Spinner = ({ size = 32 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
    <div style={{
      width: size, height: size,
      border: `3px solid var(--border)`,
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  </div>
);

// ─── Input ────────────────────────────────────────────────────
export const Input = ({ label, error, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
    <input
      style={{
        background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 10, padding: '10px 14px', fontSize: 14,
        color: 'var(--text-primary)', outline: 'none', transition: 'border 0.15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-active)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      {...props}
    />
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
);

// ─── Select ──────────────────────────────────────────────────
export const Select = ({ label, error, children, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
    <select
      style={{
        background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 10, padding: '10px 14px', fontSize: 14,
        color: 'var(--text-primary)', outline: 'none', transition: 'border 0.15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--border-active)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    >
      {children}
    </select>
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
);

// ─── Textarea ─────────────────────────────────────────────────
export const Textarea = ({ label, error, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
    <textarea
      style={{
        background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 10, padding: '10px 14px', fontSize: 14,
        color: 'var(--text-primary)', outline: 'none', transition: 'border 0.15s',
        resize: 'vertical', minHeight: 90,
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--border-active)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, width = 480 }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: width,
        padding: 28, maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-secondary)', border: 'none', borderRadius: 8,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Alert ───────────────────────────────────────────────────
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  const cfg = {
    error:   { bg: 'var(--danger-bg)',  border: 'rgba(248,113,113,0.3)', color: 'var(--danger)' },
    success: { bg: 'var(--success-bg)', border: 'rgba(52,211,153,0.3)',  color: 'var(--success)' },
    info:    { bg: 'var(--info-bg)',    border: 'rgba(96,165,250,0.3)',   color: 'var(--info)' },
  }[type];
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: 14,
    }}>
      {message}
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────
export const EmptyState = ({ icon = '◎', title, message, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '64px 24px', gap: 12,
    color: 'var(--text-muted)', textAlign: 'center',
  }}>
    <span style={{ fontSize: 48, opacity: 0.4 }}>{icon}</span>
    <h3 style={{ fontWeight: 600, fontSize: 17, color: 'var(--text-secondary)' }}>{title}</h3>
    {message && <p style={{ fontSize: 14, maxWidth: 300 }}>{message}</p>}
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </div>
);

// ─── Avatar ──────────────────────────────────────────────────
import { getInitials, getAvatarColor } from '../utils/helpers';

export const Avatar = ({ name = '', size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: getAvatarColor(name),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: size * 0.35,
    color: '#fff', flexShrink: 0,
  }}>
    {getInitials(name)}
  </div>
);

// ─── Page Header ─────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
