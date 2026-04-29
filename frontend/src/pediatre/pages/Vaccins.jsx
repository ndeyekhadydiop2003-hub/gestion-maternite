import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

//const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const VACCINS_LISTE = ['BCG', 'Hepatite_B', 'Polio', 'Pentavalent', 'Rotavirus'];

const getStatutBadge = (vaccins, nomVaccin) => {
  const v = vaccins?.find(v => v.nom_vaccin === nomVaccin);
  if (!v)                   return { cls: 'b-gray',     label: '—' };
  if (v.statut === 'fait')  return { cls: 'b-normal',   label: '✓ Fait' };
  if (v.statut === 'prevu') return { cls: 'b-amber',    label: '📅 Prévu' };
  return                           { cls: 'b-critique', label: '✗ Non fait' };
};

const getAJour = (vaccins) => {
  if (!vaccins?.length)                             return { cls: 'b-critique',   label: '⛔ Non' };
  const faits = vaccins.filter(v => v.statut === 'fait').length;
  if (faits === VACCINS_LISTE.length)               return { cls: 'b-normal',     label: '✓ Oui' };
  if (faits > 0)                                    return { cls: 'b-surveiller', label: '⚠ Partiel' };
  return                                                   { cls: 'b-critique',   label: '⛔ Non' };
};

export default function Vaccins({ onNavigate }) {
  const [babies,      setBabies]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [total,       setTotal]       = useState(0);

  const fetchPage = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res  = await api.get(`/vaccins?page=${page}&per_page=15`);
      const data = res.data;
      console.log('Vaccins API:', data);
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setBabies(list);
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page       ?? 1);
      setTotal(data.total              ?? list.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(1); }, []);

  return (
    <div className="page-anim">
      <div className="page-title">
        <h2>Carnet vaccinal</h2>
        <button className="btn-primary" onClick={() => onNavigate('ajouter-vaccin')}>
          ＋ Enregistrer vaccin
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Suivi vaccinal — tous les bébés</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>
              {total} bébé{total > 1 ? 's' : ''}
            </span>
            <button
              style={{ border: '1.5px solid var(--sand)', background: 'var(--bg)', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
              onClick={() => { if (currentPage > 1) fetchPage(currentPage - 1); }}
              disabled={currentPage === 1}
            >‹</button>
            <span style={{ fontSize: 12 }}>{currentPage} / {lastPage}</span>
            <button
              style={{ border: '1.5px solid var(--sand)', background: 'var(--bg)', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', opacity: currentPage === lastPage ? 0.4 : 1 }}
              onClick={() => { if (currentPage < lastPage) fetchPage(currentPage + 1); }}
              disabled={currentPage === lastPage}
            >›</button>
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
            <button className="btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => fetchPage(1)}>
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
                <th>BCG</th>
                <th>Hépatite B</th>
                <th>Polio</th>
                <th>Pentavalent</th>
                <th>Rotavirus</th>
                <th>À jour</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {babies.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray)', padding: 24 }}>
                    Aucun bébé enregistré.
                  </td>
                </tr>
              ) : (
                babies.map((b) => {
                  const patiente = b.accouchement?.grossesse?.patiente;
                  const nomBebe  = patiente
                    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
                    : `Nouveau-né #${b.id_nouveau_ne}`;
                  const aJour = getAJour(b.vaccins);

                  return (
                    <tr key={b.id_nouveau_ne}>
                      <td>
                        <div className="baby-cell">
                          <div className="baby-ava">👶</div>
                          <div>
                            <div className="baby-name">{nomBebe}</div>
                            <div className="baby-id">NB{String(b.id_nouveau_ne).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      {VACCINS_LISTE.map(nom => {
                        const badge = getStatutBadge(b.vaccins, nom);
                        return (
                          <td key={nom}>
                            <span className={`badge ${badge.cls}`}>{badge.label}</span>
                          </td>
                        );
                      })}
                      <td>
                        <span className={`badge ${aJour.cls}`}>{aJour.label}</span>
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => onNavigate('ajouter-vaccin', b.id_nouveau_ne)}
                        >
                          + Vaccin
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

Vaccins.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};