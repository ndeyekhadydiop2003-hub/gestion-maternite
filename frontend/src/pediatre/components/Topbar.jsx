import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

export default function Topbar({ onNavigate }) {
  const [medecin,    setMedecin]    = useState({ nom: '...', role: '...', initiales: '?' });
  const [query,      setQuery]      = useState('');
  const [resultats,  setResultats]  = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [showDrop,   setShowDrop]   = useState(false);
  const searchRef = useRef(null);
  const timerRef  = useRef(null);

  // ── Charger le médecin connecté ──
  useEffect(() => {
    api.get('/me')
      .then(res => {
        const u         = res.data;
        const fullName  = `${u.prenom} ${u.nom}`;
        const initiales = `${u.prenom[0]}${u.nom[0]}`.toUpperCase();
        setMedecin({ nom: fullName, role: u.role_acces ?? '—', initiales });
      })
      .catch(() => {});
  }, []);

  // ── Fermer dropdown si clic extérieur ──
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Recherche avec debounce ──
  const handleSearch = useCallback((value) => {
    setQuery(value);
    clearTimeout(timerRef.current);

    if (value.length < 2) {
      setResultats([]);
      setShowDrop(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res  = await api.get(`/nouveau-nes?search=${encodeURIComponent(value)}&per_page=5`);
        const data = res.data?.data ?? res.data ?? [];
        setResultats(Array.isArray(data) ? data : []);
        setShowDrop(true);
      } catch {
        setResultats([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelect = (bebe) => {
    setQuery('');
    setResultats([]);
    setShowDrop(false);
    onNavigate('dossier-detail', bebe.id_nouveau_ne);
  };

  const getNomBebe = (b) => {
    const patiente = b.accouchement?.grossesse?.patiente;
    return patiente
      ? `Bébé de ${patiente.prenom} ${patiente.nom}`
      : `Nouveau-né #${b.id_nouveau_ne}`;
  };

  const getPoidsStatut = (poids) => {
    if (!poids || poids === 0) return { cls: 'b-gray', label: '—' };
    if (poids >= 2.5) return { cls: 'b-normal',     label: '✓ Normal' };
    if (poids >= 1.5) return { cls: 'b-surveiller', label: '⚠' };
    return               { cls: 'b-critique',   label: '⛔' };
  };

  return (
    <div className="topbar">
      {/* ── Barre de recherche ── */}
      <div className="search-wrap" ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
        <span>🔍</span>
        <input
          placeholder="Chercher un bébé, dossier..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => resultats.length > 0 && setShowDrop(true)}
          style={{ width: '100%' }}
        />
        {searching && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--gray)' }}>
            ⏳
          </span>
        )}

        {/* ── Dropdown résultats ── */}
        {showDrop && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1.5px solid var(--sand)', zIndex: 1000, overflow: 'hidden',
          }}>
            {resultats.length === 0 ? (
              <div style={{ padding: '16px 18px', color: 'var(--gray)', fontSize: 13, textAlign: 'center' }}>
                Aucun résultat pour &quot;{query}&quot;
              </div>
            ) : (
              <>
                <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--gray)', borderBottom: '1px solid var(--sand)', fontWeight: 600 }}>
                  {resultats.length} résultat{resultats.length > 1 ? 's' : ''} trouvé{resultats.length > 1 ? 's' : ''}
                </div>
                {resultats.map(b => {
                  const statut   = getPoidsStatut(b.poids_naissance);
                  const patiente = b.accouchement?.grossesse?.patiente;
                  return (
                    <div
                      key={b.id_nouveau_ne}
                      onClick={() => handleSelect(b)}
                      style={{
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: '1px solid var(--sand)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--rose-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, border: '1.5px solid var(--rose-border)',
                        flexShrink: 0,
                      }}>
                        👶
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark)' }}>
                          {getNomBebe(b)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 1 }}>
                          NB{String(b.id_nouveau_ne).padStart(4, '0')}
                          {patiente && ` · Mère : ${patiente.prenom} ${patiente.nom}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        <span className={`badge ${statut.cls}`} style={{ fontSize: 10 }}>
                          {b.poids_naissance ? `${b.poids_naissance} kg` : '—'}
                        </span>
                        <span className={`badge ${statut.cls}`} style={{ fontSize: 10 }}>
                          {statut.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div
                  style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: 'var(--rose-2)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { setShowDrop(false); onNavigate('dossiers'); }}
                >
                  Voir tous les dossiers →
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="tb-actions">
        <div className="icon-btn" onClick={() => onNavigate('notifications')}>
          🔔<div className="notif-dot" />
        </div>

        <div className="tb-profile">
          <div className="ta">{medecin.initiales}</div>
          <div>
            <div className="tname">{medecin.nom}</div>
            <div className="trole">{medecin.role}</div>
          </div>
          <span style={{ color: 'var(--gray)', marginLeft: 4 }}>▾</span>
        </div>
      </div>
    </div>
  );
}

Topbar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};