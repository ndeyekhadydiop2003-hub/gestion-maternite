import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const statutBadge = (s) => {
  switch (s) {
    case 'fait':     return { cls: 'fait',     label: '✓ Fait'     };
    case 'prevu':    return { cls: 'prevu',    label: '📅 Prévu'   };
    case 'non_fait': return { cls: 'non-fait', label: '✗ Non fait' };
    default:         return { cls: 'prevu',    label: s ?? '—'     };
  }
};

export default function Vaccins() {
  const [vaccins,   setVaccins]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtre,    setFiltre]    = useState('tous');
  const [saving,    setSaving]    = useState(null);
  const [modal,     setModal]     = useState(null);
  const [formModal, setFormModal] = useState({
    statut:              '',
    date_administration: '',
    lot:                 '',
    site_injection:      '',
    observations:        '',
  });

  const fetchVaccins = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await api.get('/vaccins');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.data ?? []);
      const flat = list.flatMap(b => (b.vaccins ?? []).map(v => ({ ...v, bebe: b })));
      setVaccins(flat);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVaccins(); }, [fetchVaccins]);

  const openModal = (v) => {
    setModal(v);
    setFormModal({
      statut:              v.statut             ?? 'prevu',
      date_administration: v.date_administration?.slice(0, 10) ?? '',
      lot:                 v.lot                ?? '',
      site_injection:      v.site_injection     ?? '',
      observations:        v.observations       ?? '',
    });
  };

  const handleSave = async () => {
    if (!modal) return;
    setSaving(modal.id_vaccin);
    try {
      await api.put(`/vaccins/${modal.id_vaccin}`, formModal);
      setVaccins(prev => prev.map(v =>
        v.id_vaccin === modal.id_vaccin ? { ...v, ...formModal } : v
      ));
      setModal(null);
    } catch {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setSaving(null);
    }
  };

  const counts = {
    tous:     vaccins.length,
    prevu:    vaccins.filter(v => v.statut === 'prevu').length,
    fait:     vaccins.filter(v => v.statut === 'fait').length,
    non_fait: vaccins.filter(v => v.statut === 'non_fait').length,
  };

  const filtered = filtre === 'tous' ? vaccins : vaccins.filter(v => v.statut === filtre);

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1.5px solid var(--sand)', fontSize: 13,
    fontFamily: 'Nunito, sans-serif', outline: 'none',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 5,
  };

  return (
    <div className="inf-page-anim">
      <div className="inf-page-title">
        <h2>💉 Vaccins nouveau-nés</h2>
      </div>

      {/* Tabs */}
      <div className="inf-tabs">
        {[
          { key: 'tous',     label: 'Tous'        },
          { key: 'prevu',    label: '📅 Prévus'   },
          { key: 'fait',     label: '✓ Faits'     },
          { key: 'non_fait', label: '✗ Non faits' },
        ].map(({ key, label }) => (
          <div key={key}
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
          <h3>💉 Suivi vaccinal</h3>
        </div>

        {loading && (
          <div className="inf-center"><div className="ico">⏳</div><p>Chargement...</p></div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="inf-center">
            <div className="ico">💉</div>
            <p>Aucun vaccin {filtre !== 'tous' ? `"${filtre}"` : ''} trouvé.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <table className="inf-table">
            <thead>
              <tr>
                <th>Bébé</th>
                <th>Vaccin</th>
                <th>Date administration</th>
                <th>Lot</th>
                <th>Site injection</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const bebe     = v.bebe;
                const patiente = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
                const nom      = patiente
                  ? `Bébé de ${patiente.prenom} ${patiente.nom}`
                  : `NB${String(v.id_nouveau_ne).padStart(4, '0')}`;
                const badge = statutBadge(v.statut);

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
                    <td style={{ fontWeight: 700 }}>{v.nom_vaccin ?? '—'}</td>
                    <td>{formatDate(v.date_administration)}</td>
                    <td style={{ fontSize: 12 }}>{v.lot ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{v.site_injection ?? '—'}</td>
                    <td><span className={`inf-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>
                      <button
                        className="inf-btn-primary"
                        style={{ fontSize: 11, padding: '4px 12px' }}
                        onClick={() => openModal(v)}
                        disabled={v.statut === 'fait'}
                      >
                        {v.statut === 'fait' ? '✅ Administré' : '✏️ Mettre à jour'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal mise à jour vaccin ── */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>
              💉 Administrer — {modal.nom_vaccin}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Statut */}
              <div>
                <label style={labelStyle}>Statut *</label>
                <select style={inputStyle} value={formModal.statut}
                  onChange={e => setFormModal(f => ({ ...f, statut: e.target.value }))}>
                  <option value="prevu">📅 Prévu</option>
                  <option value="fait">✓ Fait</option>
                  <option value="non_fait">✗ Non fait</option>
                </select>
              </div>

              {/* Date administration — obligatoire si statut = fait */}
              <div>
                <label style={labelStyle}>
                  Date d&apos;administration
                  {formModal.statut === 'fait' && <span style={{ color: 'red' }}> *</span>}
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={formModal.date_administration}
                  onChange={e => setFormModal(f => ({ ...f, date_administration: e.target.value }))}
                />
              </div>

              {/* Lot */}
              <div>
                <label style={labelStyle}>Numéro de lot</label>
                <input style={inputStyle} value={formModal.lot}
                  onChange={e => setFormModal(f => ({ ...f, lot: e.target.value }))}
                  placeholder="ex: LOT2026-01" />
              </div>

              {/* Site injection */}
              <div>
                <label style={labelStyle}>Site d&apos;injection</label>
                <input style={inputStyle} value={formModal.site_injection}
                  onChange={e => setFormModal(f => ({ ...f, site_injection: e.target.value }))}
                  placeholder="ex: Cuisse gauche" />
              </div>

              {/* Observations */}
              <div>
                <label style={labelStyle}>Observations</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3}
                  value={formModal.observations}
                  onChange={e => setFormModal(f => ({ ...f, observations: e.target.value }))}
                  placeholder="Réaction, notes..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="inf-btn-secondary" onClick={() => setModal(null)}>
                Annuler
              </button>
              <button
                className="inf-btn-primary"
                onClick={handleSave}
                disabled={!!saving || (formModal.statut === 'fait' && !formModal.date_administration)}
              >
                {saving ? '⏳ Enregistrement...' : '✅ Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}