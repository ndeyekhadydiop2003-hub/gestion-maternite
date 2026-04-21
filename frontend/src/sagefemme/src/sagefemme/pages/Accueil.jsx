import React, { useState, useEffect } from 'react';
import { dashboardAPI, rendezVousAPI, grossessesAPI } from '../services/api';
export default function Accueil({ onNavigate }) {
  const [stats, setStats] = useState({});
  const [rdvs, setRdvs] = useState([]);
  const [grossesses, setGrossesses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      dashboardAPI.stats().catch(()=>({})),
      rendezVousAPI.list().catch(()=>[]),
      grossessesAPI.list().catch(()=>[]),
    ]).then(([s,r,g])=>{
      setStats(s||{});
      setRdvs(Array.isArray(r)?r:(r.data||[]));
      setGrossesses(Array.isArray(g)?g:(g.data||[]));
    }).finally(()=>setLoading(false));
  },[]);
  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;
  const today=new Date().toISOString().split('T')[0];
  const rdvsToday=rdvs.filter(r=>r.date_rv===today);
  const grossActives=grossesses.filter(g=>g.statut==='en_cours');
  const grossRisque=grossActives.filter(g=>g.grossesse_a_risque);
  return (
    <div>
      <div className="sf-stats">
        <div className="sf-stat-card pink"><div className="sf-stat-card__label">Total patientes</div><div className="sf-stat-card__value">{stats.total_patientes||'—'}</div><div className="sf-stat-card__sub">↑ {stats.nouvelles_semaine||0} cette semaine</div></div>
        <div className="sf-stat-card teal"><div className="sf-stat-card__label">Grossesses en cours</div><div className="sf-stat-card__value">{grossActives.length}</div><div className="sf-stat-card__sub">{grossRisque.length} à risque</div></div>
        <div className="sf-stat-card green"><div className="sf-stat-card__label">RDV aujourd'hui</div><div className="sf-stat-card__value">{rdvsToday.length}</div><div className="sf-stat-card__sub">{rdvsToday.filter(r=>r.statut==='planifie').length} à confirmer</div></div>
        <div className="sf-stat-card purple"><div className="sf-stat-card__label">Consultations</div><div className="sf-stat-card__value">{stats.consultations_semaine||'—'}</div><div className="sf-stat-card__sub">cette semaine</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:16}}>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">📅 Rendez-vous du jour</span><button className="btn btn-primary btn-sm" onClick={()=>onNavigate('rendez-vous')}>Voir tout</button></div>
          <div className="sf-table-wrap">
            <table className="sf-table">
              <thead><tr><th>Heure</th><th>Patiente</th><th>Motif</th><th>Priorité</th><th>Statut</th></tr></thead>
              <tbody>
                {rdvsToday.length===0&&<tr><td colSpan={5}><div className="sf-empty"><div className="sf-empty__icon">📭</div><div className="sf-empty__text">Aucun RDV aujourd'hui</div></div></td></tr>}
                {rdvsToday.sort((a,b)=>a.heure_rv?.localeCompare(b.heure_rv)).map(rdv=>(
                  <tr key={rdv.id_rendez_vous}>
                    <td><strong style={{color:'#db2777'}}>{rdv.heure_rv}</strong></td>
                    <td><div className="pat-info"><div className="pat-avatar">{rdv.patiente?.nom?.[0]}{rdv.patiente?.prenom?.[0]}</div><div><div className="pat-info__name">{rdv.patiente?.prenom} {rdv.patiente?.nom}</div></div></div></td>
                    <td>{rdv.motif||'—'}</td>
                    <td><span className={`badge ${rdv.priorite==='critique'?'badge-red':rdv.priorite==='urgente'?'badge-amber':'badge-teal'}`}>{rdv.priorite}</span></td>
                    <td><span className={`badge ${rdv.statut==='confirme'?'badge-green':rdv.statut==='planifie'?'badge-amber':'badge-gray'}`}>{rdv.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">⚠️ Grossesses à risque</span><button className="btn btn-outline btn-sm" onClick={()=>onNavigate('suivi-grossesse')}>Voir tout</button></div>
          <div style={{padding:'8px 0'}}>
            {grossRisque.length===0&&<div className="sf-empty"><div className="sf-empty__icon">✅</div><div className="sf-empty__text">Aucune grossesse à risque</div></div>}
            {grossRisque.slice(0,4).map(g=>{
              const pct=Math.min(((g.semaines_amenorrhee||0)/41)*100,100);
              return(
                <div key={g.id_grossesse} style={{padding:'10px 16px',borderBottom:'1px solid #fce7f3'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div className="pat-info">
                      <div className="pat-avatar">{g.patiente?.nom?.[0]}{g.patiente?.prenom?.[0]}</div>
                      <div><div className="pat-info__name">{g.patiente?.prenom} {g.patiente?.nom}</div><div className="pat-info__sub">DPA: {g.date_terme_prevu||'—'}</div></div>
                    </div>
                    <span className="badge badge-amber">{g.semaines_amenorrhee||0} SA</span>
                  </div>
                  <div className="pregnancy-bar" style={{marginTop:8}}><div className="pregnancy-bar__fill" style={{width:pct+'%'}}/></div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#9ca3af',marginTop:2}}><span>Sem {g.semaines_amenorrhee||0}/41</span><span>{Math.round(pct)}%</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}