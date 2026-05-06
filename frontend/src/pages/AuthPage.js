import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/UI';

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', padding: 16, position: 'relative', overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: `
      radial-gradient(ellipse 70% 50% at 20% 30%, rgba(79,142,247,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 70%, rgba(167,139,250,0.06) 0%, transparent 60%)
    `,
  },
  box: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '40px 36px',
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.35s ease',
  },
  logo: {
    textAlign: 'center', marginBottom: 28,
    fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26,
  },
  logoAccent: { color: 'var(--accent)' },
  tabs: { display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, marginBottom: 28 },
  tab: (active) => ({
    flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 600,
    borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    transition: 'all 0.15s',
  }),
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' },
  roleGroup: { display: 'flex', gap: 10 },
  roleBtn: (active) => ({
    flex: 1, padding: '10px 0', borderRadius: 10, border: `1px solid ${active ? 'var(--border-active)' : 'var(--border)'}`,
    background: active ? 'var(--accent-glow)' : 'var(--bg-input)', cursor: 'pointer',
    color: active ? 'var(--accent-light)' : 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
    transition: 'all 0.15s',
  }),
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

  if (user) return <Navigate to="/dashboard" replace />;

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await signup(form.name, form.email, form.password, form.role);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.box}>
        <div style={styles.logo}>
          ◈ Team<span style={styles.logoAccent}>Flow</span>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(tab === 'login')} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button style={styles.tab(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        <Alert message={error} />

        <div style={{ ...styles.form, marginTop: error ? 16 : 0 }}>
          {tab === 'signup' && (
            <Input label="Full Name" placeholder="Jane Smith"
              value={form.name} onChange={e => update('name', e.target.value)} onKeyDown={handleKey} />
          )}
          <Input label="Email Address" type="email" placeholder="you@company.com"
            value={form.email} onChange={e => update('email', e.target.value)} onKeyDown={handleKey} />
          <Input label="Password" type="password" placeholder={tab === 'login' ? '••••••••' : 'Min. 6 characters'}
            value={form.password} onChange={e => update('password', e.target.value)} onKeyDown={handleKey} />

          {tab === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
              <div style={styles.roleGroup}>
                {['member', 'admin'].map(r => (
                  <button key={r} style={styles.roleBtn(form.role === r)} onClick={() => update('role', r)}>
                    {r === 'admin' ? '◈ Admin' : '◎ Member'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button loading={loading} onClick={handleSubmit} style={{ marginTop: 4, width: '100%' }}>
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>

        <p style={styles.footer}>
          {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}>
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}
