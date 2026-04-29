import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

// ── Helpers ────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const formatHeure = (h) => h ? h.slice(0, 5) : '—';

const getNomBebe = (b) => {
  if (b.mere_prenom && b.mere_nom) return `Bébé de ${b.mere_prenom} ${b.mere_nom}`;
  return `Nouveau-né #${b.id_nouveau_ne}`;
};

const getPoidsStatut = (poids) => {
  if (!poids || poids === 0) return { cls: 'b-gray', label: '—', color: 'var(--gray)' };
  if (poids >= 2.5) return { cls: 'b-normal',     label: '✓ Normal',     color: '#00897B' };
  if (poids >= 1.5) return { cls: 'b-surveiller', label: '⚠ Surveiller', color: '#F57F17' };
  return               { cls: 'b-critique',   label: '⛔ Critique',   color: '#C62828' };
};

const getApgarBadge = (score) => {
  if (score == null) return { cls: 'b-gray', label: '—' };
  if (score >= 7)    return { cls: 'b-normal',     label: `${score}/10` };
  if (score >= 4)    return { cls: 'b-surveiller', label: `${score}/10 ⚠` };
  return                    { cls: 'b-critique',   label: `${score}/10 ⛔` };
};

const getSexeIcon = (sexe) => ({
  masculin: '👦', feminin: '👧', indetermine: '❓'
}[sexe] || '👶');

const getPrioriteStyle = (priorite) => {
  if (priorite === 'urgente') return { cls: 'b-critique', icon: '🚨' };
  return { cls: 'b-amber', icon: '📅' };
};

const getStatutSoinStyle = (statut) => {
  switch (statut) {
    case 'planifie': return { cls: 'b-amber',      label: '🕐 Planifié' };
    case 'en_cours': return { cls: 'b-surveiller', label: '⚙️ En cours' };
    case 'termine':  return { cls: 'b-normal',     label: '✅ Terminé' };
    case 'annule':   return { cls: 'b-critique',   label: '❌ Annulé' };
    default:         return { cls: 'b-gray',       label: statut ?? '—' };
  }
};

// ── Composant carte stat ───────────────────────────────────
function StatCard({ icon, value, label, color, onClick, badge }) {
  return (
    <div
      className="scard"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${color}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px', position: 'relative',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3 }}>{label}</div>
      </div>
      {badge > 0 && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: '#C62828', color: '#fff',
          borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
        }}>
          {badge}
        </div>
      )}
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.string, value: PropTypes.number,
  label: PropTypes.string, color: PropTypes.string,
  onClick: PropTypes.func, badge: PropTypes.number,
};

