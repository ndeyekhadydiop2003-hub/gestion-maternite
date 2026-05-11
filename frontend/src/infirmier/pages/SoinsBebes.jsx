import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const STATUTS = ['tous', 'planifie', 'en_cours', 'termine', 'annule'];

const statutBadge = (s) => {
  switch (s) {
    case 'planifie':  return { cls: 'planifie', label: '🕐 Planifié'  };
    case 'en_cours':  return { cls: 'en-cours', label: '⚙️ En cours'  };
    case 'termine':   return { cls: 'termine',  label: '✅ Terminé'   };
    case 'annule':    return { cls: 'annule',   label: '❌ Annulé'    };
    default:          return { cls: 'planifie', label: s ?? '—'       };
  }
};

export default function SoinsBebes() {
  const [soins,   setSoins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre,  setFiltre]  = useState('tous');
  const [saving,  setSaving]  = useState(null);

  const fetchSoins = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await api.get('/soins');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      // Garder seulement les soins bébés (id_nouveau_ne présent, id_patiente absent)
      setSoins(data.filter(s => s.id_nouveau_ne && !s.id_patiente));
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSoins(); }, [fetchSoins]);

  const handleStatutChange = async (idSoin, newStatut) => {
    setSaving(idSoin);
    try {
      await api.patch(`/soins/${idSoin}/statut`, { statut: newStatut });
      setSoins(prev => prev.map(s =>
        s.id_soin === idSoin ? { ...s, statut: newStatut } : s
      ));
    } catch {
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setSaving(null);
    }
  };

  const filtered = filtre === 'tous' ? soins : soins.filter(s => s.statut === filtre);

  const counts = STATUTS.reduce((acc, st) => {
    acc[st] = st === 'tous' ? soins.length : soins.filter(s => s.statut === st).length;
    return acc;
  }, {});

  return (
    <div className="inf-page-anim">
      <div className="inf-page-title">
        <h2>👶 Soins des bébés</h2>
      </div>

      {/* Tabs filtre */}
      <div className="inf-tabs">
        {[
          { key: 'tous',     label: 'Tous'       },
          { key: 'planifie', label: '🕐 Planifiés' },
          { key: 'en_cours', label: '⚙️ En cours'  },
          { key: 'termine',  label: '✅ Terminés'  },
          { key: 'annule',   label: '❌ Annulés'   },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`inf-tab${filtre === key ? ' active' : ''}`}
            onClick={() => setFiltre(key)}
          >
            {label}
            <span style={{
              marginLeft: 4, fontSize: 10, fontWeight: 700,
              background: filtre === key ? 'var(--teal)' : 'var(--sand)',
              color: filtre === key ? '#fff' : 'var(--gray)',
              padding: '1px 6px', borderRadius: 10,
            }}>
              {counts[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="inf-card">
        <div className="inf-card-head">
          <h3>🩺 Liste des soins planifiés</h3>
        </div>

        {loading && (
          <div className="inf-center"><div className="ico">⏳</div><p>Chargement...</p></div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="inf-center">
            <div className="ico">🩹</div>
            <p>Aucun soin {filtre !== 'tous' ? `"${filtre}"` : ''} trouvé.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <table className="inf-table">
            <thead>
              <tr>
                <th>Bébé</th>
                <th>Type de soin</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Fréquence</th>
                <th>Note</th>
                <th>Statut actuel</th>
                <th>Changer statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const nn = s.nouveau_ne ?? s.nouveauNe ?? null;
                const patiente = nn?.accouchement?.grossesse?.patiente ?? nn?.patiente ?? null;
                const nom = patiente
                  ? `Bébé de ${patiente.prenom ?? ''} ${patiente.nom ?? ''}`.trim()
                  : `NB${String(s.id_nouveau_ne).padStart(4, '0')}`;
                const badge = statutBadge(s.statut);
                const isSaving = saving === s.id_soin;

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
                    <td style={{ fontWeight: 600 }}>{s.type_soin ?? '—'}</td>
                    <td>{formatDate(s.date_soin)}</td>
                    <td>{s.heure_soin ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.frequence ?? '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray)', maxWidth: 140 }}>{s.note ?? '—'}</td>
                    <td><span className={`inf-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>
                      {isSaving ? (
                        <span style={{ fontSize: 12, color: 'var(--gray)' }}>⏳</span>
                      ) : (
                        <select
                          className="inf-select-statut"
                          value={s.statut}
                          onChange={e => handleStatutChange(s.id_soin, e.target.value)}
                          disabled={s.statut === 'termine' || s.statut === 'annule'}
                        >
                          <option value="planifie">🕐 Planifié</option>
                          <option value="en_cours">⚙️ En cours</option>
                          <option value="termine">✅ Terminé</option>
                          <option value="annule">❌ Annulé</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

SoinsBebes.propTypes = {};
