import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

export default function Topbar({ onNavigate, unreadCount }) {
  const [user,      setUser]      = useState({ nom: '...', prenom: '...', role_acces: 'infirmiere' });
  const [query,     setQuery]     = useState('');
  const [resultats, setResultats] = useState({ bebes: [], patientes: [] });
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const searchRef = useRef(null);
  const timerRef  = useRef(null);

  useEffect(() => {
    api.get('/me').then(res => setUser(res.data)).catch(() => {});
  }, []);

  // Fermer dropdown si clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    clearTimeout(timerRef.current);

    if (value.length < 2) {
      setResultats({ bebes: [], patientes: [] });
      setShowDrop(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const [bebesRes, patientesRes] = await Promise.all([
          api.get(`/nouveau-nes?search=${encodeURIComponent(value)}&per_page=4`),
          api.get(`/patientes?search=${encodeURIComponent(value)}&per_page=4`),
        ]);
        const bebes     = bebesRes.data?.data    ?? bebesRes.data    ?? [];
        const patientes = patientesRes.data?.data ?? patientesRes.data ?? [];
        setResultats({
          bebes:     Array.isArray(bebes)     ? bebes     : [],
          patientes: Array.isArray(patientes) ? patientes : [],
        });
        setShowDrop(true);
      } catch {
        setResultats({ bebes: [], patientes: [] });
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const getNomBebe = (b) => {
    const patiente = b.accouchement?.grossesse?.patiente ?? b.patiente;
    return patiente
      ? `Bébé de ${patiente.prenom} ${patiente.nom}`
      : `Nouveau-né #${b.id_nouveau_ne}`;
  };

  const handleSelectBebe = (bebe) => {
    setQuery(''); setResultats({ bebes: [], patientes: [] }); setShowDrop(false);
    onNavigate('soins-bebes');
  };

  const handleSelectPatiente = (p) => {
    setQuery(''); setResultats({ bebes: [], patientes: [] }); setShowDrop(false);
    onNavigate('soins-postpart');
  };

  const hasResults = resultats.bebes.length > 0 || resultats.patientes.length > 0;
  const initials   = `${(user.prenom ?? 'I')[0]}${(user.nom ?? 'N')[0]}`.toUpperCase();
  const nomComplet = `${user.prenom ?? ''} ${user.nom ?? ''}`.trim();

  return (
    <header className="inf-topbar">
      {/* Search */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div className="inf-search">
          <span style={{ color: 'var(--rose)' }}>
            {searching ? '⏳' : '🔍'}
          </span>
          <input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher un bébé, une patiente..."
            onFocus={() => hasResults && setShowDrop(true)}
          />
          {query && (
            <span
              style={{ cursor: 'pointer', color: 'var(--gray)', fontSize: 12 }}
              onClick={() => { setQuery(''); setResultats({ bebes: [], patientes: [] }); setShowDrop(false); }}
            >✕</span>
          )}
        </div>

        {/* Dropdown résultats */}
        {showDrop && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
            width: 420, background: '#fff',
            borderRadius: 12, border: '1.5px solid var(--sand)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 200, overflow: 'hidden',
          }}>
            {!hasResults && !searching && (
              <div style={{ padding: '16px 20px', color: 'var(--gray)', fontSize: 13 }}>
                Aucun résultat pour &quot;{query}&quot;
              </div>
            )}

            {/* Bébés */}
            {resultats.bebes.length > 0 && (
              <div>
                <div style={{
                  padding: '8px 16px', fontSize: 10, fontWeight: 700,
                  color: 'var(--gray)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', background: 'var(--bg)',
                }}>
                  👶 Bébés
                </div>
                {resultats.bebes.map(b => (
                  <div
                    key={b.id_nouveau_ne}
                    onClick={() => handleSelectBebe(b)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', cursor: 'pointer',
                      borderBottom: '1px solid var(--bg)',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--rose-light)', border: '1.5px solid var(--rose-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>👶</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>
                        {getNomBebe(b)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray)' }}>
                        NB{String(b.id_nouveau_ne).padStart(4, '0')} · {b.etat_sante ?? '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Patientes */}
            {resultats.patientes.length > 0 && (
              <div>
                <div style={{
                  padding: '8px 16px', fontSize: 10, fontWeight: 700,
                  color: 'var(--gray)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', background: 'var(--bg)',
                }}>
                  🤱 Patientes post-partum
                </div>
                {resultats.patientes.map(p => (
                  <div
                    key={p.id_patient}
                    onClick={() => handleSelectPatiente(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', cursor: 'pointer',
                      borderBottom: '1px solid var(--bg)',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--rose-light)', border: '1.5px solid var(--rose-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>🤱</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>
                        {p.prenom} {p.nom}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray)' }}>
                        P{String(p.id_patient).padStart(4, '0')} · {p.telephone ?? '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="inf-topbar-right">
        {/* Cloche */}
        <div
          onClick={() => onNavigate('notifications')}
          style={{ position: 'relative', cursor: 'pointer', fontSize: 20 }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--amber)',
            }} />
          )}
        </div>

        {/* Chip utilisateur */}
        <div
          onClick={() => onNavigate('profil')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 12px 6px 6px', borderRadius: 24,
            background: 'var(--rose-light)',
            border: '1.5px solid var(--rose-border)',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--rose)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', lineHeight: 1.3 }}>
              {nomComplet}
            </div>
            <div style={{ fontSize: 10, color: 'var(--rose)', fontWeight: 600 }}>
              infirmier(e)
            </div>
          </div>
          <span style={{ fontSize: 10, color: 'var(--gray)' }}>▾</span>
        </div>
      </div>
    </header>
  );
}

Topbar.propTypes = {
  onNavigate:  PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
};