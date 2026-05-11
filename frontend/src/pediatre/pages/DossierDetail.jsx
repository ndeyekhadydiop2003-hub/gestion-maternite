import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const TABS = ['profil', 'croissance', 'historique', 'vaccins'];
const TAB_LABELS = {
  profil:     'Profil',
  croissance: 'Croissance',
  historique: 'Historique médical',
  vaccins:    'Vaccins',
};

const getSexeLabel = (sexe) => ({
  masculin:    '👦 Garçon',
  feminin:     '👧 Fille',
  indetermine: '❓',
}[sexe] || '—');

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const getApgarBadge = (score) => {
  if (score == null) return { cls: 'b-gray',      label: '—' };
  if (score >= 7)    return { cls: 'b-normal',     label: `${score}/10` };
  if (score >= 4)    return { cls: 'b-surveiller', label: `${score}/10 ⚠` };
  return                    { cls: 'b-critique',   label: `${score}/10 ⛔` };
};

const calcPoints = (pts, getVal, minVal, maxVal) => {
  const padL = 60, minY = 10, maxY = 130;
  const totalW = 520;
  const step = (totalW - padL - 20) / Math.max(pts.length - 1, 1);
  return pts.map((c, i) => {
    const val   = parseFloat(getVal(c)) || 0;
    const ratio = Math.min(Math.max((val - minVal) / (maxVal - minVal), 0), 1);
    const x     = padL + i * step;
    const y     = maxY - ratio * (maxY - minY);
    return { x, y, val, date: c.date, isNaissance: c.isNaissance };
  });
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid var(--sand)', fontSize: 13,
  fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff',
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, display: 'block',
  marginBottom: 5, color: 'var(--gray)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

// ── Modal Modifier Consultation ──────────────────────────────
function ModalModifierConsultation({ consultation, onClose, onSaved }) {
  const [form, setForm] = useState({
    date_consultation:  consultation.date_consultation?.slice(0,10) || '',
    motif_consultation:consultation.motif_consultation || '',
    poids:              consultation.poids || '',
    temperature:        consultation.temperature || '',
    tension:            consultation.tension || '',
    observation:        consultation.observation || '',
    taille:             consultation.taille || '',
    perimetre_cranien:  consultation.perimetre_cranien || '',
    allaitement:        consultation.allaitement || '',
    vaccin_a_jour:      consultation.vaccin_a_jour || false,
    vaccins_notes:      consultation.vaccins_notes || '',
    developpement:      consultation.developpement || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
      console.log('id_consultation:', consultation.id_consultation); // ← ajouter
      console.log('consultation:', consultation);
    try {
      setSaving(true); setError(null);
        await api.patch(`/consultation-pediatrie/${consultation.id_cp}`, {
          date_consultation:  form.date_consultation,
          motif_consultation: form.motif_consultation || null,
          poids:              form.poids       ? Number(form.poids)       : null,
          temperature:        form.temperature ? Number(form.temperature) : null,
          tension:            form.tension     || null,
          observation:        form.observation || null,
          taille:             form.taille      ? Number(form.taille)      : null,
          perimetre_cranien:  form.perimetre_cranien ? Number(form.perimetre_cranien) : null,
          allaitement:        form.allaitement || null,
          developpement:      form.developpement || null,
        });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--sand)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            
            <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
              {formatDate(consultation.date_consultation)}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid var(--sand)', background: '#f9f9fc',
            cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Date */}
          <div>
            <label style={labelStyle}>Date de consultation</label>
            <input type="date" name="date_consultation" value={form.date_consultation}
              onChange={handleChange} style={inputStyle} />
          </div>
          {/* Motif */}
          <div>
            <label style={labelStyle}>Motif</label>
            <input name="motif_consultation" value={form.motif_consultation || ''}
              onChange={handleChange} placeholder="Motif de consultation" style={inputStyle} />
          </div>

          {/* Mesures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Poids (kg)</label>
              <input type="number" name="poids" value={form.poids}
                onChange={handleChange} step="0.1" placeholder="ex: 3.5" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Température (°C)</label>
              <input type="number" name="temperature" value={form.temperature}
                onChange={handleChange} step="0.1" placeholder="ex: 37.2" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tension</label>
              <input name="tension" value={form.tension}
                onChange={handleChange} placeholder="ex: 120/80" style={inputStyle} />
            </div>
          </div>

          {/* Données pédiatriques */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Taille (cm)</label>
              <input type="number" name="taille" value={form.taille}
                onChange={handleChange} step="0.1" placeholder="ex: 52" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Périmètre crânien (cm)</label>
              <input type="number" name="perimetre_cranien" value={form.perimetre_cranien}
                onChange={handleChange} step="0.1" placeholder="ex: 34" style={inputStyle} />
            </div>
          </div>

          {/* Allaitement */}
          <div>
            <label style={labelStyle}>Allaitement</label>
            <select name="allaitement" value={form.allaitement} onChange={handleChange} style={inputStyle}>
              <option value="">— Sélectionner —</option>
              <option value="maternel">🤱 Maternel</option>
              <option value="artificiel">🍼 Artificiel</option>
              <option value="mixte">🔀 Mixte</option>
              <option value="sevrage">⛔ Sevrage</option>
            </select>
          </div>

          {/* Développement */}
          <div>
            <label style={labelStyle}>Développement</label>
            <input name="developpement" value={form.developpement}
              onChange={handleChange} placeholder="ex: Motricité normale" style={inputStyle} />
          </div>

          {/* Vaccins */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" name="vaccin_a_jour" id="vaj_edit"
              checked={form.vaccin_a_jour} onChange={handleChange}
              style={{ width: 16, height: 16, accentColor: 'var(--rose)' }} />
            <label htmlFor="vaj_edit" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              💉 Vaccins à jour
            </label>
          </div>

          {/* Observation */}
          <div>
            <label style={labelStyle}>Observation clinique</label>
            <textarea name="observation" value={form.observation} onChange={handleChange}
              rows={3} style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Notes cliniques..." />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--sand)' }}>
            <button onClick={onClose} style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid var(--sand)', background: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: saving ? '#ccc' : 'var(--rose)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? '⏳ Enregistrement...' : '✓ Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Modifier Vaccin ─────────────────────────────────────
function ModalModifierVaccin({ vaccin, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom_vaccin:          vaccin.nom_vaccin || '',
    statut:              vaccin.statut || 'prevu',
    date_administration: vaccin.date_administration?.slice(0,10) || '',
    lot:                 vaccin.lot || '',
    site_injection:      vaccin.site_injection || '',
    observations:        vaccin.observations || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true); setError(null);
      await api.put(`/vaccins/${vaccin.id_vaccin}`, {
        nom_vaccin:          form.nom_vaccin,
        statut:              form.statut,
        date_administration: form.date_administration || null,
        lot:                 form.lot || null,
        site_injection:      form.site_injection || null,
        observations:        form.observations || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--sand)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--dark)' }}>
              💉 Modifier le vaccin
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
              {vaccin.nom_vaccin?.replace(/_/g, ' ')}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid var(--sand)', background: '#f9f9fc',
            cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Nom vaccin */}
          <div>
            <label style={labelStyle}>Nom du vaccin</label>
            <select name="nom_vaccin" value={form.nom_vaccin} onChange={handleChange} style={inputStyle}>
              <option value="BCG">BCG</option>
              <option value="Hepatite_B">Hépatite B</option>
              <option value="Polio">Poliomyélite</option>
              <option value="Pentavalent">Pentavalent</option>
              <option value="Rotavirus">Rotavirus</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label style={labelStyle}>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange} style={inputStyle}>
              <option value="prevu">📅 Prévu</option>
              <option value="fait">✓ Fait</option>
              <option value="non_fait">✗ Non fait</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date d'administration</label>
            <input type="date" name="date_administration" value={form.date_administration}
              onChange={handleChange} style={inputStyle} />
          </div>

          {/* Lot + Site */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Numéro de lot</label>
              <input name="lot" value={form.lot} onChange={handleChange}
                placeholder="ex: LOT-2026-01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Site d'injection</label>
              <input name="site_injection" value={form.site_injection} onChange={handleChange}
                placeholder="ex: Cuisse droite" style={inputStyle} />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label style={labelStyle}>Observations</label>
            <textarea name="observations" value={form.observations} onChange={handleChange}
              rows={3} style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Réactions, notes..." />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--sand)' }}>
            <button onClick={onClose} style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid var(--sand)', background: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: saving ? '#ccc' : 'var(--rose)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? '⏳ Enregistrement...' : '✓ Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourbePoids({ data = [] }) {
  const pts = data.filter(c => c.poids);
  if (pts.length === 0) return (
    <div style={{ textAlign:'center', color:'var(--gray)', padding:20, fontSize:13 }}>
      Aucune donnée de poids disponible
    </div>
  );
  const coords     = calcPoints(pts, c => c.poids, 1, 5);
  const polyPoints = coords.map(p => `${p.x},${p.y}`).join(' ');
  const airePoints = `M${coords[0].x},${coords[0].y} ${coords.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${coords[coords.length-1].x},130 L${coords[0].x},130 Z`;
  return (
    <svg viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%' }}>
      <defs>
        <linearGradient id="gfill_poids" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4607a" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#d4607a" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect x="40" y="10" width="545" height="130" fill="#f5f0f8" rx="6"/>
      <rect x="40" y="45" width="545" height="65" fill="#d4f0e7" opacity="0.35"/>
      <text x="588" y="60" fontSize="8" fill="#00897B">Norme</text>
      <text x="588" y="70" fontSize="8" fill="#00897B">OMS</text>
      {[130,100,70,40,10].map(y => (
        <line key={y} x1="40" y1={y} x2="585" y2={y} stroke="#e0dded" strokeWidth="1" strokeDasharray="4"/>
      ))}
      <polyline points={polyPoints} fill="none" stroke="#d4607a" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d={airePoints} fill="url(#gfill_poids)"/>
      {coords.map((p, i) => {
        const color = p.val >= 2.5 ? '#00897B' : p.val >= 1.5 ? '#F57F17' : '#C62828';
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={p.isNaissance ? 7 : 5} fill={color} stroke="#fff" strokeWidth="2"/>
            {p.isNaissance && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill={color} fontWeight="700">Naissance</text>
            )}
          </g>
        );
      })}
      {[['1kg',130],['2kg',100],['3kg',70],['4kg',40],['5kg',10]].map(([t,y]) => (
        <text key={t} x="37" y={y+3} textAnchor="end" fontSize="9" fill="#7c7c9a">{t}</text>
      ))}
      {coords.map((p, i) => (
        <text key={i} x={p.x} y="155" textAnchor="middle" fontSize="8" fill="#7c7c9a">
          {formatDate(p.date).slice(0,5)}
        </text>
      ))}
    </svg>
  );
}
CourbePoids.propTypes = { data: PropTypes.array };

function CourbeTaille({ data = [] }) {
  const pts = data.filter(c => c.taille);
  if (pts.length === 0) return (
    <div style={{ textAlign:'center', color:'var(--gray)', padding:20, fontSize:13 }}>
      Aucune donnée de taille disponible
    </div>
  );
  const coords     = calcPoints(pts, c => c.taille, 30, 70);
  const polyPoints = coords.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%' }}>
      <rect x="40" y="10" width="545" height="130" fill="#f5f0f8" rx="6"/>
      <rect x="40" y="50" width="545" height="55" fill="#d4f0e7" opacity="0.35"/>
      {[130,100,70,40,10].map(y => (
        <line key={y} x1="40" y1={y} x2="585" y2={y} stroke="#e0dded" strokeWidth="1" strokeDasharray="4"/>
      ))}
      <polyline points={polyPoints} fill="none" stroke="#7B1FA2" strokeWidth="2.5" strokeLinejoin="round"/>
      {coords.map((p, i) => {
        const color = p.val >= 46 ? '#00897B' : p.val >= 40 ? '#F57F17' : '#C62828';
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={p.isNaissance ? 7 : 5} fill={color} stroke="#fff" strokeWidth="2"/>
          </g>
        );
      })}
      {[['30cm',130],['40cm',100],['50cm',70],['60cm',40],['70cm',10]].map(([t,y]) => (
        <text key={t} x="37" y={y+3} textAnchor="end" fontSize="9" fill="#7c7c9a">{t}</text>
      ))}
      {coords.map((p, i) => (
        <text key={i} x={p.x} y="155" textAnchor="middle" fontSize="8" fill="#7c7c9a">
          {formatDate(p.date).slice(0,5)}
        </text>
      ))}
    </svg>
  );
}
CourbeTaille.propTypes = { data: PropTypes.array };

