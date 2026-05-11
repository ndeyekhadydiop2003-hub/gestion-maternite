import React from 'react';
import PropTypes from 'prop-types';

const NAV = [
  { key: 'dashboard',      label: 'Dashboard',        emoji: '🏠' },
  { key: 'soins-bebes',    label: 'Soins bébés',      emoji: '👶' },
  { key: 'soins-postpart', label: 'Soins post-partum', emoji: '🤱' },
  { key: 'vaccins',        label: 'Vaccins',           emoji: '💉' },
  { key: 'notifications',  label: 'Notifications',     emoji: '🔔' },
  { key: 'profil',         label: 'Profil',            emoji: '👤' },
];

export default function Sidebar({ activePage, onNavigate, unreadCount }) {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const initials = `${(user.prenom ?? 'I')[0]}${(user.nom ?? 'N')[0]}`.toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="inf-sidebar">

      {/* ── Logo ── */}
      <div className="inf-sidebar-logo">
        <div style={{ fontSize: 22, marginBottom: 6 }}>🏥</div>
        <div className="hospital-name">Maternité Hôpital<br />Régional Thiès</div>
        <div className="hospital-dept">Infirmerie</div>
      </div>

      {/* ── User block ── */}
      <div className="inf-user-block">
        <div className="inf-user-avatar">{initials}</div>
        <div>
          <div className="inf-user-name">{user.prenom ?? ''} {user.nom ?? ''}</div>
          <div className="inf-user-login">{user.login ?? ''}</div>
          <div className="inf-user-role">Infirmier(e)</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="inf-nav">
        <div className="inf-nav-label">Navigation</div>
        {NAV.map(({ key, label, emoji }) => (
          <div
            key={key}
            className={`inf-nav-item${activePage === key ? ' active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span>{emoji}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {key === 'notifications' && unreadCount > 0 && (
              <span style={{
                background: 'var(--rose)', color: '#fff',
                fontSize: 9, fontWeight: 800,
                padding: '1px 6px', borderRadius: 10,
                minWidth: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* ── Déconnexion ── */}
      <div style={{ marginTop: 'auto', padding: '16px 12px' }}>
        <div
          className="inf-nav-item"
          style={{ color: '#dc2626' }}
          onClick={handleLogout}
        >
          <span>🚪</span>
          <span>Se déconnecter</span>
        </div>
      </div>

    </aside>
  );
}

Sidebar.propTypes = {
  activePage:  PropTypes.string.isRequired,
  onNavigate:  PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
};