// ── Dashboard principal ────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/dashboard/pediatre/stats');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de chargement.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="page-anim" style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 40 }}>⏳</div>
      <p style={{ color: 'var(--gray)', marginTop: 16 }}>Chargement du dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="page-anim" style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 40 }}>❌</div>
      <p style={{ color: 'red', marginTop: 16 }}>{error}</p>
      <button className="btn-primary btn-sm" onClick={() => window.location.reload()}>
        Réessayer
      </button>
    </div>
  );

  const d = data;

  return (
    <div className="page-anim">

      {/* ── En-tête ── */}
      <div className="page-title" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>Tableau de bord</h2>
          <div style={{ fontSize: 12, color: 'var(--gray)', textTransform: 'capitalize' }}>
            📅 {today}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary btn-sm" style={{ background: 'var(--teal)' }}
            onClick={() => onNavigate('ajouter-consultation')}>
            + Consultation
          </button>
          <button className="btn-primary btn-sm" style={{ background: 'var(--amber)' }}
            onClick={() => onNavigate('nouveau-nes')}>
            👶 Nouveau-nés
          </button>
        </div>
      </div>

      {/* ── Alerte urgences ── */}
      {(d.rv_urgents > 0 || d.bebes_critique > 0) && (
        <div style={{
          background: '#fee2e2', border: '1.5px solid #fca5a5',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>
              Attention requise
            </div>
            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>
              {d.rv_urgents > 0 && `${d.rv_urgents} RDV urgent${d.rv_urgents > 1 ? 's' : ''} en attente`}
              {d.rv_urgents > 0 && d.bebes_critique > 0 && ' · '}
              {d.bebes_critique > 0 && `${d.bebes_critique} bébé${d.bebes_critique > 1 ? 's' : ''} en état critique`}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats principales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon="👶" value={d.total_bebes}          label="Bébés suivis"          color="var(--rose)"   onClick={() => onNavigate('nouveau-nes')} />
        <StatCard icon="🩺" value={d.consultations_jour}   label="Consultations du jour"  color="var(--teal)"   onClick={() => onNavigate('dossiers')} />
        <StatCard icon="🩹" value={d.soins_aujourd_hui}    label="Soins aujourd'hui"      color="var(--purple)" onClick={() => onNavigate('soins')} />
        <StatCard icon="📅" value={d.rv_en_attente}        label="RDV en attente"         color="var(--amber)"  badge={d.rv_urgents} />
      </div>

      {/* ── Statuts bébés ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '✅', val: d.bebes_normal,     lbl: 'Normal',     color: '#00897B', bg: '#E8F5E9' },
          { icon: '⚠️', val: d.bebes_surveiller, lbl: 'À surveiller', color: '#F57F17', bg: '#FFF8E1' },
          { icon: '⛔', val: d.bebes_critique,   lbl: 'Critique',   color: '#C62828', bg: '#FFEBEE' },
        ].map(({ icon, val, lbl, color, bg }) => (
          <div key={lbl} style={{
            background: bg, borderRadius: 10, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            border: `1px solid ${color}30`,
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--gray)' }}>{lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grille principale ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* ── Planifications en attente ── */}
        <div className="card">
          <div className="card-head">
            <h3>📅 RDV en attente</h3>
            <span className="badge b-amber">{d.rv_en_attente} en attente</span>
          </div>
          {d.planifications_en_attente?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--gray)', fontSize: 13 }}>
              ✅ Aucune planification en attente
            </div>
          ) : (
            <div style={{ padding: '0 0 8px' }}>
              {d.planifications_en_attente?.map((rv) => {
                const p = getPrioriteStyle(rv.priorite);
                return (
                  <div key={rv.id} style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--sand)',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <span style={{ fontSize: 18, marginTop: 2 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark)' }}>
                        {rv.patiente_prenom} {rv.patiente_nom}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
                        {rv.motif ?? '—'} · Délai : {rv.delai_recommande ?? '—'}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span className={`badge ${p.cls}`} style={{ fontSize: 10 }}>
                          {rv.priorite === 'urgente' ? '🚨 Urgent' : '📅 Normal'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                      {formatDate(rv.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Prochains RDV confirmés ── */}
        <div className="card">
          <div className="card-head">
            <h3>🗓️ Prochains RDV</h3>
            <span className="badge b-teal">{d.prochain_rdv?.length ?? 0} à venir</span>
          </div>
          {d.prochain_rdv?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--gray)', fontSize: 13 }}>
              Aucun RDV confirmé à venir
            </div>
          ) : (
            <div style={{ padding: '0 0 8px' }}>
              {d.prochain_rdv?.map((rv) => (
                <div key={rv.id_rendez_vous} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--sand)',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{
                    background: 'var(--rose-light)', borderRadius: 8,
                    padding: '6px 10px', textAlign: 'center', minWidth: 48,
                    border: '1px solid var(--rose-border)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--rose-2)' }}>
                      {new Date(rv.date_rv).getDate()}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--gray)' }}>
                      {new Date(rv.date_rv).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark)' }}>
                      {rv.patiente_prenom} {rv.patiente_nom}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
                      🕐 {formatHeure(rv.heure_rv)} · {rv.motif ?? '—'}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${rv.statut === 'confirme' ? 'b-normal' : 'b-amber'}`} style={{ fontSize: 10 }}>
                        {rv.statut === 'confirme' ? '✓ Confirmé' : rv.statut}
                      </span>
                      {rv.priorite === 'urgente' && (
                        <span className="badge b-critique" style={{ fontSize: 10, marginLeft: 4 }}>
                          🚨 Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Soins du jour ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <h3>🩹 Soins du jour</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge b-rose">{d.soins_aujourd_hui} soin{d.soins_aujourd_hui > 1 ? 's' : ''}</span>
            <button className="btn-primary btn-sm" style={{ background: 'var(--purple)' }}
              onClick={() => onNavigate('soins')}>
              Voir tous →
            </button>
          </div>
        </div>
        {d.soins_du_jour?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--gray)', fontSize: 13 }}>
            Aucun soin planifié pour aujourd&apos;hui
          </div>
        ) : (
          <table className="dtable">
            <thead>
              <tr>
                <th>Bébé</th>
                <th>Type de soin</th>
                <th>Heure</th>
                <th>Fréquence</th>
                <th>Statut</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {d.soins_du_jour?.map((s) => {
                const statut = getStatutSoinStyle(s.statut);
                return (
                  <tr key={s.id_soin}>
                    <td>
                      <div className="baby-cell">
                        <div className="baby-ava">👶</div>
                        <div>
                          <div className="baby-name">
                            {s.mere_prenom && s.mere_nom
                              ? `Bébé de ${s.mere_prenom} ${s.mere_nom}`
                              : `NB${String(s.id_nouveau_ne).padStart(4, '0')}`}
                          </div>
                          <div className="baby-id">NB{String(s.id_nouveau_ne).padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.type_soin ?? '—'}</td>
                    <td>{formatHeure(s.heure_soin)}</td>
                    <td>{s.frequence ?? '—'}</td>
                    <td><span className={`badge ${statut.cls}`}>{statut.label}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--gray)', maxWidth: 160 }}>{s.note ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Derniers bébés + Dernières consultations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Derniers bébés ── */}
        <div className="card">
          <div className="card-head">
            <h3>👶 Derniers nouveau-nés</h3>
            <button className="btn-primary btn-sm" onClick={() => onNavigate('nouveau-nes')}>
              Voir tous →
            </button>
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {d.derniers_bebes?.map((b) => {
              const statut = getPoidsStatut(b.poids_naissance);
              const apgar1 = getApgarBadge(b.apgar_1min);
              return (
                <div key={b.id_nouveau_ne}
                  onClick={() => onNavigate('dossier-detail', b.id_nouveau_ne)}
                  style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--sand)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--rose-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    border: '1.5px solid var(--rose-border)', flexShrink: 0,
                  }}>
                    {getSexeIcon(b.sexe)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark)' }}>
                      {getNomBebe(b)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 1 }}>
                      NB{String(b.id_nouveau_ne).padStart(4, '0')} · {formatDate(b.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                    <span className={`badge ${statut.cls}`} style={{ fontSize: 10 }}>
                      {b.poids_naissance ? `${b.poids_naissance} kg` : '—'}
                    </span>
                    <span className={`badge ${apgar1.cls}`} style={{ fontSize: 10 }}>
                      Apgar {apgar1.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Dernières consultations ── */}
        <div className="card">
          <div className="card-head">
            <h3>🩺 Dernières consultations</h3>
            <button className="btn-primary btn-sm" style={{ background: 'var(--teal)' }}
              onClick={() => onNavigate('dossiers')}>
              Voir tous →
            </button>
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {d['dernières_consultations']?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--gray)', fontSize: 13 }}>
                Aucune consultation récente
              </div>
            ) : (
              d['dernières_consultations']?.map((c) => (
                <div key={c.id_consultation} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--sand)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark)' }}>
                      {c.patiente_prenom} {c.patiente_nom}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {c.poids && (
                        <span className="badge b-gray" style={{ fontSize: 10 }}>
                          {c.poids} kg
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--gray)' }}>
                        {formatDate(c.date_consultation)}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4, lineHeight: 1.4 }}>
                    {c.motif_consultation ?? c.observation ?? '—'}
                  </div>
                  {(c.medecin_prenom || c.medecin_nom) && (
                    <div style={{ fontSize: 11, color: 'var(--rose-2)', marginTop: 4 }}>
                      Dr. {c.medecin_prenom} {c.medecin_nom}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

Dashboard.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};