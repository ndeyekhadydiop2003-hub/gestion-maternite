import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const getNomBebe = (b) => {
  const patiente = b.accouchement?.grossesse?.patiente ?? b.patiente;
  if (patiente) return `Bébé de ${patiente.prenom} ${patiente.nom}`;
  return `Nouveau-né #${b.id_nouveau_ne}`;
};

const getPoidsStatut = (poids) => {
  if (!poids || poids === 0) return { cls: 'b-gray',      label: '—' };
  if (poids >= 2.5)          return { cls: 'b-normal',     label: '✓ Normal' };
  if (poids >= 1.5)          return { cls: 'b-surveiller', label: '⚠ Surveiller' };
  return                            { cls: 'b-critique',   label: '⛔ Critique' };
};

const getSexeLabel = (sexe) => ({
  masculin:    '👦 Garçon',
  feminin:     '👧 Fille',
  indetermine: '❓',
}[sexe] || '—');

export default function Dossiers({ onNavigate }) {
  const [bebes,       setBebes]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [perPage,     setPerPage]     = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [total,       setTotal]       = useState(0);
  const [filtre,      setFiltre]      = useState('tous');

  const fetchBebes = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const res  = await api.get(`/nouveau-nes?page=${page}&per_page=${limit}`);
      const data = res.data;
      setBebes(data.data ?? []);
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page       ?? 1);
      setTotal(data.total              ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBebes(1, 10); }, [fetchBebes]);

  const handlePerPage = (e) => {
    const val = Number(e.target.value);
    setPerPage(val);
    fetchBebes(1, val);
  };

  const handlePage = (page) => {
    if (page < 1 || page > lastPage) return;
    fetchBebes(page, perPage);
  };

  const bebesFiltres = bebes.filter(b => {
    const poids = parseFloat(b.poids_naissance) || 0;
    if (filtre === 'tous')       return true;
    if (filtre === 'normal')     return poids >= 2.5;
    if (filtre === 'surveiller') return poids >= 1.5 && poids < 2.5;
    if (filtre === 'critique')   return poids > 0 && poids < 1.5;
    return true;
  });

  const debut = (currentPage - 1) * perPage + 1;
  const fin   = Math.min(currentPage * perPage, total);

  return (
    <div className="page-anim">
      <div className="page-title">
        <h2>Dossiers médicaux</h2>
        <button className="btn-primary btn-sm" style={{ background: 'var(--teal)' }}
          onClick={() => onNavigate('ajouter-bebe')}>
          ＋ Nouveau bébé
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Liste des dossiers — {total} bébé{total > 1 ? 's' : ''}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>Afficher :</span>
            <select value={perPage} onChange={handlePerPage}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--sand)', fontSize: 13 }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <button
              style={{ border: '1.5px solid var(--sand)', background: 'var(--bg)', borderRadius: 7, width: 28, height: 28, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
              onClick={() => handlePage(currentPage - 1)}
              disabled={currentPage === 1}
            >‹</button>
            <button
              style={{ border: '1.5px solid var(--sand)', background: 'var(--bg)', borderRadius: 7, width: 28, height: 28, cursor: currentPage === lastPage ? 'not-allowed' : 'pointer', opacity: currentPage === lastPage ? 0.4 : 1 }}
              onClick={() => handlePage(currentPage + 1)}
              disabled={currentPage === lastPage}
            >›</button>
          </div>
        </div>

        {/* ── Filtres statut ── */}
        <div style={{ padding: '12px 18px', display: 'flex', gap: 8, borderBottom: '1px solid var(--sand)' }}>
          {[
            { key: 'tous',       label: 'Tous' },
            { key: 'normal',     label: '✓ Normal' },
            { key: 'surveiller', label: '⚠ Surveiller' },
            { key: 'critique',   label: '⛔ Critique' },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => setFiltre(key)}
              style={{
                padding: '5px 14px', fontSize: 12, borderRadius: 20,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                background: filtre === key ? 'var(--rose-2)' : 'var(--sand)',
                color:      filtre === key ? '#fff'          : 'var(--dark)',
              }}>
              {label}
            </button>
          ))}
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
            <button className="btn-primary btn-sm" onClick={() => fetchBebes(currentPage, perPage)}>
              Réessayer
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && (
          <table className="dtable">
            <thead>
              <tr>
                <th>Bébé / ID</th>
                <th>Date de naissance</th>
                <th>Sexe</th>
                <th>Poids naissance</th>
                <th>Mère</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bebesFiltres.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray)', padding: 24 }}>
                    Aucun dossier trouvé.
                  </td>
                </tr>
              ) : (
                bebesFiltres.map((b) => {
                  const patiente = b.accouchement?.grossesse?.patiente ?? b.patiente;
                  const statut   = getPoidsStatut(b.poids_naissance);
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
                      <td>{formatDate(b.created_at)}</td>
                      <td>{getSexeLabel(b.sexe)}</td>
                      <td><strong>{b.poids_naissance ? `${b.poids_naissance} kg` : '—'}</strong></td>
                      <td>{patiente ? `${patiente.prenom} ${patiente.nom}` : '—'}</td>
                      <td><span className={`badge ${statut.cls}`}>{statut.label}</span></td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={e => { e.stopPropagation(); onNavigate('dossier-detail', b.id_nouveau_ne); }}
                        >
                          Ouvrir dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* ── Footer pagination ── */}
        {!loading && !error && total > 0 && (
          <div style={{
            padding: '12px 18px', textAlign: 'center',
            borderTop: '1px solid var(--sand)',
            fontSize: 12, color: 'var(--gray)',
          }}>
            {debut} - {fin} de {total} bébé{total > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

Dossiers.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};