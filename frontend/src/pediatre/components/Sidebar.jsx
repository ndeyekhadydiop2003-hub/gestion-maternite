import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const navItems = [
  { id: 'dash',          icon: '🏠', label: 'Dashboard' },
  { id: 'nouveau-nes',   icon: '👶', label: 'Nouveau-nés' },
  { id: 'dossiers',      icon: '📋', label: 'Dossiers médicaux' },
  { id: 'croissance',    icon: '📈', label: 'Suivi & croissance' },
  { id: 'soins',         icon: '💊', label: 'Soins & traitements' },
  { id: 'vaccins',       icon: '💉', label: 'Vaccins' },
  { id: 'notifications', icon: '🔔', label: 'Notifications', hasBadge: true },
  { id: 'profil',        icon: '👤', label: 'Profil' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [medecin,      setMedecin]      = useState({ nom: '...', role: '...', initiales: '?' });
  const [unreadCount,  setUnreadCount]  = useState(0);

  // Charger infos médecin
  useEffect(() => {
    api.get('/me')
      .then(res => {
        const u = res.data;
        setMedecin({
          nom:      u.login      ?? '—',
          role:     u.role_acces ?? '—',
          initiales: u.login ? u.login.slice(0, 2).toUpperCase() : '?',
        });
      })
      .catch(() => {});
  }, []);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    const fetchUnread = () => {
      api.get('/notifications')
        .then(res => {
          const notifs = res.data ?? [];
          setUnreadCount(notifs.filter(n => !n.lu).length);
        })
        .catch(() => {});
    };

    fetchUnread();

    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="ico">🏥</div>
        <div>
          <div className="brand-name">Maternité Hopital Regional Thies</div>
          <div className="brand-sub">Pédiatrie</div>
        </div>
      </div>

      <div className="sb-user">
        <div className="ava">{medecin.initiales}</div>
        <div>
          <div className="uname">{medecin.nom}</div>
          <div className="urole">{medecin.role}</div>
        </div>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Navigation</div>
        {navItems.map(item => {
          const badgeCount = item.hasBadge ? unreadCount : 0;
          return (
            <div
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {badgeCount > 0
                ? <span className="nav-badge">{badgeCount}</span>
                : <div className="nav-dot" />
              }
            </div>
          );
        })}
      </nav>

      <div className="sb-footer">
        <button className="btn-logout" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}>
          ⎋ Se déconnecter
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  activePage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};