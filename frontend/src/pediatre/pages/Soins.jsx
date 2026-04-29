import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const getTypeBadge = (p) => {
  const med = (p.medicaments ?? '').toLowerCase();
  if (med.includes('antibio') || med.includes('amoxicil') || med.includes('ampicil') || med.includes('cloxacil'))
    return { cls: 'b-critique',   label: '💊 Antibiotiques' };
  if (med.includes('vitamine') || med.includes('vit ') || med.includes('vit.'))
    return { cls: 'b-normal',     label: '🌿 Vitamine' };
  if (med.includes('surfact'))
    return { cls: 'b-surveiller', label: '🫁 Surfactant' };
  if (med.includes('caféine') || med.includes('cafeine') || med.includes('caffeine'))
    return { cls: 'b-amber',      label: '☕ Caféine' };
  if (med.includes('doliprane') || med.includes('paracétamol') || med.includes('paracetamol'))
    return { cls: 'b-rose',       label: '🌡️ Antalgique' };
  return { cls: 'b-rose', label: '💊 Traitement' };
};

const getStatutVaccinBadge = (statut) => {
  if (statut === 'fait')     return { cls: 'b-normal',   label: '✓ Fait' };
  if (statut === 'prevu')    return { cls: 'b-amber',    label: '📅 Prévu' };
  if (statut === 'non_fait') return { cls: 'b-critique', label: '✗ Non fait' };
  return { cls: 'b-gray', label: '—' };
};

const getStatutSoinBadge = (statut) => {
  switch (statut) {
    case 'planifie': return { cls: 'b-amber',      label: '🕐 Planifié' };
    case 'en_cours': return { cls: 'b-surveiller', label: '⚙️ En cours' };
    case 'termine':  return { cls: 'b-normal',     label: '✅ Terminé' };
    case 'annule':   return { cls: 'b-critique',   label: '❌ Annulé' };
    default:         return { cls: 'b-rose',       label: statut ?? '—' };
  }
};

