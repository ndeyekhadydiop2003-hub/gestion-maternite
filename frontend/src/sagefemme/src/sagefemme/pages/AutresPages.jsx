import React, { useState, useEffect } from 'react';
import { nouveauNesAPI, examensAPI, patientesAPI, authAPI } from '../services/api';

const VACCINS=[{nom:'BCG',delai:'Naissance'},{nom:'Hépatite B',delai:'Naissance'},{nom:'Pentavalent 1',delai:'6 semaines'},{nom:'Pentavalent 2',delai:'10 semaines'},{nom:'Pentavalent 3',delai:'14 semaines'},{nom:'ROR',delai:'9 mois'},{nom:'Méningite A',delai:'12 mois'},{nom:'Fièvre jaune',delai:'9 mois'}];

export function SuiviPostnatal() {
  const [bebes, setBebes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ nouveauNesAPI.list().then(d=>setBebes(Array.isArray(d)?d:(d.data||[]))).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151'}}>👶 Suivi Postnatal</h2>
        <span className="badge badge-teal">{bebes.length} nouveau-né(s)</span>
      </div>
      {bebes.length===0&&<div className="sf-empty"><div className="sf-empty__icon">👶</div><div className="sf-empty__text">Aucun nouveau-né enregistré</div></div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
        {bebes.map(b=>(
          <div key={b.id_nouveau_ne} className="sf-card">
            <div className="sf-card__header">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:b.sexe==='masculin'?'linear-gradient(135deg,#93c5fd,#3b82f6)':'linear-gradient(135deg,#f9a8d4,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                  {b.sexe==='masculin'?'👦':b.sexe==='feminin'?'👧':'👶'}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>Bébé #{b.id_nouveau_ne}</div>
                  <div style={{fontSize:11,color:'#9ca3af'}}>Né le {b.accouchement?.date_accouchement||'—'}</div>
                </div>
              </div>
              <span className={`badge ${b.etat_sante==='bon'?'badge-green':b.etat_sante==='moyen'?'badge-amber':'badge-red'}`}>{b.etat_sante}</span>
            </div>
            <div className="sf-card__body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                <div style={{background:'#fdf2f8',borderRadius:8,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:10,color:'#9ca3af'}}>POIDS</div><div style={{fontWeight:700,fontSize:16,color:'#db2777'}}>{b.poids_naissance?b.poids_naissance+' kg':'—'}</div></div>
                <div style={{background:'#fdf2f8',borderRadius:8,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:10,color:'#9ca3af'}}>TAILLE</div><div style={{fontWeight:700,fontSize:16,color:'#db2777'}}>{b.taille?b.taille+' cm':'—'}</div></div>
                <div style={{background:'#fdf2f8',borderRadius:8,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:10,color:'#9ca3af'}}>APGAR 1min</div><div style={{fontWeight:700,fontSize:16,color:b.apgar_1min>=7?'#22c55e':'#ef4444'}}>{b.apgar_1min!=null?b.apgar_1min+'/10':'—'}</div></div>
                <div style={{background:'#fdf2f8',borderRadius:8,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:10,color:'#9ca3af'}}>APGAR 5min</div><div style={{fontWeight:700,fontSize:16,color:b.apgar_5min>=7?'#22c55e':'#ef4444'}}>{b.apgar_5min!=null?b.apgar_5min+'/10':'—'}</div></div>
              </div>
              <div style={{fontSize:12,color:'#9ca3af'}}>Mère: {b.accouchement?.grossesse?.patiente?.prenom||'—'} {b.accouchement?.grossesse?.patiente?.nom||''}</div>
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <button className="btn btn-outline btn-sm" style={{flex:1}}>📋 Pédiatrie</button>
                <button className="btn btn-primary btn-sm">💉 Vaccins</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Examens() {
  const [examens, setExamens] = useState([]);
  const [patientes, setPatientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id_patient:'', type_examen:'', date_examen:new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false); const [msg, setMsg] = useState('');
  const load = () => { Promise.all([examensAPI.list().catch(()=>[]), patientesAPI.list().catch(()=>[])]).then(([e,p])=>{setExamens(Array.isArray(e)?e:(e.data||[]));setPatientes(Array.isArray(p)?p:(p.data||[]));}).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);
  const handleCreate = async () => {
    setSaving(true);
    try { await examensAPI.create(form); setModal(false); setMsg('✅ Examen prescrit !'); setTimeout(()=>setMsg(''),3000); load(); }
    catch(e){ alert(e.message); } finally { setSaving(false); }
  };
  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151'}}>🔬 Examens</h2>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Prescrire examen</button>
      </div>
      {msg&&<div className="sf-alert sf-alert-success" style={{marginBottom:12}}>{msg}</div>}
      <div className="sf-card">
        <div className="sf-table-wrap">
          <table className="sf-table">
            <thead><tr><th>Patiente</th><th>Type</th><th>Date</th><th>Résultat</th></tr></thead>
            <tbody>
              {examens.length===0&&<tr><td colSpan={4}><div className="sf-empty"><div className="sf-empty__icon">🔬</div><div className="sf-empty__text">Aucun examen prescrit</div></div></td></tr>}
              {examens.map(e=>(
                <tr key={e.id_examen}>
                  <td><div className="pat-info"><div className="pat-avatar">{e.patiente?.nom?.[0]}</div><div className="pat-info__name">{e.patiente?.prenom} {e.patiente?.nom}</div></div></td>
                  <td><span className="badge badge-blue">{e.type_examen}</span></td>
                  <td>{e.date_examen}</td>
                  <td>{(e.resultats?.length>0)?<span className="badge badge-green">✅ Disponible</span>:<span className="badge badge-amber">⏳ En attente</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal-box">
            <div className="modal-header"><span className="modal-title">🔬 Prescrire un examen</span><button className="btn btn-ghost btn-sm" onClick={()=>setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="sf-form">
                <div className="sf-field"><label>Patiente</label>
                  <select value={form.id_patient} onChange={e=>setForm(p=>({...p,id_patient:e.target.value}))}>
                    <option value="">— Sélectionner —</option>
                    {patientes.map(p=><option key={p.id_patient} value={p.id_patient}>{p.prenom} {p.nom}</option>)}
                  </select>
                </div>
                <div className="sf-field"><label>Type d'examen</label>
                  <select value={form.type_examen} onChange={e=>setForm(p=>({...p,type_examen:e.target.value}))}>
                    <option value="">— Sélectionner —</option>
                    <option value="echographie">Échographie</option>
                    <option value="biologie">Bilan biologique</option>
                    <option value="cardiotocographie">Cardiotocographie (CTG)</option>
                    <option value="amniocentese">Amniocentèse</option>
                    <option value="frottis">Frottis cervical</option>
                    <option value="hemogramme">Hémogramme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="sf-field"><label>Date</label><input type="date" value={form.date_examen} onChange={e=>setForm(p=>({...p,date_examen:e.target.value}))}/></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={()=>setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'⏳...':'💾 Prescrire'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Vaccinations() {
  const [bebes, setBebes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ nouveauNesAPI.list().then(d=>setBebes(Array.isArray(d)?d:(d.data||[]))).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;
  return (
    <div>
      <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151',marginBottom:16}}>💉 Vaccinations</h2>
      <div className="sf-card" style={{marginBottom:14}}>
        <div className="sf-card__header"><span className="sf-card__title">📅 Calendrier vaccinal national</span></div>
        <div className="sf-card__body">
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {VACCINS.map(v=>(
              <div key={v.nom} style={{background:'#fdf2f8',borderRadius:8,padding:'8px 12px',border:'1px solid #fbcfe8',minWidth:110}}>
                <div style={{fontSize:12,fontWeight:600,color:'#374151'}}>{v.nom}</div>
                <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{v.delai}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sf-card">
        <div className="sf-card__header"><span className="sf-card__title">👶 Suivi vaccinal ({bebes.length} enfant(s))</span></div>
        <div className="sf-table-wrap">
          <table className="sf-table">
            <thead><tr><th>Enfant</th><th>Mère</th><th>BCG</th><th>Hépatite B</th><th>Pentavalent 1</th><th>Statut</th></tr></thead>
            <tbody>
              {bebes.length===0&&<tr><td colSpan={6}><div className="sf-empty"><div className="sf-empty__icon">💉</div><div className="sf-empty__text">Aucun enfant enregistré</div></div></td></tr>}
              {bebes.map(b=>(
                <tr key={b.id_nouveau_ne}>
                  <td><span style={{fontSize:16}}>{b.sexe==='masculin'?'👦':b.sexe==='feminin'?'👧':'👶'}</span> Enfant #{b.id_nouveau_ne}</td>
                  <td>{b.accouchement?.grossesse?.patiente?.prenom||'—'} {b.accouchement?.grossesse?.patiente?.nom||''}</td>
                  <td><span className="badge badge-green">✓</span></td>
                  <td><span className="badge badge-green">✓</span></td>
                  <td><span className="badge badge-amber">À faire</span></td>
                  <td><span className="badge badge-teal">Suivi actif</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Parametres() {
  const [form, setForm] = useState({ ancien_mdp:'', nouveau_mdp:'', confirm:'' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const updatePassword = async () => {
    if(form.nouveau_mdp!==form.confirm){ setErr('Les mots de passe ne correspondent pas'); return; }
    setSaving(true); setErr(''); setMsg('');
    try { await authAPI.updatePassword({ ancien_mdp:form.ancien_mdp, nouveau_mdp:form.nouveau_mdp }); setMsg('✅ Mot de passe modifié avec succès'); setForm({ancien_mdp:'',nouveau_mdp:'',confirm:''}); }
    catch(e){ setErr('❌ '+e.message); } finally { setSaving(false); }
  };
  return (
    <div>
      <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151',marginBottom:20}}>⚙️ Paramètres</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">🔒 Changer le mot de passe</span></div>
          <div className="sf-card__body">
            {msg&&<div className="sf-alert sf-alert-success">{msg}</div>}
            {err&&<div className="sf-alert sf-alert-error">{err}</div>}
            <div className="sf-form">
              <div className="sf-field"><label>Ancien mot de passe</label><input type="password" value={form.ancien_mdp} onChange={e=>set('ancien_mdp',e.target.value)}/></div>
              <div className="sf-field"><label>Nouveau mot de passe</label><input type="password" value={form.nouveau_mdp} onChange={e=>set('nouveau_mdp',e.target.value)}/></div>
              <div className="sf-field"><label>Confirmer</label><input type="password" value={form.confirm} onChange={e=>set('confirm',e.target.value)}/></div>
              <button className="btn btn-primary" onClick={updatePassword} disabled={saving}>{saving?'⏳...':'💾 Mettre à jour'}</button>
            </div>
          </div>
        </div>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">ℹ️ Informations système</span></div>
          <div className="sf-card__body">
            <div style={{display:'flex',flexDirection:'column',gap:10,fontSize:13}}>
              {[{icon:'🏥',title:'Système',val:'Gestion Maternité v1.0'},{icon:'👤',title:'Rôle',val:'Sage-femme'},{icon:'📋',title:'Droits',val:'Consultations · Grossesses · Accouchements · Planning · Infectiologie · Confirmation RDV · Transfert gynéco'}].map(item=>(
                <div key={item.title} style={{background:'#fdf2f8',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontWeight:600,color:'#374151',marginBottom:3}}>{item.icon} {item.title}</div>
                  <div style={{color:'#9ca3af',fontSize:12}}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}