import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const TYPES_AVEC_TENSION     = ['Prise de tension', 'Surveillance générale'];
const TYPES_AVEC_TEMPERATURE = ['Prise de température', 'Surveillance générale'];
const TYPES_AVEC_POULS       = ['Surveillance générale'];

const statutBadge = (s) => {
  switch (s) {
    case 'planifie':  return { cls: 'planifie', label: '🕐 Planifié'  };
    case 'en_cours':  return { cls: 'en-cours', label: '⚙️ En cours'  };
    case 'termine':   return { cls: 'termine',  label: '✅ Terminé'   };
    case 'annule':    return { cls: 'annule',   label: '❌ Annulé'    };
    default:          return { cls: 'planifie', label: s ?? '—'       };
  }
};

export default function SoinsPostPartum() {
  const [soins,   setSoins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre,  setFiltre]  = useState('tous');
  const [modal,   setModal]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({
    statut: '', tension: '', temperature: '', pouls: '', note: '',
  });

  const fetchSoins = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await api.get('/soins');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      console.log('tous les soins:', data);
      console.log('soins postpartum:', data.filter(s => s.id_patiente));

      setSoins(data.filter(s => s.id_patiente));
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);


  

  useEffect(() => { fetchSoins(); }, [fetchSoins]);

  const openModal = (s) => {
    setModal(s);
    setForm({
      statut:      s.statut      ?? 'planifie',
      tension:     s.tension     ?? '',
      temperature: s.temperature ?? '',
      pouls:       s.pouls       ?? '',
      note:        s.note        ?? '',
    });
  };

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      await api.patch(`/soins/${modal.id_soin}/statut`, {
        statut:      form.statut,
        tension:     form.tension      || null,
        temperature: form.temperature  || null,
        pouls:       form.pouls        || null,
        note:        form.note         || null,
      });
      setSoins(prev => prev.map(s =>
        s.id_soin === modal.id_soin ? { ...s, ...form } : s
      ));
      setModal(null);
    } catch {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filtre === 'tous' ? soins : soins.filter(s => s.statut === filtre);

  const counts = {
    tous:     soins.length,
    planifie: soins.filter(s => s.statut === 'planifie').length,
    en_cours: soins.filter(s => s.statut === 'en_cours').length,
    termine:  soins.filter(s => s.statut === 'termine').length,
    annule:   soins.filter(s => s.statut === 'annule').length,
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1.5px solid var(--sand)', fontSize: 13,
    fontFamily: 'Nunito, sans-serif', outline: 'none', background: '#fff',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700, display: 'block',
    marginBottom: 5, color: 'var(--dark)',
  };

  const showTension     = modal && TYPES_AVEC_TENSION.includes(modal.type_soin);
  const showTemperature = modal && TYPES_AVEC_TEMPERATURE.includes(modal.type_soin);
  const showPouls       = modal && TYPES_AVEC_POULS.includes(modal.type_soin);

  return (
    <div className="inf-page-anim">
      <div className="inf-page-title">
        <h2>🤱 Soins post-partum</h2>
      </div>

      {/* Tabs */}
      <div className="inf-tabs">
        {[
          { key: 'tous',     label: 'Tous'        },
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
              background: filtre === key ? 'var(--rose)' : 'var(--sand)',
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
          <h3>🤱 Soins des patientes post-partum</h3>
        </div>

        {loading && (
          <div className="inf-center"><div className="ico">⏳</div><p>Chargement...</p></div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="inf-center">
            <div className="ico">🤱</div>
            <p>Aucun soin post-partum {filtre !== 'tous' ? `"${filtre}"` : ''} trouvé.</p>
            {filtre === 'tous' && (
              <p style={{ fontSize: 12, marginTop: 8, color: 'var(--gray)' }}>
                Les soins post-partum sont planifiés par la sage-femme.
              </p>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <table className="inf-table">
            <thead>
              <tr>
                <th>Patiente</th>
                <th>Type de soin</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Fréquence</th>
                <th>Constantes</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const patiente = s.patiente ?? null;
                const nom = patiente
                  ? `${patiente.prenom ?? ''} ${patiente.nom ?? ''}`.trim()
                  : `P${String(s.id_patiente).padStart(4, '0')}`;
                const badge = statutBadge(s.statut);

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
                    <td style={{ fontWeight: 600 }}>{s.type_soin ?? '—'}</td>
                    <td>{formatDate(s.date_soin)}</td>
                    <td>{s.heure_soin ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.frequence ?? '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--gray)' }}>
                      {s.tension     && <div>💉 {s.tension}</div>}
                      {s.temperature && <div>🌡️ {s.temperature}°C</div>}
                      {s.pouls       && <div>❤️ {s.pouls} bpm</div>}
                      {!s.tension && !s.temperature && !s.pouls && '—'}
                    </td>
                    <td><span className={`inf-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>
                      <button
                        className="inf-btn-primary"
                        style={{ fontSize: 11, padding: '4px 12px' }}
                        onClick={() => openModal(s)}
                        disabled={s.statut === 'termine' || s.statut === 'annule'}
                      >
                        ✏️ Exécuter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal exécution soin ── */}
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
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Entête modal */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                🩺 Exécuter — {modal.type_soin}
              </h3>
              <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
                {modal.patiente
                  ? `${modal.patiente.prenom} ${modal.patiente.nom}`
                  : `P${String(modal.id_patiente).padStart(4, '0')}`
                } · {formatDate(modal.date_soin)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Statut */}
              <div>
                <label style={labelStyle}>Statut *</label>
                <select style={inputStyle} value={form.statut}
                  onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                  <option value="planifie">🕐 Planifié</option>
                  <option value="en_cours">⚙️ En cours</option>
                  <option value="termine">✅ Terminé</option>
                  <option value="annule">❌ Annulé</option>
                </select>
              </div>

              {/* Constantes selon type de soin */}
              {(showTension || showTemperature || showPouls) && (
                <div style={{
                  background: 'var(--rose-light)', border: '1px solid var(--rose-border)',
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)' }}>
                    📊 Constantes mesurées
                  </div>

                  {showTension && (
                    <div>
                      <label style={labelStyle}>💉 Tension artérielle</label>
                      <input
                        style={inputStyle}
                        value={form.tension}
                        onChange={e => setForm(f => ({ ...f, tension: e.target.value }))}
                        placeholder="ex: 12/8"
                      />
                    </div>
                  )}

                  {showTemperature && (
                    <div>
                      <label style={labelStyle}>🌡️ Température (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        style={inputStyle}
                        value={form.temperature}
                        onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                        placeholder="ex: 37.2"
                      />
                    </div>
                  )}

                  {showPouls && (
                    <div>
                      <label style={labelStyle}>❤️ Pouls (bpm)</label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={form.pouls}
                        onChange={e => setForm(f => ({ ...f, pouls: e.target.value }))}
                        placeholder="ex: 72"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              <div>
                <label style={labelStyle}>📝 Note / Observations</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Observations, remarques..."
                />
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="inf-btn-secondary" onClick={() => setModal(null)}>
                Annuler
              </button>
              <button
                className="inf-btn-primary"
                onClick={handleSave}
                disabled={saving}
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