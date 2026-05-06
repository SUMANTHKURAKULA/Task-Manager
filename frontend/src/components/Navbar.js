import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, getAvatarColor } from '../utils/helpers';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { path: '/projects',  label: 'Projects',  icon: '◈' },
  { path: '/tasks',     label: 'Tasks',     icon: '◎' },
];

const ADMIN_ITEMS = [
  { path: '/users', label: 'Team', icon: '◐' },
];

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(10,15,30,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20,
    color: 'var(--text-primary)', letterSpacing: '-0.5px',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  logoAccent: { color: 'var(--accent)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 8,
    fontSize: 14, fontWeight: active ? 600 : 400,
    color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
    background: active ? 'var(--accent-glow)' : 'transparent',
    border: `1px solid ${active ? 'var(--border-active)' : 'transparent'}`,
    transition: 'all 0.15s',
    cursor: 'pointer',
  }),
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  avatar: (name) => ({
    width: 36, height: 36, borderRadius: '50%',
    background: getAvatarColor(name),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13,
    color: '#fff', cursor: 'pointer', flexShrink: 0,
    border: '2px solid var(--border-active)',
  }),
  dropdown: {
    position: 'absolute', top: 52, right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 8, minWidth: 180,
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
  },
  dropItem: {
    display: 'block', width: '100%', padding: '8px 12px',
    borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: 'var(--text-secondary)', background: 'transparent',
    border: 'none', textAlign: 'left', cursor: 'pointer',
    transition: 'all 0.1s',
  },
  userInfo: {
    padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4,
  },
  userName: { fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' },
  userRole: {
    display: 'inline-block', marginTop: 4,
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: 'var(--accent-glow)', color: 'var(--accent-light)',
    border: '1px solid var(--border-active)', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  mobileMenu: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'transparent', border: 'none',
    color: 'var(--text-secondary)', fontSize: 22, cursor: 'pointer',
  },
};

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/dashboard" style={styles.logo}>
        <span style={{ fontSize: 22 }}>◈</span>
        Team<span style={styles.logoAccent}>Flow</span>
      </Link>

      {/* Desktop Nav Links */}
      <div style={{ ...styles.navLinks, '@media (max-width: 640px)': { display: 'none' } }} className="nav-links">
        {allItems.map(item => (
          <Link key={item.path} to={item.path}
            style={styles.navLink(location.pathname.startsWith(item.path))}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={styles.right}>
        {/* Avatar + Dropdown */}
        <div style={{ position: 'relative' }}>
          <div style={styles.avatar(user?.name || '')}
            onClick={() => setDropOpen(o => !o)}>
            {getInitials(user?.name || 'U')}
          </div>
          {dropOpen && (
            <div style={styles.dropdown} onClick={() => setDropOpen(false)}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user?.name}</div>
                <span style={styles.userRole}>{user?.role}</span>
              </div>
              <button style={styles.dropItem}
                onMouseEnter={e => e.target.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
                onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
