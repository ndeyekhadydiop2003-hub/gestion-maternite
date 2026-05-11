import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_MAP = {
  urgent: { emoji: '🚨', cls: 'b-critique',   bg: '#fff1f1', border: '#ffb3b3', color: '#dc2626', label: 'Urgent' },
  alerte: { emoji: '⚠️', cls: 'b-surveiller', bg: '#fffbeb', border: '#fcd34d', color: '#d97706', label: 'Alerte' },
  info:   { emoji: '📋', cls: 'b-rose',        bg: '#fff8fb', border: '#f9a8d4', color: '#be185d', label: 'Info'   },
};

const TABS = ['Tous', 'Non lus', 'Alertes'];

export default function Notifications() {
  const [activeTab,     setActiveTab]     = useState('Tous');
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data ?? []))
      .catch(err => setError(err.response?.data?.message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = () => {
    api.patch('/notifications/tout-lu')
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, lu: true }))))
      .catch(() => {});
  };

  const handleMarkRead = (id) => {
    if (!id) return;
    api.put(`/notifications/${id}/lu`)
      .then(() => setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n)))
      .catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.lu).length;
  const alertCount  = notifications.filter(n => n.type === 'urgent' || n.type === 'alerte').length;

  const counts = {
    Tous:      notifications.length,
    'Non lus': unreadCount,
    Alertes:   alertCount,
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'Non lus') return !n.lu;
    if (activeTab === 'Alertes') return n.type === 'urgent' || n.type === 'alerte';
    return true;
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)        return 'À l\'instant';
    if (diff < 3600)      return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)     return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 86400 * 2) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="page-anim">

      {/* ── Titre ── */}
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2>🔔 Notifications</h2>
          {unreadCount > 0 && (
            <span className="badge b-rose">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="btn-primary btn-sm"
            style={{ background: 'var(--bg)', color: 'var(--dark)', border: '1.5px solid var(--sand)', fontSize: 12 }}
            onClick={handleMarkAllRead}
          >
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* ── Résumé rapide ── */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total',   count: notifications.length, emoji: '🔔', color: 'var(--rose)',  bg: 'var(--rose-light)',  border: 'var(--rose)'  },
            { label: 'Non lus', count: unreadCount,          emoji: '📬', color: 'var(--amber)', bg: 'var(--amber-light)', border: 'var(--amber)' },
            { label: 'Alertes', count: alertCount,           emoji: '🚨', color: '#dc2626',      bg: '#fff1f1',            border: '#ffb3b3'      },
          ].map(({ label, count, emoji, color, bg, border }) => (
            <div key={label} style={{
              background: '#fff',
              border: `1px solid ${border}`,
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {emoji}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3, fontWeight: 500 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tabs">
        {TABS.map(t => (
          <div
            key={t}
            className={`tab${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
            <span style={{
              marginLeft: 6, fontSize: 10,
              background: activeTab === t ? 'var(--rose)' : 'var(--sand)',
              color:      activeTab === t ? '#fff'        : 'var(--gray)',
              padding: '1px 6px', borderRadius: 10, fontWeight: 700,
            }}>
              {counts[t]}
            </span>
          </div>
        ))}
      </div>

      {/* ── Card principale ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Chargement */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 36 }}>⏳</div>
            <p style={{ color: 'var(--gray)', marginTop: 12, fontSize: 14 }}>Chargement des notifications…</p>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 36 }}>❌</div>
            <p style={{ color: 'red', marginTop: 12, fontSize: 14 }}>{error}</p>
            <button
              className="btn-primary btn-sm"
              style={{ marginTop: 14 }}
              onClick={() => {
                setLoading(true);
                setError(null);
                api.get('/notifications')
                  .then(res => setNotifications(res.data ?? []))
                  .catch(err => setError(err.response?.data?.message || 'Erreur.'))
                  .finally(() => setLoading(false));
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Vide */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔕</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)' }}>Aucune notification</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {activeTab === 'Non lus'
                ? 'Toutes vos notifications ont été lues.'
                : activeTab === 'Alertes'
                ? 'Aucune alerte urgente pour le moment.'
                : 'Vous n\'avez pas encore de notifications.'}
            </div>
          </div>
        )}

        {/* Liste */}
        {!loading && !error && filtered.length > 0 && (
          <div>
            {filtered.map((n, i) => {
              const typeInfo = TYPE_MAP[n.type] ?? TYPE_MAP.info;
              const isLast   = i === filtered.length - 1;

              return (
                <div
                  key={n.id}
                  onClick={() => !n.lu && handleMarkRead(n.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '18px 24px',
                    borderBottom: isLast ? 'none' : '1px solid var(--bg)',
                    background: n.lu ? '#fff' : '#fef6fa',
                    cursor: n.lu ? 'default' : 'pointer',
                    transition: 'background .15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!n.lu) e.currentTarget.style.background = 'var(--rose-light)'; }}
                  onMouseLeave={e => { if (!n.lu) e.currentTarget.style.background = '#fef6fa'; }}
                >
                  {/* Barre gauche colorée si non lu */}
                  {!n.lu && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 4, borderRadius: '4px 0 0 4px',
                      background: typeInfo.color,
                    }} />
                  )}

                  {/* Icône */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: typeInfo.bg,
                    border: `1.5px solid ${typeInfo.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {typeInfo.emoji}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 14, fontWeight: n.lu ? 500 : 700,
                        color: 'var(--dark)',
                      }}>
                        {n.titre}
                      </span>
                      {!n.lu && (
                        <span className="badge b-rose" style={{ fontSize: 9, padding: '2px 7px' }}>Nouveau</span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 20,
                        background: typeInfo.bg,
                        color: typeInfo.color,
                        border: `1px solid ${typeInfo.border}`,
                      }}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13, color: 'var(--gray)',
                      lineHeight: 1.6,
                    }}>
                      {n.message}
                    </div>
                  </div>

                  {/* Temps + point */}
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-end', gap: 8, flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 11, color: 'var(--gray)',
                      whiteSpace: 'nowrap', fontWeight: 500,
                    }}>
                      {formatTime(n.created_at)}
                    </span>
                    {!n.lu && (
                      <div style={{
                        width: 9, height: 9, borderRadius: '50%',
                        background: typeInfo.color,
                        boxShadow: `0 0 0 3px ${typeInfo.bg}`,
                      }} />
                    )}
                    {n.lu && (
                      <span style={{ fontSize: 11, color: '#86efac', fontWeight: 600 }}>✓ Lu</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}