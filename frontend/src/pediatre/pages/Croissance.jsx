import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const SEUILS = {
  poids:  { normal: 2.5, surveiller: 1.5, unite: 'kg', min: 1,  max: 5  },
  taille: { normal: 46,  surveiller: 40,  unite: 'cm', min: 30, max: 70 },
};

const getEtat = (type, val) => {
  const s = SEUILS[type];
  if (!val) return { cls: 'b-gray',      label: '— Inconnu',    color: '#9E9E9E' };
  if (val >= s.normal)     return { cls: 'b-normal',     label: '✓ Normal',     color: '#00897B' };
  if (val >= s.surveiller) return { cls: 'b-surveiller', label: '⚠ Surveiller', color: '#F57F17' };
  return                          { cls: 'b-critique',   label: '⛔ Critique',   color: '#C62828' };
};

// ── Histogramme SVG ───────────────────────────────────────────────────────────
function Histogramme({ babies, type }) {
  const key    = type === 'poids' ? 'poids_naissance' : 'taille';
  const s      = SEUILS[type];
  const valids = babies.filter(b => parseFloat(b[key]) > 0);

  if (valids.length === 0) return (
    <div style={{ textAlign:'center', color:'var(--gray)', padding:30, fontSize:13 }}>
      Aucune donnée de {type} disponible
    </div>
  );

  const nbTranches = 6;
  const step       = (s.max - s.min) / nbTranches;
  const tranches   = Array.from({ length: nbTranches }, (_, i) => ({
    min:   s.min + i * step,
    max:   s.min + (i + 1) * step,
    count: 0,
    color: '#00897B',
  }));

  valids.forEach(b => {
    const val = parseFloat(b[key]);
    const idx = Math.min(Math.floor((val - s.min) / step), nbTranches - 1);
    if (idx >= 0) tranches[idx].count++;
  });

  tranches.forEach(t => {
    if (t.max <= s.surveiller) t.color = '#C62828';
    else if (t.max <= s.normal) t.color = '#F57F17';
    else t.color = '#00897B';
  });

  const maxCount = Math.max(...tranches.map(t => t.count), 1);
  const barW     = 60;
  const barGap   = 20;
  const svgW     = tranches.length * (barW + barGap) + 60;
  const maxBarH  = 100;

  return (
    <svg viewBox={`0 0 ${svgW} 160`} xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:500 }}>
      {/* Lignes grille */}
      {[0, 25, 50, 75, 100].map(pct => {
        const y = 20 + maxBarH - (pct / 100) * maxBarH;
        return (
          <g key={pct}>
            <line x1="45" y1={y} x2={svgW - 10} y2={y} stroke="#e0dded" strokeWidth="1" strokeDasharray="4"/>
            <text x="40" y={y + 3} textAnchor="end" fontSize="8" fill="#9E9E9E">
              {Math.round((pct / 100) * maxCount)}
            </text>
          </g>
        );
      })}

      {/* Barres */}
      {tranches.map((t, i) => {
        const barH = (t.count / maxCount) * maxBarH;
        const x    = 50 + i * (barW + barGap);
        const y    = 20 + maxBarH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH || 2}
              fill={t.color} rx="4" opacity="0.85"/>
            {t.count > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={t.color}>
                {t.count}
              </text>
            )}
            <text x={x + barW / 2} y={135} textAnchor="middle" fontSize="8" fill="#7c7c9a">
              {t.min.toFixed(1)}-{t.max.toFixed(1)}
            </text>
            <text x={x + barW / 2} y={144} textAnchor="middle" fontSize="7" fill="#9E9E9E">
              {s.unite}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

Histogramme.propTypes = { babies: PropTypes.array, type: PropTypes.string };

// ─────────────────────────────────────────────────────────────────────────────
export default function Croissance({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('poids');
  const [babies,    setBabies]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [page,      setPage]      = useState(1);
  const [lastPage,  setLastPage]  = useState(1);
  const [total,     setTotal]     = useState(0);

  const fetchBabies = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res  = await api.get(`/nouveau-nes?per_page=50&page=${p}`);
      const json = res.data;
      const data = json?.data ?? json ?? [];
      setBabies(Array.isArray(data) ? data : []);
      setLastPage(json?.last_page ?? 1);
      setTotal(json?.total ?? (Array.isArray(data) ? data.length : 0));
      setPage(p);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBabies(1); }, []);

  const avecPoids  = babies.filter(b => b.poids_naissance);
  const avecTaille = babies.filter(b => b.taille);

  const anomaliesPoids  = babies.filter(b => b.poids_naissance && b.poids_naissance < SEUILS.poids.normal);
  const anomaliesTaille = babies.filter(b => b.taille          && b.taille          < SEUILS.taille.normal);
  const anomalies       = activeTab === 'poids' ? anomaliesPoids : anomaliesTaille;

  const getNomBebe = (b) => {
    const p = b.accouchement?.grossesse?.patiente;
    return p ? `Bébé de ${p.prenom} ${p.nom}` : `Nouveau-né #${b.id_nouveau_ne}`;
  };

  const moyennePoids = avecPoids.length > 0
    ? (avecPoids.reduce((s, b) => s + parseFloat(b.poids_naissance), 0) / avecPoids.length).toFixed(2)
    : null;

  const moyenneTaille = avecTaille.length > 0
    ? (avecTaille.reduce((s, b) => s + parseFloat(b.taille), 0) / avecTaille.length).toFixed(1)
    : null;

  return (
    <div className="page-anim">

      {/* En-tête */}
      <div className="page-title">
        <h2>📊 Suivi & Croissance</h2>
        <button className="btn-primary btn-sm">📄 Télécharger PDF</button>
      </div>

      {/* 3 cartes médicales */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <div style={{ background:'#fff', border:'1px solid var(--sand)', borderRadius:10, padding:'12px 16px', borderLeft:'4px solid #00897B' }}>
          <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Poids moyen naissance</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#00897B', marginTop:4 }}>
            {moyennePoids ? `${moyennePoids} kg` : '—'}
          </div>
          <div style={{ fontSize:11, color:'var(--gray)', marginTop:2 }}>
            Sur {avecPoids.length} bébé{avecPoids.length > 1 ? 's' : ''} avec données
          </div>
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--sand)', borderRadius:10, padding:'12px 16px', borderLeft:'4px solid #7B1FA2' }}>
          <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Taille moyenne naissance</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#7B1FA2', marginTop:4 }}>
            {moyenneTaille ? `${moyenneTaille} cm` : '—'}
          </div>
          <div style={{ fontSize:11, color:'var(--gray)', marginTop:2 }}>
            Sur {avecTaille.length} bébé{avecTaille.length > 1 ? 's' : ''} avec données
          </div>
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--sand)', borderRadius:10, padding:'12px 16px', borderLeft: anomaliesPoids.length > 0 ? '4px solid #C62828' : '4px solid #00897B' }}>
          <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Bébés hors normes</div>
          <div style={{ fontSize:22, fontWeight:800, color: anomaliesPoids.length > 0 ? '#C62828' : '#00897B', marginTop:4 }}>
            {anomaliesPoids.length + anomaliesTaille.length}
          </div>
          <div style={{ fontSize:11, color:'var(--gray)', marginTop:2 }}>
            {anomaliesPoids.length} poids · {anomaliesTaille.length} taille
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['poids','⚖️ Poids (kg)'],['taille','📏 Taille (cm)']].map(([key, label]) => (
          <div key={key}
            className={`tab${activeTab === key ? ' active' : ''}`}
            onClick={() => setActiveTab(key)}>
            {label}
          </div>
        ))}
      </div>

      {/* Chargement */}
      {loading && (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:28 }}>⏳</div>
          <p style={{ color:'var(--gray)', marginTop:8 }}>Chargement des données…</p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:28 }}>❌</div>
          <p style={{ color:'red', marginTop:8 }}>{error}</p>
          <button className="btn-primary btn-sm" onClick={() => fetchBabies(1)} style={{ marginTop:12 }}>
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Histogramme */}
          <div className="card">
            <div className="card-head">
              <h3>
                {activeTab === 'poids'
                  ? '⚖️ Distribution des poids de naissance'
                  : '📏 Distribution des tailles de naissance'}
              </h3>
              <span className="badge b-rose">
                {activeTab === 'poids' ? avecPoids.length : avecTaille.length} bébés avec données
              </span>
            </div>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <Histogramme babies={babies} type={activeTab} />
              </div>

              {/* Légende */}
              <div className="gc-legend" style={{ marginTop:12, justifyContent:'center' }}>
                {[['#00897B','Normal (OMS)'],['#F57F17','À surveiller'],['#C62828','Critique']].map(([bg, lbl]) => (
                  <span key={lbl}><span className="gc-dot" style={{ background:bg }}></span> {lbl}</span>
                ))}
              </div>

              {/* Seuils OMS */}
              <div style={{ marginTop:12, padding:'10px 14px', background:'#f5f0f8', borderRadius:8, fontSize:12, color:'var(--gray)', display:'flex', gap:20, flexWrap:'wrap' }}>
                <span>📋 Seuils OMS :</span>
                {activeTab === 'poids' ? (
                  <>
                    <span style={{ color:'#00897B' }}>✓ Normal : ≥ 2.5 kg</span>
                    <span style={{ color:'#F57F17' }}>⚠ Surveiller : 1.5 – 2.5 kg</span>
                    <span style={{ color:'#C62828' }}>⛔ Critique : &lt; 1.5 kg</span>
                  </>
                ) : (
                  <>
                    <span style={{ color:'#00897B' }}>✓ Normal : ≥ 46 cm</span>
                    <span style={{ color:'#F57F17' }}>⚠ Surveiller : 40 – 46 cm</span>
                    <span style={{ color:'#C62828' }}>⛔ Critique : &lt; 40 cm</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table anomalies */}
          <div className="card">
            <div className="card-head">
              <h3>⚠️ Bébés hors normes — {activeTab === 'poids' ? 'Poids' : 'Taille'}</h3>
              <span className={`badge ${anomalies.length > 0 ? 'b-rose' : 'b-normal'}`}>
                {anomalies.length > 0 ? `${anomalies.length} cas` : '✓ Aucun'}
              </span>
            </div>
            <table className="dtable">
              <thead>
                <tr>
                  <th>Bébé</th>
                  <th>Date naissance</th>
                  <th>Poids naissance</th>
                  <th>Taille</th>
                  <th>État poids</th>
                  <th>État taille</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign:'center', color:'var(--gray)', padding:24 }}>
                      ✅ Aucun bébé hors norme pour ce critère.
                    </td>
                  </tr>
                ) : (
                  anomalies.map((b) => {
                    const etatPoids  = getEtat('poids',  b.poids_naissance);
                    const etatTaille = getEtat('taille', b.taille);
                    return (
                      <tr key={b.id_nouveau_ne}>
                        <td>
                          <div className="baby-cell">
                            <div className="baby-ava">👶</div>
                            <div>
                              <div className="baby-name">{getNomBebe(b)}</div>
                              <div className="baby-id">NB{String(b.id_nouveau_ne).padStart(4,'0')}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(b.created_at)}</td>
                        <td>
                          <strong style={{ color: etatPoids.color }}>
                            {b.poids_naissance ? `${b.poids_naissance} kg` : '—'}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: etatTaille.color }}>
                            {b.taille ? `${b.taille} cm` : '—'}
                          </strong>
                        </td>
                        <td><span className={`badge ${etatPoids.cls}`}>{etatPoids.label}</span></td>
                        <td><span className={`badge ${etatTaille.cls}`}>{etatTaille.label}</span></td>
                        <td>
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => onNavigate('dossier-detail', b.id_nouveau_ne)}
                          >
                            Voir dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:16 }}>
              <button className="btn-primary btn-sm"
                disabled={page === 1}
                onClick={() => fetchBabies(page - 1)}
                style={{ opacity: page === 1 ? 0.4 : 1 }}>
                ← Précédent
              </button>
              <span style={{ fontSize:12, color:'var(--gray)' }}>
                Page {page} / {lastPage} · {total} bébés au total
              </span>
              <button className="btn-primary btn-sm"
                disabled={page === lastPage}
                onClick={() => fetchBabies(page + 1)}
                style={{ opacity: page === lastPage ? 0.4 : 1 }}>
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

Croissance.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};