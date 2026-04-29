import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_MAP = {
  urgent: { ico: 'crit', emoji: '🚨' },
  alerte: { ico: 'warn', emoji: '⚠️' },
  info:   { ico: 'info', emoji: '📋' },
};

const TABS = ['Tous', 'Non lus', 'Alertes'];

export default function Notifications() {
  const [activeTab, setActiveTab]         = useState('Tous');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data ?? []))
      .catch(err => setError(err.response?.data?.message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = () => {
    api.put('/notifications/lire-tout')
      .then(() =>
        setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
      )
      .catch(() => {});
  };

  const handleMarkRead = (id) => {
    if (!id) return; // ✅ garde-fou
    api.put(`/notifications/${id}/lu`)
      .then(() =>
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, lu: true } : n)
        )
      )
      .catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  const filtered = notifications.filter(n => {
    if (activeTab === 'Non lus')  return !n.lu;
    if (activeTab === 'Alertes')  return n.type === 'urgent' || n.type === 'alerte';
    return true;
  });

  // ── Rendu états ──────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 28 }}>⏳</div>
        <p style={{ color: 'var(--gray)', marginTop: 8 }}>Chargement...</p>
      </div>
    );

    if (error) return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 28 }}>❌</div>
        <p style={{ color: 'red', marginTop: 8 }}>{error}</p>
      </div>
    );

    if (filtered.length === 0) return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>
        Aucune notification.
      </div>
    );

    return filtered.map(n => {
      const { ico, emoji } = TYPE_MAP[n.type] ?? TYPE_MAP.info;
      const dateStr = n.created_at
        ? new Date(n.created_at).toLocaleDateString('fr-FR')
        : '—';

      return (
        <div
          key={n.id}
          className="notif-item"
          style={{ opacity: n.lu ? 0.6 : 1, cursor: n.lu ? 'default' : 'pointer' }}
          onClick={() => !n.lu && handleMarkRead(n.id)}
        >
          <div className={`notif-ico ${ico}`}>{emoji}</div>
          <div className="notif-text">
            <div className="notif-name">
              {n.titre}
              {!n.lu && (
                <span className="badge b-rose" style={{ marginLeft: 6 }}>Nouveau</span>
              )}
            </div>
            <div className="notif-desc">{n.message}</div>
          </div>
          <div className="notif-time">{dateStr}</div>
        </div>
      );
    });
  };

  return (
    <div className="page-anim">
      <div className="page-title">
        <h2>
          Notifications
          {unreadCount > 0 && (
            <span className="badge b-rose" style={{ marginLeft: 8 }}>
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <span
            style={{ fontSize: 12, color: 'var(--rose-2)', cursor: 'pointer' }}
            onClick={handleMarkAllRead}
          >
            Tout marquer comme lu
          </span>
        )}
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <div
            key={t}
            className={`tab${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="card card-pad">
        {renderContent()}
      </div>
    </div>
  );
}