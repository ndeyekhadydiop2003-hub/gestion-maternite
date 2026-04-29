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
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill={color} fontWeight="700">
                Naissance
              </text>
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
            {p.isNaissance && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill={color} fontWeight="700">
                Naissance
              </text>
            )}
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

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const bebeRes = await api.get(`/nouveau-nes/${id}`);
        const bebeData = bebeRes.data;
        setBebe(bebeData);

        // ── Récupérer patienteId — bébé né ici OU transféré ──
        const patienteId =
          bebeData?.accouchement?.grossesse?.patiente?.id_patient
          ?? bebeData?.patiente?.id_patient
          ?? bebeData?.id_patient;

        // ── Consultations via consultation_pediatrie ──
        try {
          const pedRes  = await api.get(`/nouveau-nes/${id}/consultations-pediatrie`);
          const pedData = Array.isArray(pedRes.data) ? pedRes.data : [];

          const histoCons = pedData
            .filter(p => p.consultation)
            .map(p => ({
              id_consultation:    p.consultation.id_consultation,
              date_consultation:  p.consultation.date_consultation,
              motif_consultation: p.consultation.motif_consultation,
              observation:        p.consultation.observation,
              poids:              p.consultation.poids,
              personnel:          p.consultation.personnel,
              taille:             p.taille,
              perimetre_cranien:  p.perimetre_cranien,
              allaitement:        p.allaitement,
              vaccin_a_jour:      p.vaccin_a_jour,
              developpement:      p.developpement,
              date:               p.consultation.date_consultation,
            }))
            .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));

          setConsultations(histoCons);
          setCourbe(histoCons.slice().reverse());
        } catch {
          // ── Fallback : consultations générales via id_patient ──
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
            } catch {
              setConsultations([]);
              setCourbe([]);
            }
          } else {
            setConsultations([]);
            setCourbe([]);
          }
        }

        // ── Vaccins ──
        try {
          const vaccRes = await api.get(`/nouveau-nes/${id}/vaccins`);
          setVaccins(Array.isArray(vaccRes.data) ? vaccRes.data : []);
        } catch {
          setVaccins([]);
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de chargement du dossier.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

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

  // ── Récupérer patiente — bébé né ici OU transféré ──
  const patiente     = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
  const accouchement = bebe?.accouchement;
  const nomBebe      = patiente
    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
    : `Nouveau-né #${bebe?.id_nouveau_ne}`;
  const apgar1 = getApgarBadge(bebe?.apgar_1min);
  const apgar5 = getApgarBadge(bebe?.apgar_5min);

  const pointNaissance = bebe?.poids_naissance ? [{
    date:              bebe.created_at,
    poids:             parseFloat(bebe.poids_naissance),
    taille:            bebe.taille ? parseFloat(bebe.taille) : null,
    perimetre_cranien: null,
    allaitement:       null,
    vaccin_a_jour:     false,
    isNaissance:       true,
  }] : [];

  const courbeComplete = [...pointNaissance, ...courbe];

  return (
    <div className="page-anim">

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
              // Bébé né ici
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
              // Bébé transféré
              [
                ['Mère',         patiente ? `${patiente.prenom} ${patiente.nom}` : '—'],
                ['Téléphone',    patiente?.telephone    ?? '—'],
                ['Groupe sanguin', patiente?.groupe_sanguin ?? '—'],
                ['Provenance',   patiente?.motif        ?? '—'],
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

          {bebe?.poids_naissance && (
            <div style={{
              background:'var(--rose-light)', borderRadius:8,
              padding:'8px 12px', fontSize:12, color:'var(--rose-2)',
              marginBottom:12, border:'1px solid var(--rose-border)',
              display:'flex', gap:16, alignItems:'center',
            }}>
              <span>📍 <strong>Point de départ — Naissance :</strong></span>
              <span>⚖️ {bebe.poids_naissance} kg</span>
              {bebe.taille && <span>📏 {bebe.taille} cm</span>}
              <span style={{ marginLeft:'auto', fontSize:11, color:'var(--gray)' }}>
                {courbe.length} consultation{courbe.length > 1 ? 's' : ''} de suivi
              </span>
            </div>
          )}

          <div className="growth-svg-wrap" style={{ marginBottom:12 }}>
            {activeGraph === 'poids'
              ? <CourbePoids  data={courbeComplete} />
              : <CourbeTaille data={courbeComplete} />
            }
          </div>

          <div className="gc-legend">
            {[
              ['#00897B','Normal (OMS)'],
              ['#F57F17','À surveiller'],
              ['#C62828','Critique'],
              ['#d4f0e7','Zone normale'],
            ].map(([bg,lbl]) => (
              <span key={lbl}><span className="gc-dot" style={{ background:bg }}></span> {lbl}</span>
            ))}
          </div>

          {courbeComplete.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:'var(--dark)' }}>
                📋 Tableau des mesures ({courbeComplete.length} point{courbeComplete.length > 1 ? 's' : ''})
              </div>
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Date</th><th>Type</th><th>Poids (kg)</th>
                    <th>Taille (cm)</th><th>PC (cm)</th>
                    <th>Allaitement</th><th>Vaccins</th>
                  </tr>
                </thead>
                <tbody>
                  {courbeComplete.map((c, i) => (
                    <tr key={i} style={{ background: c.isNaissance ? 'var(--rose-light)' : 'transparent' }}>
                      <td>{formatDate(c.date)}</td>
                      <td>
                        {c.isNaissance
                          ? <span className="badge b-rose">📍 Naissance</span>
                          : <span className="badge b-teal">🩺 Consultation</span>
                        }
                      </td>
                      <td>
                        <strong style={{ color: !c.poids ? 'var(--gray)' : c.poids < 2.5 ? '#C62828' : '#2E7D32' }}>
                          {c.poids ? `${c.poids} kg` : '—'}
                        </strong>
                      </td>
                      <td>{c.taille           ? `${c.taille} cm`            : '—'}</td>
                      <td>{c.perimetre_cranien ? `${c.perimetre_cranien} cm` : '—'}</td>
                      <td>{c.allaitement       || '—'}</td>
                      <td>
                        {c.isNaissance ? '—' : (
                          <span className={`badge ${c.vaccin_a_jour ? 'b-normal' : 'b-amber'}`}>
                            {c.vaccin_a_jour ? '✓ À jour' : '⚠ Non'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {courbe.length === 0 && (
            <div style={{ textAlign:'center', color:'var(--gray)', padding:'16px 0', fontSize:12 }}>
              Ajoutez des consultations pour enrichir la courbe de croissance.
              <br/>
              <button className="btn-primary btn-sm" style={{ marginTop:8 }}
                onClick={() => onNavigate('ajouter-consultation', bebe?.id_nouveau_ne)}>
                + Ajouter une consultation
              </button>
            </div>
          )}
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
                <th>Date</th><th>Motif</th><th>Observation</th>
                <th>Médecin</th><th>Poids</th><th>Taille</th><th>Allaitement</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', color:'var(--gray)', padding:24 }}>
                    Aucune consultation enregistrée pour ce bébé.
                  </td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id_consultation}>
                    <td>{formatDate(c.date_consultation)}</td>
                    <td style={{ fontSize:12 }}>{c.motif_consultation ?? '—'}</td>
                    <td style={{ fontSize:12, maxWidth:180 }}>{c.observation ?? '—'}</td>
                    <td>
                      {c.personnel?.utilisateur
                        ? `Dr. ${c.personnel.utilisateur.prenom} ${c.personnel.utilisateur.nom}`
                        : '—'}
                    </td>
                    <td>{c.poids  ? `${c.poids} kg`  : '—'}</td>
                    <td>{c.taille ? `${c.taille} cm` : '—'}</td>
                    <td>{c.allaitement ?? '—'}</td>
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
                  <th>Lot</th><th>Médecin</th><th>Statut</th>
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
                    ['BCG',                  '—','—','b-amber','📅 Prévu'],
                    ['Poliomyélite',         '—','—','b-amber','📅 Prévu'],
                    ['Hépatite B',           '—','—','b-amber','📅 Prévu'],
                    ['Pentavalent (2 mois)', '—','—','b-amber','📅 Prévu'],
                    ['Rotavirus',            '—','—','b-amber','📅 Prévu'],
                  ].map(([v, d, m, b, bl]) => (
                    <tr key={v}>
                      <td><strong>{v}</strong></td>
                      <td>{d}</td><td>{m}</td>
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