export default function Soins({ onNavigate }) {
  const [activeTab,     setActiveTab]     = useState('Traitements');
  const [prescriptions, setPrescriptions] = useState([]);
  const [vaccins,       setVaccins]       = useState([]);
  const [soins,         setSoins]         = useState([]);
  const [loadingRx,     setLoadingRx]     = useState(true);
  const [loadingVacc,   setLoadingVacc]   = useState(true);
  const [loadingSoins,  setLoadingSoins]  = useState(true);
  const [error,         setError]         = useState(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [lastPage,      setLastPage]      = useState(1);
  const [total,         setTotal]         = useState(0);

  const fetchPrescriptions = useCallback(async (page) => {
    try {
      setLoadingRx(true);
      setError(null);
      const res  = await api.get(`/prescriptions?page=${page}&per_page=15`);
      const data = res.data;
      setPrescriptions(data.data       ?? []);
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page       ?? 1);
      setTotal(data.total              ?? 0);
    } catch {
      setError('Erreur de chargement des prescriptions.');
    } finally {
      setLoadingRx(false);
    }
  }, []);

  const fetchVaccins = useCallback(async () => {
    try {
      setLoadingVacc(true);
      const res  = await api.get('/vaccins');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.data ?? []);
      const flat = list.flatMap(b =>
        (b.vaccins ?? []).map(v => ({ ...v, bebe: b }))
      );
      setVaccins(flat);
    } catch {
      // silencieux
    } finally {
      setLoadingVacc(false);
    }
  }, []);

  const fetchSoins = useCallback(async () => {
    try {
      setLoadingSoins(true);
      const res  = await api.get('/soins');
      const data = res.data;
      setSoins(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      // silencieux
    } finally {
      setLoadingSoins(false);
    }
  }, []);

  useEffect(() => { fetchPrescriptions(1); }, [fetchPrescriptions]);
  useEffect(() => { fetchVaccins(); },        [fetchVaccins]);
  useEffect(() => { fetchSoins(); },          [fetchSoins]);

  const counts = {
    Traitements: total,
    Vaccins:     vaccins.length,
    Planifies:   soins.length,
  };

  return (
    <div className="page-anim">
      <div className="page-title">
        <h2>Soins &amp; traitements</h2>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {[
          { key: 'Traitements', label: '💊 Traitements' },
          { key: 'Vaccins',     label: '💉 Vaccins' },
          { key: 'Planifies',   label: '🩹 Soins planifiés' },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`tab${activeTab === key ? ' active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
            <span style={{
              marginLeft: 6, fontSize: 10,
              background: activeTab === key ? 'var(--rose)' : 'var(--sand)',
              color:      activeTab === key ? '#fff'        : 'var(--gray)',
              padding: '1px 6px', borderRadius: 10, fontWeight: 700,
            }}>
              {counts[key]}
            </span>
          </div>
        ))}
      </div>

      {/* ══ TRAITEMENTS ══ */}
      {activeTab === 'Traitements' && (
        <div className="card">
          <div className="card-head">
            <h3>💊 Prescriptions & traitements</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--gray)' }}>
                {total} entrée{total > 1 ? 's' : ''}
              </span>
              <button
                style={{ border: '1.5px solid var(--sand)', background: 'var(--bg)', borderRadius: 7, width: 28, height: 28, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                onClick={() => { if (currentPage > 1) fetchPrescriptions(currentPage - 1); }}
                disabled={currentPage === 1}
              >‹</button>
              <button
                style={{ border: '1.5px solid var(--sand)', background: 'var(--bg)', borderRadius: 7, width: 28, height: 28, cursor: currentPage === lastPage ? 'not-allowed' : 'pointer', opacity: currentPage === lastPage ? 0.4 : 1 }}
                onClick={() => { if (currentPage < lastPage) fetchPrescriptions(currentPage + 1); }}
                disabled={currentPage === lastPage}
              >›</button>
            </div>
          </div>

          {loadingRx && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 28 }}>⏳</div>
              <p style={{ color: 'var(--gray)', marginTop: 8 }}>Chargement...</p>
            </div>
          )}

          {!loadingRx && error && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'red' }}>{error}</p>
              <button className="btn-primary btn-sm" onClick={() => fetchPrescriptions(1)}>Réessayer</button>
            </div>
          )}

          {!loadingRx && !error && prescriptions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>
              💊 Aucun traitement enregistré.
            </div>
          )}

          {!loadingRx && !error && prescriptions.length > 0 && (
            <table className="dtable">
              <thead>
                <tr>
                  <th>Patient / ID</th>
                  <th>Type</th>
                  <th>Médicaments</th>
                  <th>Posologie</th>
                  <th>Date prescription</th>
                  <th>Date fin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => {
                  const patiente    = p.patiente ?? p.consultation?.patiente ?? null;
                  const nomPatiente = patiente
                    ? `${patiente.prenom ?? ''} ${patiente.nom ?? ''}`.trim()
                    : `Ordonnance n° ${p.id_prescription}`;
                  const idPatiente  = patiente
                    ? `P${String(patiente.id_patient).padStart(4, '0')}`
                    : '—';
                  const badge = getTypeBadge(p);
                  return (
                    <tr key={p.id_prescription}>
                      <td>
                        <div className="baby-cell">
                          <div className="baby-ava">👤</div>
                          <div>
                            <div className="baby-name">{nomPatiente}</div>
                            <div className="baby-id">{idPatiente}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      <td style={{ fontSize: 12, maxWidth: 160 }}>{p.medicaments ?? '—'}</td>
                      <td style={{ fontSize: 12, maxWidth: 160 }}>{p.posologie   ?? '—'}</td>
                      <td>{formatDate(p.date_prescription)}</td>
                      <td>{formatDate(p.date_fin)}</td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => onNavigate('dossier-detail', patiente?.id_patient ?? null)}
                        >
                          ✏️ Détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ VACCINS ══ */}
      {activeTab === 'Vaccins' && (
        <div className="card">
          <div className="card-head">
            <h3>💉 Suivi vaccinal</h3>
            <button className="btn-primary btn-sm" onClick={() => onNavigate('ajouter-vaccin')}>
              ＋ Enregistrer vaccin
            </button>
          </div>

          {loadingVacc && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 28 }}>⏳</div>
              <p style={{ color: 'var(--gray)', marginTop: 8 }}>Chargement...</p>
            </div>
          )}

          {!loadingVacc && vaccins.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>
              💉 Aucun vaccin enregistré.
            </div>
          )}

          {!loadingVacc && vaccins.length > 0 && (
            <table className="dtable">
              <thead>
                <tr>
                  <th>Bébé / ID</th>
                  <th>Vaccin</th>
                  <th>Date administration</th>
                  <th>Statut</th>
                  <th>Lot</th>
                  <th>Observations</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vaccins.map((v) => {
                  const bebe     = v.bebe;
                  const patiente = bebe?.accouchement?.grossesse?.patiente;
                  const nomBebe  = patiente
                    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
                    : `NB${String(v.id_nouveau_ne).padStart(4, '0')}`;
                  const badge = getStatutVaccinBadge(v.statut);
                  return (
                    <tr key={v.id_vaccin}>
                      <td>
                        <div className="baby-cell">
                          <div className="baby-ava">👶</div>
                          <div>
                            <div className="baby-name">{nomBebe}</div>
                            <div className="baby-id">NB{String(v.id_nouveau_ne).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{v.nom_vaccin ?? '—'}</td>
                      <td>{formatDate(v.date_administration)}</td>
                      <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      <td style={{ fontSize: 12 }}>{v.lot ?? '—'}</td>
                      <td style={{ fontSize: 12, maxWidth: 160 }}>{v.observations ?? '—'}</td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => onNavigate('dossier-detail', bebe?.id_nouveau_ne ?? null)}
                        >
                          ✏️ Détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ SOINS PLANIFIÉS ══ */}
      {activeTab === 'Planifies' && (
        <div className="card">
          <div className="card-head">
            <h3>🩹 Soins planifiés</h3>
            <button className="btn-primary btn-sm" onClick={() => onNavigate('planifier-soin')}>
              ＋ Planifier un soin
            </button>
          </div>

          {loadingSoins && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 28 }}>⏳</div>
              <p style={{ color: 'var(--gray)', marginTop: 8 }}>Chargement...</p>
            </div>
          )}

          {!loadingSoins && soins.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>
              🩹 Aucun soin planifié.{' '}
              <span
                style={{ color: 'var(--rose-2)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                onClick={() => onNavigate('planifier-soin')}
              >
                Planifier un soin
              </span>
            </div>
          )}

          {!loadingSoins && soins.length > 0 && (
            <table className="dtable">
              <thead>
                <tr>
                  <th>Nouveau-né</th>
                  <th>Type de soin</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Fréquence</th>
                  <th>Statut</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {soins.map((s) => {
                  const nn       = s.nouveau_ne ?? s.nouveauNe ?? null;
                  const patiente = nn?.accouchement?.grossesse?.patiente ?? null;
                  const nomBebe  = patiente
                    ? `Bébé de ${patiente.prenom ?? ''} ${patiente.nom ?? ''}`.trim()
                    : `NB${String(s.id_nouveau_ne).padStart(4, '0')}`;
                  const statutBadge = getStatutSoinBadge(s.statut);
                  return (
                    <tr key={s.id_soin}>
                      <td>
                        <div className="baby-cell">
                          <div className="baby-ava">👶</div>
                          <div>
                            <div className="baby-name">{nomBebe}</div>
                            <div className="baby-id">NB{String(s.id_nouveau_ne).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{s.type_soin ?? '—'}</td>
                      <td>{formatDate(s.date_soin)}</td>
                      <td>{s.heure_soin ?? '—'}</td>
                      <td>{s.frequence ?? '—'}</td>
                      <td><span className={`badge ${statutBadge.cls}`}>{statutBadge.label}</span></td>
                      <td style={{ fontSize: 12, maxWidth: 160, color: 'var(--gray)' }}>
                        {s.note ?? '—'}
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => onNavigate('dossier-detail', nn?.id_nouveau_ne ?? null)}
                        >
                          ✏️ Détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

Soins.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};