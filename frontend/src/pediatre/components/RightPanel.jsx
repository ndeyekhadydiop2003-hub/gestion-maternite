import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const formatDate   = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const getSexeLabel = (s) => ({ masculin: '👦 Garçon', feminin: '👧 Fille', indetermine: '❓' }[s] || '—');

const getApgarBadge = (score) => {
  if (score == null) return { cls: 'b-gray',      label: '—' };
  if (score >= 7)    return { cls: 'b-normal',     label: `${score}/10` };
  if (score >= 4)    return { cls: 'b-surveiller', label: `${score}/10 ⚠` };
  return                    { cls: 'b-critique',   label: `${score}/10 ⛔` };
};

const getEtatPoids = (poids) => {
  if (!poids) return { cls: 'b-gray', label: '—' };
  if (poids >= 2.5) return { cls: 'b-normal',     label: '✓ Normal' };
  if (poids >= 1.5) return { cls: 'b-surveiller', label: '⚠ Surveiller' };
  return                   { cls: 'b-critique',   label: '⛔ Critique' };
};

export default function RightPanel({ babyId = null, onNavigate = () => {} }) {
  const [activeTab, setActiveTab] = useState('Profil');
  const [bebe,      setBebe]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const tabs = ['Profil', 'Consultations', 'Prescriptions'];

  useEffect(() => {
    if (!babyId) { setBebe(null); setActiveTab('Profil'); return; }
    setLoading(true);
    api.get(`/nouveau-nes/${babyId}`)
      .then(res => setBebe(res.data))
      .catch(() => setBebe(null))
      .finally(() => setLoading(false));
  }, [babyId]);

  const patiente  = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
  const nomBebe   = patiente
    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
    : bebe ? `Nouveau-né #${bebe.id_nouveau_ne}` : '—';
  const idBebe    = bebe ? `NB${String(bebe.id_nouveau_ne).padStart(4, '0')}` : '—';
  const dateNaiss = formatDate(bebe?.created_at);
  const apgar1    = getApgarBadge(bebe?.apgar_1min);
  const apgar5    = getApgarBadge(bebe?.apgar_5min);
  const etatPoids = getEtatPoids(bebe?.poids_naissance);

  return (
    <div className="right-panel">

      {!babyId && !loading && <GlobalPanel onNavigate={onNavigate} />}

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28 }}>⏳</div>
          <p style={{ color: 'var(--gray)', marginTop: 8, fontSize: 12 }}>Chargement...</p>
        </div>
      )}

      {!loading && bebe && (
        <>
          {/* ── Header bébé ── */}
          <div style={{
            background: 'linear-gradient(135deg, var(--rose-light), #fff)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 14,
            border: '1px solid var(--rose-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--rose)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>👶</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--dark)' }}>{nomBebe}</div>
                <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
                  {idBebe} · Né le {dateNaiss}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span className={`badge ${etatPoids.cls}`} style={{ fontSize: 10 }}>
                    {etatPoids.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Actions rapides ── */}
          <div className="rp-actions" style={{ marginBottom: 14 }}>
            {[
              ['📋', 'Consulter', 'ajouter-consultation'],
              ['💊', 'Prescrire', 'ajouter-traitement'],
              ['🩺', 'Planifier', 'planifier-soin'],
            ].map(([icon, label, page]) => (
              <div key={label} className="rpa"
                onClick={() => onNavigate(page, babyId)}
                style={{ cursor: 'pointer' }}>
                <span className="rpa-icon">{icon}</span>{label}
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="ptabs" style={{ marginBottom: 12 }}>
            {tabs.map(t => (
              <div key={t}
                className={`ptab${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}>
                {t}
              </div>
            ))}
          </div>

          {/* ── Profil ── */}
          {activeTab === 'Profil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                ['Sexe',   getSexeLabel(bebe.sexe)],
                ['Poids',  bebe.poids_naissance ? `${bebe.poids_naissance} kg` : '—'],
                ['Taille', bebe.taille          ? `${bebe.taille} cm`          : '—'],
                ['Mère',   patiente ? `${patiente.prenom} ${patiente.nom}` : '—'],
              ].map(([l, v]) => (
                <div key={l} className="info-row">
                  <span className="lbl">{l}</span>
                  <span className="val">{v}</span>
                </div>
              ))}
              <div className="info-row">
                <span className="lbl">Apgar 1min</span>
                <span className="val">
                  <span className={`badge ${apgar1.cls}`}>{apgar1.label}</span>
                </span>
              </div>
              <div className="info-row">
                <span className="lbl">Apgar 5min</span>
                <span className="val">
                  <span className={`badge ${apgar5.cls}`}>{apgar5.label}</span>
                </span>
              </div>

              {bebe.accouchement && (
                <div style={{
                  marginTop: 10, padding: '10px 12px',
                  background: '#f9f9fc', borderRadius: 8,
                  border: '1px solid var(--sand)', fontSize: 12,
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--rose-2)' }}>
                    🏥 Accouchement
                  </div>
                  {[
                    ['Type', bebe.accouchement?.type_accouchement?.replace('_', ' ') ?? '—'],
                    ['Date', formatDate(bebe.accouchement?.date_accouchement)],
                    ['Complications', bebe.accouchement?.complication ?? 'Aucune'],
                  ].map(([l, v]) => (
                    <div key={l} className="info-row">
                      <span className="lbl">{l}</span>
                      <span className="val">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Consultations ── */}
          {activeTab === 'Consultations' && (
            <ConsultationsBebe
              patienteId={patiente?.id_patient}
              onNavigate={onNavigate}
              babyId={babyId}
            />
          )}

          {/* ── Prescriptions ── */}
          {activeTab === 'Prescriptions' && (
            <PrescriptionsBebe
              patienteId={patiente?.id_patient}
              onNavigate={onNavigate}
              babyId={babyId}
            />
          )}
        </>
      )}
    </div>
  );
}

RightPanel.propTypes = {
  babyId:     PropTypes.number,
  onNavigate: PropTypes.func,
};

// ══════════════════════════════════════════════════════════
function GlobalPanel({ onNavigate = () => {} }) {
  const [stats, setStats] = useState({ total: 0, normal: 0, surveiller: 0, critique: 0 });

  useEffect(() => {
    api.get('/nouveau-nes?per_page=100')
      .then(res => {
        const list = Array.isArray(res.data?.data ?? res.data) ? (res.data?.data ?? res.data) : [];
        let normal = 0, surveiller = 0, critique = 0;
        list.forEach(b => {
          const p = parseFloat(b.poids_naissance) || 0;
          if      (p >= 2.5) normal++;
          else if (p >= 1.5) surveiller++;
          else if (p > 0)    critique++;
          else               normal++;
        });
        setStats({ total: list.length, normal, surveiller, critique });
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        color: 'var(--gray)', fontSize: 13,
        background: '#f9f9fc', borderRadius: 10,
        border: '1px solid var(--sand)', marginBottom: 16,
      }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>👶</div>
        Sélectionnez un bébé pour voir son dossier complet.
      </div>

      <div className="rp-title">📊 Vue globale</div>
      <div className="resume-box">
        <div className="rb-title">Bébés suivis : {stats.total}</div>
        {[
          ['var(--teal)',  stats.normal,     'Normal',     'b-normal',     '✓ Normal'],
          ['var(--amber)', stats.surveiller, 'Surveiller', 'b-surveiller', '⚠'],
          ['var(--red)',   stats.critique,   'Critique',   'b-critique',   '⛔'],
        ].map(([color, num, lbl, badge, bl]) => (
          <div key={lbl} className="rb-row">
            <div>
              <span className="rb-num" style={{ color }}>{num}</span>
              {' '}<span className="rb-lbl">{lbl}</span>
            </div>
            <span className={`badge ${badge}`}>{bl}</span>
          </div>
        ))}
      </div>

      <div className="rp-title" style={{ marginTop: 16 }}>💊 Dernières prescriptions</div>
      <DernieresPrescriptions />

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn-primary btn-sm" style={{ width: '100%' }}
          onClick={() => onNavigate('nouveau-nes')}>
          👶 Voir tous les bébés
        </button>
        <button className="btn-primary btn-sm"
          style={{ width: '100%', background: 'var(--teal)' }}
          onClick={() => onNavigate('ajouter-consultation')}>
          📋 Nouvelle consultation
        </button>
        <button className="btn-primary btn-sm"
          style={{ width: '100%', background: 'var(--amber)' }}
          onClick={() => onNavigate('ajouter-traitement')}>
          💊 Nouveau traitement
        </button>
      </div>
    </>
  );
}

GlobalPanel.propTypes = { onNavigate: PropTypes.func };

// ══════════════════════════════════════════════════════════
function ConsultationsBebe({ patienteId = null, onNavigate = () => {}, babyId = null }) {
  const [consultations, setConsultations] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!patienteId) { setLoading(false); return; }
    api.get(`/consultations?id_patient=${patienteId}&per_page=5`)
      .then(res => {
        const all = res.data?.data ?? res.data ?? [];
        setConsultations(Array.isArray(all) ? all.slice(0, 5) : []);
      })
      .catch(() => setConsultations([]))
      .finally(() => setLoading(false));
  }, [patienteId]);

  if (loading) return (
    <div style={{ padding: 16, color: 'var(--gray)', fontSize: 12, textAlign: 'center' }}>⏳ Chargement...</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {consultations.length === 0 ? (
        <div style={{ padding: 16, color: 'var(--gray)', fontSize: 12, textAlign: 'center' }}>
          Aucune consultation enregistrée.
        </div>
      ) : (
        consultations.map(c => (
          <div key={c.id_consultation} style={{
            background: '#f9f9fc', borderRadius: 8,
            border: '1px solid var(--sand)', padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--dark)' }}>
                🩺 {formatDate(c.date_consultation)}
              </div>
              {c.poids && (
                <span className="badge b-gray" style={{ fontSize: 10 }}>{c.poids} kg</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>
              {c.motif_consultation ?? c.observation ?? '—'}
            </div>
            {c.personnel && (
              <div style={{ fontSize: 11, color: 'var(--rose-2)', marginTop: 2 }}>
                Dr. {c.personnel?.utilisateur?.prenom} {c.personnel?.utilisateur?.nom}
              </div>
            )}
          </div>
        ))
      )}
      <button className="btn-primary btn-sm"
        style={{ width: '100%', marginTop: 6, background: 'var(--teal)' }}
        onClick={() => onNavigate('ajouter-consultation', babyId)}>
        + Ajouter consultation
      </button>
    </div>
  );
}

ConsultationsBebe.propTypes = {
  patienteId: PropTypes.number,
  onNavigate: PropTypes.func,
  babyId:     PropTypes.number,
};

// ══════════════════════════════════════════════════════════
function PrescriptionsBebe({ patienteId = null, onNavigate = () => {}, babyId = null }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!patienteId) { setLoading(false); return; }
    api.get(`/prescriptions?id_patient=${patienteId}&per_page=5`)
      .then(res => {
        const all = res.data?.data ?? res.data ?? [];
        setPrescriptions(Array.isArray(all) ? all.slice(0, 5) : []);
      })
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, [patienteId]);

  if (loading) return (
    <div style={{ padding: 16, color: 'var(--gray)', fontSize: 12, textAlign: 'center' }}>⏳ Chargement...</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {prescriptions.length === 0 ? (
        <div style={{ padding: 16, color: 'var(--gray)', fontSize: 12, textAlign: 'center' }}>
          Aucune prescription enregistrée.
        </div>
      ) : (
        prescriptions.map((p, i) => (
          <div key={p.id_prescription ?? i} style={{
            background: '#f9f9fc', borderRadius: 8,
            border: '1px solid var(--sand)', padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--dark)' }}>
                💊 {formatDate(p.date_prescription)}
              </div>
              {p.date_fin && (
                <span className="badge b-gray" style={{ fontSize: 10 }}>
                  Fin : {formatDate(p.date_fin)}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>{p.medicaments ?? '—'}</div>
            {p.posologie && (
              <div style={{ fontSize: 11, color: 'var(--rose-2)', marginTop: 2 }}>{p.posologie}</div>
            )}
          </div>
        ))
      )}
      <button className="btn-primary btn-sm"
        style={{ width: '100%', marginTop: 6, background: 'var(--amber)' }}
        onClick={() => onNavigate('ajouter-traitement', babyId)}>
        + Ajouter traitement
      </button>
    </div>
  );
}

PrescriptionsBebe.propTypes = {
  patienteId: PropTypes.number,
  onNavigate: PropTypes.func,
  babyId:     PropTypes.number,
};

// ══════════════════════════════════════════════════════════
function DernieresPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    api.get('/prescriptions?per_page=3')
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        setPrescriptions(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(() => setPrescriptions([]));
  }, []);

  if (prescriptions.length === 0) return (
    <div style={{ fontSize: 12, color: 'var(--gray)', padding: '8px 0' }}>Aucune prescription active.</div>
  );

  return (
    <>
      {prescriptions.map((p, i) => {
        const patiente = p.patiente ?? p.consultation?.patiente;
        const nom = patiente
          ? `${patiente.prenom} ${patiente.nom}`
          : `Prescription #${p.id_prescription ?? i + 1}`;
        return (
          <div key={p.id_prescription ?? i} className="presc-card">
            <div className="presc-name">{nom}</div>
            <div className="presc-med">💊 {p.medicaments ?? '—'} · {formatDate(p.date_prescription)}</div>
          </div>
        );
      })}
    </>
  );
}