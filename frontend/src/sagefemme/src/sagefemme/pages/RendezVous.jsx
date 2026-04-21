import React, { useState, useEffect } from 'react';
import { rendezVousAPI } from '../services/api';
const HEURES=['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
export default function RendezVous() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('liste');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const load = () => rendezVousAPI.list().then(d=>setRdvs(Array.isArray(d)?d:(d.data||[]))).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);
  const showMsg = (m, t='success') => { setMsg(m); setMsgType(t); setTimeout(()=>setMsg(''),3500); };
  const confirmerRdv = async (id) => {
    try { await rendezVousAPI.confirmer(id); showMsg('✅ Rendez-vous confirmé avec succès !'); load(); }
    catch(e) { showMsg('❌ '+e.message,'error'); }
  };
  const filtered = rdvs.filter(r=>!dateFilter||r.date_rv===dateFilter).sort((a,b)=>a.heure_rv?.localeCompare(b.heure_rv));
  const rdvsParHeure = {};
  filtered.forEach(r=>{ const h=r.heure_rv?.slice(0,5); if(!rdvsParHeure[h])rdvsParHeure[h]=[]; rdvsParHeure[h].push(r); });
  const stats = { total:filtered.length, confirmes:filtered.filter(r=>r.statut==="confirme").length, planifies:filtered.filter(r=>r.statut==="planifie").length, effectues:filtered.filter(r=>r.statut==="effectue").length };
  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151'}}>📅 Rendez-vous</h2>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{padding:'7px 10px',borderRadius:8,border:'1.5px solid #fbcfe8',fontFamily:'inherit',fontSize:13,outline:'none'}}/>
          <button className={`btn btn-sm ${viewMode==='liste'?'btn-primary':'btn-outline'}`} onClick={()=>setViewMode('liste')}>☰ Liste</button>
          <button className={`btn btn-sm ${viewMode==='planning'?'btn-primary':'btn-outline'}`} onClick={()=>setViewMode('planning')}>📋 Planning</button>
        </div>
      </div>
      {msg&&<div className={`sf-alert sf-alert-${msgType==='error'?'error':'success'}`} style={{marginBottom:12}}>{msg}</div>}
      <div className="sf-alert sf-alert-info" style={{marginBottom:14,fontSize:12}}>ℹ️ Les RDV sont créés par la secrétaire. Vous pouvez <strong>confirmer</strong> les rendez-vous planifiés.</div>
      <div className="sf-stats" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:14}}>
        <div className="sf-stat-card pink"><div className="sf-stat-card__label">Total</div><div className="sf-stat-card__value">{stats.total}</div></div>
        <div className="sf-stat-card green"><div className="sf-stat-card__label">Confirmés</div><div className="sf-stat-card__value">{stats.confirmes}</div></div>
        <div className="sf-stat-card teal"><div className="sf-stat-card__label">À confirmer</div><div className="sf-stat-card__value">{stats.planifies}</div></div>
        <div className="sf-stat-card purple"><div className="sf-stat-card__label">Effectués</div><div className="sf-stat-card__value">{stats.effectues}</div></div>
      </div>
      {viewMode==='liste'?(
        <div className="sf-card">
          <div className="sf-table-wrap">
            <table className="sf-table">
              <thead><tr><th>Heure</th><th>Patiente</th><th>Motif</th><th>Priorité</th><th>Statut</th><th>Confirmé par</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={7}><div className="sf-empty"><div className="sf-empty__icon">📭</div><div className="sf-empty__text">Aucun RDV pour cette date</div></div></td></tr>}
                {filtered.map(rdv=>(
                  <tr key={rdv.id_rendez_vous}>
                    <td><strong style={{color:'#db2777'}}>{rdv.heure_rv}</strong></td>
                    <td><div className="pat-info"><div className="pat-avatar">{rdv.patiente?.nom?.[0]}{rdv.patiente?.prenom?.[0]}</div><div><div className="pat-info__name">{rdv.patiente?.prenom} {rdv.patiente?.nom}</div><div className="pat-info__sub">{rdv.patiente?.telephone}</div></div></div></td>
                    <td>{rdv.motif||'—'}</td>
                    <td><span className={`badge ${rdv.priorite==='critique'?'badge-red':rdv.priorite==='urgente'?'badge-amber':'badge-teal'}`}>{rdv.priorite}</span></td>
                    <td><span className={`badge ${rdv.statut==='confirme'?'badge-green':rdv.statut==='planifie'?'badge-amber':rdv.statut==='effectue'?'badge-teal':'badge-gray'}`}>{rdv.statut}</span></td>
                    <td style={{fontSize:12}}>{rdv.confirme_par?<span style={{color:'#15803d'}}>✅ {rdv.confirmeParPersonnel?.prenom} {rdv.confirmeParPersonnel?.nom}</span>:<span style={{color:'#9ca3af'}}>—</span>}</td>
                    <td>
                      {rdv.statut==='planifie'?<button className="btn btn-success btn-sm" onClick={()=>confirmerRdv(rdv.id_rendez_vous)}>✅ Confirmer</button>
                      :rdv.statut==='confirme'?<span style={{fontSize:12,color:'#15803d',fontWeight:600}}>✅ Confirmé</span>
                      :<span style={{fontSize:12,color:'#9ca3af'}}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ):(
        <div className="sf-card">
          <div style={{padding:'12px 18px',borderBottom:'1px solid #fce7f3',fontWeight:600,color:'#374151',fontSize:14}}>
            Planning du {dateFilter?new Date(dateFilter+'T00:00:00').toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'}):'—'}
          </div>
          {HEURES.map(h=>(
            <div key={h} style={{display:'flex',borderBottom:'1px solid #fdf2f8',minHeight:50}}>
              <div style={{width:70,padding:'12px 14px',fontSize:12,fontWeight:600,color:'#ec4899',flexShrink:0}}>{h}</div>
              <div style={{flex:1,padding:'5px 10px',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {(rdvsParHeure[h]||[]).map(rdv=>(
                  <div key={rdv.id_rendez_vous} style={{background:rdv.statut==='confirme'?'#dcfce7':rdv.priorite==='urgente'?'#fef9c3':rdv.priorite==='critique'?'#fee2e2':'#fdf2f8',border:`1px solid ${rdv.statut==='confirme'?'#86efac':rdv.priorite==='urgente'?'#fbbf24':rdv.priorite==='critique'?'#f87171':'#fbcfe8'}`,borderRadius:8,padding:'6px 10px',fontSize:12,minWidth:150}}>
                    <div style={{fontWeight:600}}>{rdv.patiente?.prenom} {rdv.patiente?.nom}</div>
                    <div style={{color:'#9ca3af',fontSize:11,marginTop:2}}>{rdv.motif||'Consultation'}</div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:5,alignItems:'center'}}>
                      <span className={`badge ${rdv.statut==='confirme'?'badge-green':'badge-amber'}`} style={{fontSize:10}}>{rdv.statut}</span>
                      {rdv.statut==='planifie'&&<button style={{fontSize:10,padding:'2px 6px',borderRadius:4,border:'none',background:'#ec4899',color:'white',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>confirmerRdv(rdv.id_rendez_vous)}>✅ Confirmer</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}