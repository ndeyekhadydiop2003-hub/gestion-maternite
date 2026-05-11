import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_MAP = {
  urgent: { emoji: '🚨', bg: '#fff1f1', border: '#ffb3b3', color: '#dc2626', label: 'Urgent' },
  alerte: { emoji: '⚠️', bg: '#fffbeb', border: '#fcd34d', color: '#d97706', label: 'Alerte' },
  info:   { emoji: '📋', bg: 'var(--teal-light)', border: 'var(--teal-border)', color: 'var(--teal)', label: 'Info' },
};

export default function Notifications() {
  const [activeTab,     setActiveTab]     = useState('Tous');
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data ?? []))
      .catch(() => {})
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

  const filtered = notifications.filter(n => {
    if (activeTab === 'Non lus') return !n.lu;
    if (activeTab === 'Alertes') return n.type === 'urgent' || n.type === 'alerte';
    return true;
  });

  const counts = { Tous: notifications.length, 'Non lus': unreadCount, Alertes: alertCount };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60)        return 'À l\'instant';
    if (diff < 3600)      return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)     return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800)    return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="inf-page-anim">
      <div className="inf-page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2>🔔 Notifications</h2>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--teal)', color: '#fff',
              fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 10,
            }}>
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="inf-btn-secondary" style={{ fontSize: 12 }} onClick={handleMarkAllRead}>
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Résumé */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total',   count: notifications.length, emoji: '🔔', color: 'var(--teal)',  bg: 'var(--teal-light)',  border: 'var(--teal-border)' },
            { label: 'Non lus', count: unreadCount,          emoji: '📬', color: 'var(--amber)', bg: 'var(--amber-light)', border: '#fcd34d'            },
            { label: 'Alertes', count: alertCount,           emoji: '🚨', color: '#dc2626',      bg: '#fff1f1',            border: '#ffb3b3'            },
          ].map(({ label, count, emoji, color, bg, border }) => (
            <div key={label} style={{
              background: '#fff', border: `1px solid ${border}`,
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{emoji}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="inf-tabs">
        {['Tous', 'Non lus', 'Alertes'].map(t => (
          <div key={t} className={`inf-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
            <span style={{
              marginLeft: 4, fontSize: 10, fontWeight: 700,
              background: activeTab === t ? 'var(--teal)' : 'var(--sand)',
              color: activeTab === t ? '#fff' : 'var(--gray)',
              padding: '1px 6px', borderRadius: 10,
            }}>{counts[t]}</span>
          </div>
        ))}
      </div>

      <div className="inf-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && <div className="inf-center"><div className="ico">⏳</div><p>Chargement...</p></div>}

        {!loading && filtered.length === 0 && (
          <div className="inf-center">
            <div className="ico">🔕</div>
            <p style={{ fontWeight: 700, color: 'var(--dark)' }}>Aucune notification</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              {activeTab === 'Non lus' ? 'Tout est lu.' : activeTab === 'Alertes' ? 'Aucune alerte.' : 'Pas encore de notifications.'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && filtered.map((n, i) => {
          const typeInfo = TYPE_MAP[n.type] ?? TYPE_MAP.info;
          const isLast = i === filtered.length - 1;
          return (
            <div
              key={n.id}
              onClick={() => !n.lu && handleMarkRead(n.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '18px 24px',
                borderBottom: isLast ? 'none' : '1px solid var(--bg)',
                background: n.lu ? '#fff' : 'var(--teal-light)',
                cursor: n.lu ? 'default' : 'pointer',
                transition: 'background .15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!n.lu) e.currentTarget.style.background = '#e0f7f4'; }}
              onMouseLeave={e => { if (!n.lu) e.currentTarget.style.background = 'var(--teal-light)'; }}
            >
              {!n.lu && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 4, borderRadius: '4px 0 0 4px', background: typeInfo.color,
                }} />
              )}
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: typeInfo.bg, border: `1.5px solid ${typeInfo.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{typeInfo.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: n.lu ? 500 : 700, color: 'var(--dark)' }}>{n.titre}</span>
                  {!n.lu && (
                    <span style={{ background: 'var(--teal)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>Nouveau</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: typeInfo.bg, color: typeInfo.color, border: `1px solid ${typeInfo.border}` }}>
                    {typeInfo.label}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>{n.message}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--gray)', whiteSpace: 'nowrap' }}>{formatTime(n.created_at)}</span>
                {!n.lu
                  ? <div style={{ width: 9, height: 9, borderRadius: '50%', background: typeInfo.color, boxShadow: `0 0 0 3px ${typeInfo.bg}` }} />
                  : <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ Lu</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
