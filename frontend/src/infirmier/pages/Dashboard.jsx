import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const today = () => new Date().toISOString().slice(0, 10);

export default function Dashboard({ onNavigate }) {
  const [soinsBebes,    setSoinsBebes]    = useState([]);
  const [soinsPostpart, setSoinsPostpart] = useState([]);
  const [vaccins,       setVaccins]       = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const t = today();
    Promise.all([
      api.get('/soins').catch(() => ({ data: [] })),
      api.get('/vaccins').catch(() => ({ data: [] })),
    ]).then(([soinsRes, vaccinsRes]) => {
      const allSoins = Array.isArray(soinsRes.data) ? soinsRes.data : (soinsRes.data?.data ?? []);
      setSoinsBebes(allSoins.filter(s => s.id_nouveau_ne && s.date_soin === t));
      setSoinsPostpart(allSoins.filter(s => s.id_patiente && s.date_soin === t));

      const allVaccins = Array.isArray(vaccinsRes.data) ? vaccinsRes.data : (vaccinsRes.data?.data ?? []);
      const flat = allVaccins.flatMap(b => (b.vaccins ?? []).map(v => ({ ...v, bebe: b })));
      setVaccins(flat.filter(v => {
        const date = v.date_administration?.slice(0, 10);
        return date === t && v.statut === 'prevu';
      }));
    }).finally(() => setLoading(false));
  }, []);

  const allSoins = [...soinsBebes, ...soinsPostpart];
  const aFaire   = allSoins.filter(s => s.statut === 'planifie' || s.statut === 'en_cours');
  const termines = allSoins.filter(s => s.statut === 'termine');

  const now = new Date();
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="inf-page-anim inf-center">
      <div className="ico">⏳</div>
      <p>Chargement...</p>
    </div>
  );

  return (
    <div className="inf-page-anim">
      <div className="inf-page-title">
        <div>
          <h2>Tableau de bord</h2>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>
            📅 {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </div>
        </div>
      </div>

      {/* Alerte */}
      {aFaire.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1.5px solid #fcd34d',
          borderRadius: 12, padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 13, fontWeight: 600, color: '#92400e',
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          {aFaire.length} soin{aFaire.length > 1 ? 's' : ''} à effectuer aujourd&apos;hui
          {vaccins.length > 0 && ` · ${vaccins.length} vaccin${vaccins.length > 1 ? 's' : ''} prévu${vaccins.length > 1 ? 's' : ''}`}
        </div>
      )}

      {/* Stats */}
      <div className="inf-stats">
        {[
          { label: 'Soins bébés',      value: soinsBebes.length,    emoji: '👶', bg: 'var(--rose-light)',  color: 'var(--rose)'  },
          { label: 'Soins post-partum', value: soinsPostpart.length, emoji: '🤱', bg: '#fff0e6',           color: '#ea580c'      },
          { label: 'Vaccins prévus',    value: vaccins.length,       emoji: '💉', bg: 'var(--amber-light)', color: 'var(--amber)' },
          { label: 'Terminés',          value: termines.length,      emoji: '✅', bg: 'var(--green-light)', color: 'var(--green)' },
        ].map(({ label, value, emoji, bg, color }) => (
          <div key={label} className="inf-stat" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="inf-stat-icon" style={{ background: bg }}>{emoji}</div>
            <div>
              <div className="inf-stat-value" style={{ color }}>{value}</div>
              <div className="inf-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grille soins + vaccins */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Soins bébés */}
        <div className="inf-card">
          <div className="inf-card-head">
            <h3>👶 Soins bébés — aujourd&apos;hui</h3>
            <button className="inf-btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => onNavigate('soins-bebes')}>
              Voir tout
            </button>
          </div>
          {soinsBebes.length === 0 ? (
            <div className="inf-center" style={{ padding: 30 }}>
              ✅ Aucun soin bébé aujourd&apos;hui
            </div>
          ) : (
            <table className="inf-table">
              <thead>
                <tr><th>Bébé</th><th>Type</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {soinsBebes.slice(0, 5).map(s => {
                  const nn       = s.nouveau_ne ?? s.nouveauNe ?? null;
                  const patiente = nn?.accouchement?.grossesse?.patiente ?? nn?.patiente ?? null;
                  const nom      = patiente
                    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
                    : `NB${String(s.id_nouveau_ne).padStart(4, '0')}`;
                  const statutCls = s.statut === 'termine' ? 'termine'
                    : s.statut === 'en_cours' ? 'en-cours' : 'planifie';
                  return (
                    <tr key={s.id_soin}>
                      <td>
                        <div className="inf-person-cell">
                          <div className="inf-person-ava">👶</div>
                          <div>
                            <div className="inf-person-name">{nom}</div>
                            <div className="inf-person-id">NB{String(s.id_nouveau_ne).padStart(4,'0')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{s.type_soin}</td>
                      <td><span className={`inf-badge ${statutCls}`}>{s.statut}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Vaccins */}
        <div className="inf-card">
          <div className="inf-card-head">
            <h3>💉 Vaccins — aujourd&apos;hui</h3>
            <button className="inf-btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => onNavigate('vaccins')}>
              Voir tout
            </button>
          </div>
          {vaccins.length === 0 ? (
            <div className="inf-center" style={{ padding: 30 }}>
              ✅ Aucun vaccin prévu aujourd&apos;hui
            </div>
          ) : (
            <table className="inf-table">
              <thead>
                <tr><th>Bébé</th><th>Vaccin</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {vaccins.slice(0, 5).map(v => {
                  const bebe     = v.bebe;
                  const patiente = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
                  const nom      = patiente
                    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
                    : `NB${String(v.id_nouveau_ne).padStart(4, '0')}`;
                  return (
                    <tr key={v.id_vaccin}>
                      <td>
                        <div className="inf-person-cell">
                          <div className="inf-person-ava">👶</div>
                          <div>
                            <div className="inf-person-name">{nom}</div>
                            <div className="inf-person-id">NB{String(v.id_nouveau_ne).padStart(4,'0')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{v.nom_vaccin}</td>
                      <td><span className="inf-badge prevu">📅 Prévu</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Soins post-partum */}
      {soinsPostpart.length > 0 && (
        <div className="inf-card">
          <div className="inf-card-head">
            <h3>🤱 Soins post-partum — aujourd&apos;hui</h3>
            <button className="inf-btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => onNavigate('soins-postpart')}>
              Voir tout
            </button>
          </div>
          <table className="inf-table">
            <thead>
              <tr><th>Patiente</th><th>Type</th><th>Heure</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {soinsPostpart.slice(0, 5).map(s => {
                const patiente  = s.patiente ?? null;
                const nom = patiente
                  ? `${patiente.prenom ?? ''} ${patiente.nom ?? ''}`.trim()
                  : `P${String(s.id_patiente).padStart(4, '0')}`;
                const statutCls = s.statut === 'termine' ? 'termine'
                  : s.statut === 'en_cours' ? 'en-cours' : 'planifie';
                return (
                  <tr key={s.id_soin}>
                    <td>
                      <div className="inf-person-cell">
                        <div className="inf-person-ava">🤱</div>
                        <div>
                          <div className="inf-person-name">{nom}</div>
                          <div className="inf-person-id">P{String(s.id_patiente).padStart(4,'0')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{s.type_soin}</td>
                    <td style={{ fontSize: 12 }}>{s.heure_soin ?? '—'}</td>
                    <td><span className={`inf-badge ${statutCls}`}>{s.statut}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Dashboard.propTypes = { onNavigate: PropTypes.func.isRequired };