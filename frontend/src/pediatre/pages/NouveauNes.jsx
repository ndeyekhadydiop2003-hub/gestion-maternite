import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const getSexeLabel = (sexe) => ({
  masculin:    '👦 Garçon',
  feminin:     '👧 Fille',
  indetermine: '❓'
}[sexe] || '—');

const getApgarBadge = (score) => {
  if (score === null || score === undefined) return { cls: 'b-gray',       label: '—' };
  if (score >= 7)                           return { cls: 'b-normal',     label: `${score}/10 ✓` };
  if (score >= 4)                           return { cls: 'b-surveiller', label: `${score}/10 ⚠` };
  return                                           { cls: 'b-critique',   label: `${score}/10 ⛔` };
};

const getPoidsStatut = (poids) => {
  if (!poids || poids === 0) return { cls: 'b-gray',      label: '—',            color: 'var(--gray)' };
  if (poids >= 2.5)          return { cls: 'b-normal',     label: '✓ Normal',     color: '#00897B' };
  if (poids >= 1.5)          return { cls: 'b-surveiller', label: '⚠ Surveiller', color: '#F57F17' };
  return                            { cls: 'b-critique',   label: '⛔ Critique',   color: '#C62828' };
};

const getNomBebe = (b) => {
  const patiente = b.accouchement?.grossesse?.patiente ?? b.patiente;
  return patiente ? `Bébé de ${patiente.prenom} ${patiente.nom}` : `Nouveau-né #${b.id_nouveau_ne}`;
};

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : '—';

const getAgeJours = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date() - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getAgeLabel = (ageJours) => {
  if (ageJours === null) return '—';
  if (ageJours === 0)    return "Aujourd'hui";
  if (ageJours === 1)    return 'Hier';
  return `J+${ageJours}`;
};

export default function NouveauNes({ onNavigate }) {
  const [tous,          setTous]          = useState([]);
  const [babies,        setBabies]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filtrePeriode, setFiltrePeriode] = useState(30);

  const fetchBabies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await api.get('/nouveau-nes?per_page=200');
      const data = res.data?.data ?? res.data ?? [];
      setTous(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBabies(); }, [fetchBabies]);

  // Filtrage par période
  useEffect(() => {
    if (filtrePeriode === 0) {
      setBabies(tous);
    } else {
      setBabies(tous.filter(b => {
        const age = getAgeJours(b.created_at);
        return age !== null && age <= filtrePeriode;
      }));
    }
  }, [tous, filtrePeriode]);

  return (
    <div className="page-anim">
      <div className="page-title">
        <div>
          <h2>Nouveau-nés</h2>
          <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>
            Bébés enregistrés en salle de naissance
          </div>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('ajouter-bebe')}>
          ＋ Ajouter un bébé
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>🏥 Salle de naissance</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[
              { val: 7,  label: '7 jours' },
              { val: 30, label: '30 jours' },
              { val: 90, label: '3 mois' },
              { val: 0,  label: 'Tous' },
            ].map(({ val, label }) => (
              <button key={val}
                onClick={() => setFiltrePeriode(val)}
                style={{
                  padding: '4px 12px', fontSize: 11, borderRadius: 20,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  background: filtrePeriode === val ? 'var(--rose-2)' : 'var(--sand)',
                  color:      filtrePeriode === val ? '#fff'          : 'var(--dark)',
                }}>
                {label}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>
              {babies.length} bébé{babies.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Chargement ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 28 }}>⏳</div>
            <p style={{ color: 'var(--gray)', marginTop: 8 }}>Chargement...</p>
          </div>
        )}

        {/* ── Erreur ── */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 28 }}>❌</div>
            <p style={{ color: 'red', marginTop: 8 }}>{error}</p>
            <button className="btn-primary btn-sm" onClick={fetchBabies}>Réessayer</button>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && (
          <>
            {babies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👶</div>
                <div style={{ fontSize: 14 }}>
                  Aucun nouveau-né dans les{' '}
                  {filtrePeriode === 0 ? 'registres' : `${filtrePeriode} derniers jours`}.
                </div>
                {filtrePeriode !== 0 && (
                  <button className="btn-primary btn-sm" style={{ marginTop: 12 }}
                    onClick={() => setFiltrePeriode(0)}>
                    Voir tous les bébés
                  </button>
                )}
              </div>
            ) : (
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Bébé / ID</th>
                    <th>Âge</th>
                    <th>Date naissance</th>
                    <th>Poids / Taille</th>
                    <th>Sexe</th>
                    <th>Apgar 1min</th>
                    <th>Apgar 5min</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {babies.map((b) => {
                    const apgar1   = getApgarBadge(b.apgar_1min);
                    const apgar5   = getApgarBadge(b.apgar_5min);
                    const statut   = getPoidsStatut(b.poids_naissance);
                    const ageJours = getAgeJours(b.created_at);
                    const ageLabel = getAgeLabel(ageJours);

                    return (
                      <tr key={b.id_nouveau_ne}
                        onClick={() => onNavigate('dossier-detail', b.id_nouveau_ne)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div className="baby-cell">
                            <div className="baby-ava">👶</div>
                            <div>
                              <div className="baby-name">{getNomBebe(b)}</div>
                              <div className="baby-id">NB{String(b.id_nouveau_ne).padStart(4, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 700, fontSize: 12,
                            color: ageJours === 0    ? 'var(--rose-2)'  :
                                   ageJours <= 3     ? '#F57F17'        : 'var(--gray)',
                          }}>
                            {ageLabel}
                          </span>
                        </td>
                        <td>{formatDate(b.created_at)}</td>
                        <td>
                          <strong style={{ color: statut.color }}>
                            {b.poids_naissance ? `${b.poids_naissance} kg` : '—'}
                          </strong>
                          {' / '}
                          {b.taille ? `${b.taille} cm` : '—'}
                        </td>
                        <td>{getSexeLabel(b.sexe)}</td>
                        <td><span className={`badge ${apgar1.cls}`}>{apgar1.label}</span></td>
                        <td><span className={`badge ${apgar5.cls}`}>{apgar5.label}</span></td>
                        <td><span className={`badge ${statut.cls}`}>{statut.label}</span></td>
                        <td>
                          <button
                            className="btn-primary btn-sm"
                            onClick={e => { e.stopPropagation(); onNavigate('dossier-detail', b.id_nouveau_ne); }}
                          >
                            Voir dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── Footer ── */}
        {!loading && !error && (
          <div style={{
            padding: '12px 18px', textAlign: 'center',
            borderTop: '1px solid var(--sand)', fontSize: 12, color: 'var(--gray)',
          }}>
            Pour l&apos;historique complet de tous les bébés →{' '}
            <span
              style={{ color: 'var(--rose-2)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
              onClick={() => onNavigate('dossiers')}
            >
              Dossiers médicaux
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

NouveauNes.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};