export default function DossierDetail({ id, onNavigate }) {
  const [activeTab,     setActiveTab]     = useState('profil');
  const [bebe,          setBebe]          = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [courbe,        setCourbe]        = useState([]);
  const [vaccins,       setVaccins]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [activeGraph,   setActiveGraph]   = useState('poids');

  // Modals
  const [editConsultation, setEditConsultation] = useState(null);
  const [editVaccin,       setEditVaccin]       = useState(null);
  const [toast,            setToast]            = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true); setError(null);
      const bebeRes  = await api.get(`/nouveau-nes/${id}`);
      const bebeData = bebeRes.data;
      setBebe(bebeData);

      const patienteId =
        bebeData?.accouchement?.grossesse?.patiente?.id_patient
        ?? bebeData?.patiente?.id_patient
        ?? bebeData?.id_patient;

      try {
        const pedRes  = await api.get(`/nouveau-nes/${id}/consultations-pediatrie`);
        const pedData = Array.isArray(pedRes.data) ? pedRes.data : [];
        const histoCons = pedData.map(p => ({
        id_cp:              p.id_cp,
        id_consultation:    p.id_consultation,
        date_consultation:  p.date_consultation,
        motif_consultation: p.motif_consultation,
        observation:        p.observation,
        poids:              p.poids,
        temperature:        p.temperature,
        tension:            p.tension,
        taille:             p.taille,
        perimetre_cranien:  p.perimetre_cranien,
        allaitement:        p.allaitement,
        vaccin_a_jour:      p.vaccin_a_jour,
        vaccins_notes:      p.vaccins_notes,
        developpement:      p.developpement,
        date:               p.date_consultation,
      }))
          .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));
        setConsultations(histoCons);
        setCourbe(histoCons.slice().reverse());
      } catch {
        if (patienteId) {
          try {
            const consRes = await api.get(`/consultations?id_patient=${patienteId}&per_page=50`);
            const allCons = consRes.data?.data ?? consRes.data ?? [];
            const filtered = Array.isArray(allCons)
              ? allCons.map(c => ({
                  id_consultation:    c.id_consultation,
                  date_consultation:  c.date_consultation,
                  motif_consultation: c.motif_consultation,
                  observation:        c.observation,
                  poids:              c.poids,
                  temperature:        c.temperature,
                  tension:            c.tension,
                  personnel:          c.personnel,
                  taille:             null,
                  perimetre_cranien:  null,
                  allaitement:        null,
                  vaccin_a_jour:      false,
                  developpement:      null,
                  date:               c.date_consultation,
                }))
              : [];
            setConsultations(filtered);
            setCourbe(filtered.slice().reverse());
          } catch { setConsultations([]); setCourbe([]); }
        }
      }

      try {
        const vaccRes = await api.get(`/nouveau-nes/${id}/vaccins`);
        setVaccins(Array.isArray(vaccRes.data) ? vaccRes.data : []);
      } catch { setVaccins([]); }

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement du dossier.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  if (!id) return (
    <div className="page-anim" style={{ textAlign:'center', padding:60 }}>
      <p style={{ color:'var(--gray)' }}>Aucun bébé sélectionné.</p>
      <button className="btn-primary btn-sm" onClick={() => onNavigate('nouveau-nes')}>← Retour</button>
    </div>
  );

  if (loading) return (
    <div className="page-anim" style={{ textAlign:'center', padding:60 }}>
      <div style={{ fontSize:32 }}>⏳</div>
      <p style={{ color:'var(--gray)', marginTop:12 }}>Chargement du dossier...</p>
    </div>
  );

  if (error) return (
    <div className="page-anim" style={{ textAlign:'center', padding:60 }}>
      <div style={{ fontSize:32 }}>❌</div>
      <p style={{ color:'red', marginTop:12 }}>{error}</p>
      <button className="btn-primary btn-sm" onClick={() => onNavigate('nouveau-nes')}>← Retour</button>
    </div>
  );

  const patiente     = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
  const accouchement = bebe?.accouchement;
  const nomBebe      = patiente
    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
    : `Nouveau-né #${bebe?.id_nouveau_ne}`;
  const apgar1 = getApgarBadge(bebe?.apgar_1min);
  const apgar5 = getApgarBadge(bebe?.apgar_5min);

  const pointNaissance = bebe?.poids_naissance ? [{
    date: bebe.created_at, poids: parseFloat(bebe.poids_naissance),
    taille: bebe.taille ? parseFloat(bebe.taille) : null,
    perimetre_cranien: null, allaitement: null, vaccin_a_jour: false, isNaissance: true,
  }] : [];

  const courbeComplete = [...pointNaissance, ...courbe];

  return (
    <div className="page-anim">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 2000,
          background: '#16a34a', color: '#fff', borderRadius: 10,
          padding: '12px 20px', fontSize: 13, fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Modals */}
      {editConsultation && (
        <ModalModifierConsultation
          consultation={editConsultation}
          onClose={() => setEditConsultation(null)}
          onSaved={() => { showToast('Consultation modifiée avec succès !'); loadData(); }}
        />
      )}
      {editVaccin && (
        <ModalModifierVaccin
          vaccin={editVaccin}
          onClose={() => setEditVaccin(null)}
          onSaved={() => { showToast('Vaccin modifié avec succès !'); loadData(); }}
        />
      )}

      {/* En-tête */}
      <div className="page-title">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="btn-primary btn-sm"
            style={{ background:'var(--bg)', color:'var(--dark)', border:'1.5px solid var(--sand)' }}
            onClick={() => onNavigate('nouveau-nes')}>← Retour</button>
          <h2>Dossier Médical</h2>
        </div>
        <button className="btn-primary btn-sm">📄 Télécharger PDF</button>
      </div>

      {/* Header bébé */}
      <div className="dossier-header">
        <div className="dh-ava">👶</div>
        <div>
          <div className="dh-name">{nomBebe}</div>
          <div className="dh-sub">
            NB{String(bebe?.id_nouveau_ne).padStart(4,'0')} | né(e) le {formatDate(bebe?.created_at)}
          </div>
          {patiente && (
            <div style={{ marginTop:6 }}>
              <span className="badge b-rose">Mère : {patiente.prenom} {patiente.nom}</span>
            </div>
          )}
          {bebe?.id_patient && !bebe?.accouchement && (
            <div style={{ marginTop:4 }}>
              <span className="badge b-amber">🚑 Admission sur transfert</span>
            </div>
          )}
        </div>
        <div className="dh-actions">
          <button className="btn-primary btn-sm" style={{ background:'var(--teal)' }}
            onClick={() => onNavigate('ajouter-consultation', bebe?.id_nouveau_ne)}>
            + Ajouter consultation
          </button>
          <button className="btn-primary btn-sm" style={{ background:'var(--amber)' }}
            onClick={() => onNavigate('ajouter-traitement', bebe?.id_nouveau_ne)}>
            + Ajouter traitement
          </button>
          <button className="btn-primary btn-sm" style={{ background:'var(--purple)' }}
            onClick={() => onNavigate('planifier-soin', bebe?.id_nouveau_ne)}>
            🩺 Planifier soin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <div key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {TAB_LABELS[t]}
          </div>
        ))}
      </div>

      {/* ══ PROFIL ══ */}
      {activeTab === 'profil' && (
        <div className="grid-2">
          <div className="card card-pad">
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:'var(--rose-2)' }}>
              Informations générales
            </div>
            {[
              ['Date de naissance', formatDate(bebe?.created_at)],
              ['Poids naissance',   bebe?.poids_naissance ? `${bebe.poids_naissance} kg` : '—'],
              ['Taille naissance',  bebe?.taille          ? `${bebe.taille} cm`          : '—'],
              ['Sexe',              getSexeLabel(bebe?.sexe)],
            ].map(([l, v]) => (
              <div key={l} className="info-row">
                <span className="lbl">{l}</span><span className="val">{v}</span>
              </div>
            ))}
            <div className="info-row">
              <span className="lbl">Apgar 1min</span>
              <span className="val"><span className={`badge ${apgar1.cls}`}>{apgar1.label}</span></span>
            </div>
            <div className="info-row">
              <span className="lbl">Apgar 5min</span>
              <span className="val"><span className={`badge ${apgar5.cls}`}>{apgar5.label}</span></span>
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:'var(--rose-2)' }}>
              {accouchement ? 'Mère & accouchement' : 'Informations de la mère'}
            </div>
            {accouchement ? (
              [
                ['Mère',              patiente ? `${patiente.prenom} ${patiente.nom}` : '—'],
                ['Type accouchement', accouchement?.type_accouchement?.replace('_',' ') ?? '—'],
                ['Date accouchement', formatDate(accouchement?.date_accouchement)],
                ['Complications',     accouchement?.complication ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="info-row">
                  <span className="lbl">{l}</span><span className="val">{v}</span>
                </div>
              ))
            ) : (
              [
                ['Mère',          patiente ? `${patiente.prenom} ${patiente.nom}` : '—'],
                ['Téléphone',     patiente?.telephone    ?? '—'],
                ['Groupe sanguin',patiente?.groupe_sanguin ?? '—'],
                ['Provenance',    patiente?.motif_consultation       ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="info-row">
                  <span className="lbl">{l}</span><span className="val">{v}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══ CROISSANCE ══ */}
      {activeTab === 'croissance' && (
        <div className="card card-pad">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>
              📈 Courbe de croissance — {nomBebe}
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {[['poids','⚖️ Poids'],['taille','📏 Taille']].map(([key, label]) => (
                <button key={key} onClick={() => setActiveGraph(key)}
                  style={{
                    padding:'4px 12px', fontSize:11, borderRadius:20,
                    border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                    background: activeGraph===key ? 'var(--rose-2)' : 'var(--sand)',
                    color:      activeGraph===key ? '#fff'          : 'var(--dark)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="growth-svg-wrap" style={{ marginBottom:12 }}>
            {activeGraph === 'poids'
              ? <CourbePoids  data={courbeComplete} />
              : <CourbeTaille data={courbeComplete} />
            }
          </div>
          <div className="gc-legend">
            {[['#00897B','Normal (OMS)'],['#F57F17','À surveiller'],['#C62828','Critique'],['#d4f0e7','Zone normale']].map(([bg,lbl]) => (
              <span key={lbl}><span className="gc-dot" style={{ background:bg }}></span> {lbl}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ HISTORIQUE ══ */}
      {activeTab === 'historique' && (
        <div className="card">
          <div className="card-head">
            <h3>Historique médical</h3>
            <span className="badge b-rose">
              {consultations.length} entrée{consultations.length > 1 ? 's' : ''}
            </span>
          </div>
          <table className="dtable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Motif</th>
                <th>Observation</th>
                <th>Poids</th>
                <th>Taille</th>
                <th>Allaitement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign:'center', color:'var(--gray)', padding:24 }}>
                    Aucune consultation enregistrée pour ce bébé.
                  </td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id_consultation}>
                    <td>{formatDate(c.date_consultation)}</td>
                    <td style={{ fontSize:12 }}>{c.motif_consultation?? '—'}</td>
                    <td style={{ fontSize:12, maxWidth:180 }}>{c.observation ?? '—'}</td>
                    
                    <td>{c.poids  ? `${c.poids} kg`  : '—'}</td>
                    <td>{c.taille ? `${c.taille} cm` : '—'}</td>
                    <td>{c.allaitement ?? '—'}</td>
                    <td>
                      <button
                        onClick={() => setEditConsultation(c)}
                        style={{
                          padding: '5px 12px', borderRadius: 8,
                          border: '1px solid var(--rose-border)',
                          background: 'var(--rose-light)',
                          color: 'var(--rose-2)', fontSize: 11,
                          fontWeight: 700, cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}>
                        ✏️ Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ══ VACCINS ══ */}
      {activeTab === 'vaccins' && (
        <div className="card card-pad">
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>
            💉 Carnet vaccinal — {nomBebe}
          </div>
          {vaccins.length > 0 ? (
            <table className="dtable">
              <thead>
                <tr>
                  <th>Vaccin</th><th>Date administré</th>
                  <th>Lot</th><th>Médecin</th><th>Statut</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vaccins.map((v) => (
                  <tr key={v.id_vaccin}>
                    <td><strong>{v.nom_vaccin?.replace(/_/g, ' ') ?? '—'}</strong></td>
                    <td>{formatDate(v.date_administration)}</td>
                    <td>{v.lot || '—'}</td>
                    <td>
                      {v.personnel?.utilisateur
                        ? `Dr. ${v.personnel.utilisateur.prenom} ${v.personnel.utilisateur.nom}`
                        : v.personnel?.fonction ?? '—'}
                    </td>
                    <td>
                      <span className={`badge ${
                        v.statut === 'fait'     ? 'b-normal'   :
                        v.statut === 'prevu'    ? 'b-amber'    :
                        v.statut === 'non_fait' ? 'b-critique' : 'b-gray'
                      }`}>
                        {v.statut === 'fait'     ? '✓ Fait'     :
                         v.statut === 'prevu'    ? '📅 Prévu'   :
                         v.statut === 'non_fait' ? '✗ Non fait' : '—'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setEditVaccin(v)}
                        style={{
                          padding: '5px 12px', borderRadius: 8,
                          border: '1px solid var(--rose-border)',
                          background: 'var(--rose-light)',
                          color: 'var(--rose-2)', fontSize: 11,
                          fontWeight: 700, cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}>
                        ✏️ Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              <table className="dtable">
                <thead>
                  <tr><th>Vaccin</th><th>Date administré</th><th>Médecin</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {[
                    ['BCG','b-amber','📅 Prévu'],
                    ['Poliomyélite','b-amber','📅 Prévu'],
                    ['Hépatite B','b-amber','📅 Prévu'],
                    ['Pentavalent (2 mois)','b-amber','📅 Prévu'],
                    ['Rotavirus','b-amber','📅 Prévu'],
                  ].map(([v, b, bl]) => (
                    <tr key={v}>
                      <td><strong>{v}</strong></td>
                      <td>—</td><td>—</td>
                      <td><span className={`badge ${b}`}>{bl}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize:12, color:'var(--gray)', marginTop:12 }}>
                ℹ️ Aucun vaccin enregistré. Utilisez le module Vaccinations pour en ajouter.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

DossierDetail.propTypes = {
  id:         PropTypes.number,
  onNavigate: PropTypes.func.isRequired,
};