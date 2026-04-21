import React, { useState, useEffect } from 'react';
import { grossessesAPI, accouchementsAPI, nouveauNesAPI } from '../services/api';

function ModalAccouchement({ grossesse, onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [accId, setAccId] = useState(null);
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [acc, setAcc] = useState({ id_grossesse:grossesse.id_grossesse, date_accouchement:new Date().toISOString().split('T')[0], type_accouchement:'voie_basse', duree_travail:'', complication:'', statut:'termine' });
  const [bebe, setBebe] = useState({ sexe:'', poids_naissance:'', taille:'', apgar_1min:'', apgar_5min:'', etat_sante:'bon' });
  const setA=(k,v)=>setAcc(p=>({...p,[k]:v}));
  const setB=(k,v)=>setBebe(p=>({...p,[k]:v}));
  const step1 = async () => { setSaving(true); setError(''); try { const r=await accouchementsAPI.create(acc); setAccId(r.id_accouchement); setStep(2); } catch(e){setError(e.message);} finally{setSaving(false);} };
  const step2 = async () => { setSaving(true); setError(''); try { await nouveauNesAPI.create({...bebe,id_accouchement:accId}); await grossessesAPI.update(grossesse.id_grossesse,{statut:'terminee'}); onSaved(); onClose(); } catch(e){setError(e.message);} finally{setSaving(false);} };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-header"><span className="modal-title">{step===1?'🏥 Enregistrer accouchement':'👶 Dossier nouveau-né'}</span><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="sf-alert sf-alert-error">{error}</div>}
          {step===1&&<div className="sf-form">
            <div className="sf-form-row">
              <div className="sf-field"><label>Date accouchement</label><input type="date" value={acc.date_accouchement} onChange={e=>setA('date_accouchement',e.target.value)}/></div>
              <div className="sf-field"><label>Type</label><select value={acc.type_accouchement} onChange={e=>setA('type_accouchement',e.target.value)}><option value="voie_basse">Voie basse</option><option value="cesarienne">Césarienne</option><option value="forceps">Forceps</option><option value="ventouse">Ventouse</option></select></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Durée travail (min)</label><input type="number" value={acc.duree_travail} onChange={e=>setA('duree_travail',e.target.value)}/></div>
              <div className="sf-field"><label>Statut</label><select value={acc.statut} onChange={e=>setA('statut',e.target.value)}><option value="en_cours">En cours</option><option value="termine">Terminé</option><option value="complique">Compliqué</option></select></div>
            </div>
            <div className="sf-field"><label>Complications</label><textarea value={acc.complication} onChange={e=>setA('complication',e.target.value)} placeholder="Décrire les complications éventuelles..."/></div>
          </div>}
          {step===2&&<div className="sf-form">
            <div className="sf-alert sf-alert-success">✅ Accouchement enregistré — Créer le dossier nouveau-né</div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Sexe</label><select value={bebe.sexe} onChange={e=>setB('sexe',e.target.value)}><option value="">—</option><option value="masculin">Masculin</option><option value="feminin">Féminin</option><option value="indetermine">Indéterminé</option></select></div>
              <div className="sf-field"><label>État santé</label><select value={bebe.etat_sante} onChange={e=>setB('etat_sante',e.target.value)}><option value="bon">Bon</option><option value="moyen">Moyen</option><option value="critique">Critique</option></select></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Poids naissance (kg)</label><input type="number" step="0.01" value={bebe.poids_naissance} onChange={e=>setB('poids_naissance',e.target.value)} placeholder="3.25"/></div>
              <div className="sf-field"><label>Taille (cm)</label><input type="number" step="0.1" value={bebe.taille} onChange={e=>setB('taille',e.target.value)} placeholder="50"/></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>APGAR 1 min (0-10)</label><input type="number" min="0" max="10" value={bebe.apgar_1min} onChange={e=>setB('apgar_1min',e.target.value)}/></div>
              <div className="sf-field"><label>APGAR 5 min (0-10)</label><input type="number" min="0" max="10" value={bebe.apgar_5min} onChange={e=>setB('apgar_5min',e.target.value)}/></div>
            </div>
          </div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          {step===1?<button className="btn btn-primary" onClick={step1} disabled={saving}>{saving?'⏳...':'Suivant → Nouveau-né'}</button>
          :<button className="btn btn-primary" onClick={step2} disabled={saving}>{saving?'⏳...':'💾 Créer le dossier bébé'}</button>}
        </div>
      </div>
    </div>
  );
}

export default function SuiviGrossesse() {
  const [grossesses, setGrossesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('en_cours');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const load = () => grossessesAPI.list().then(d=>setGrossesses(Array.isArray(d)?d:(d.data||[]))).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);
  const showMsg = (m) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };
  const filtered = filter==='all'?grossesses:grossesses.filter(g=>g.statut===filter);
  const stats = { enCours:grossesses.filter(g=>g.statut==='en_cours').length, risque:grossesses.filter(g=>g.statut==='en_cours'&&g.grossesse_a_risque).length, terminees:grossesses.filter(g=>g.statut==='terminee').length };
  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;
  return (
    <div>
      <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151',marginBottom:16}}>🤰 Suivi Grossesse</h2>
      {msg&&<div className="sf-alert sf-alert-success" style={{marginBottom:12}}>{msg}</div>}
      <div className="sf-stats" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:16}}>
        <div className="sf-stat-card teal"><div className="sf-stat-card__label">En cours</div><div className="sf-stat-card__value">{stats.enCours}</div></div>
        <div className="sf-stat-card pink"><div className="sf-stat-card__label">À risque</div><div className="sf-stat-card__value">{stats.risque}</div></div>
        <div className="sf-stat-card green"><div className="sf-stat-card__label">Terminées</div><div className="sf-stat-card__value">{stats.terminees}</div></div>
      </div>
      <div className="sf-tabs">
        {[{id:'en_cours',label:'🤰 En cours'},{id:'terminee',label:'✅ Terminées'},{id:'fausse_couche',label:'💔 Fausse couche'},{id:'all',label:'📋 Toutes'}].map(f=>(
          <button key={f.id} className={'sf-tab'+(filter===f.id?' active':'')} onClick={()=>setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {filtered.length===0&&<div style={{gridColumn:'1/-1'}}><div className="sf-empty"><div className="sf-empty__icon">🤰</div><div className="sf-empty__text">Aucune grossesse dans cette catégorie</div></div></div>}
        {filtered.map(g=>{
          const pct=Math.min(((g.semaines_amenorrhee||0)/41)*100,100);
          const restant=g.date_terme_prevu?Math.max(0,Math.ceil((new Date(g.date_terme_prevu)-new Date())/(1000*60*60*24))):null;
          return (
            <div key={g.id_grossesse} className="sf-card" style={{borderColor:g.grossesse_a_risque?'#fbbf24':undefined}}>
              <div className="sf-card__header">
                <div className="pat-info">
                  <div className="pat-avatar">{g.patiente?.nom?.[0]}{g.patiente?.prenom?.[0]}</div>
                  <div><div className="pat-info__name">{g.patiente?.prenom} {g.patiente?.nom}</div><div className="pat-info__sub">DPA: {g.date_terme_prevu||'—'}</div></div>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  {g.grossesse_a_risque&&<span className="badge badge-amber">⚠️</span>}
                  <span className={`badge ${g.statut==='en_cours'?'badge-teal':g.statut==='terminee'?'badge-green':'badge-gray'}`}>{g.statut}</span>
                </div>
              </div>
              <div className="sf-card__body">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:12,fontSize:12}}>
                  <div style={{background:'#fdf2f8',borderRadius:6,padding:'5px 8px'}}><div style={{fontSize:10,color:'#9ca3af'}}>SA</div><strong>{g.semaines_amenorrhee||0}</strong></div>
                  <div style={{background:'#fdf2f8',borderRadius:6,padding:'5px 8px'}}><div style={{fontSize:10,color:'#9ca3af'}}>TYPE</div><strong>{g.type_grossesse}</strong></div>
                  <div style={{background:'#fdf2f8',borderRadius:6,padding:'5px 8px'}}><div style={{fontSize:10,color:'#9ca3af'}}>FŒTUS</div><strong>{g.nombre_foetus}</strong></div>
                  <div style={{background:'#fdf2f8',borderRadius:6,padding:'5px 8px'}}><div style={{fontSize:10,color:'#9ca3af'}}>Rh</div><strong>{g.rhesus?g.rhesus[0].toUpperCase():'—'}</strong></div>
                </div>
                <div className="pregnancy-bar"><div className="pregnancy-bar__fill" style={{width:pct+'%',background:g.grossesse_a_risque?'#f87171':undefined}}/></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#9ca3af',marginTop:3}}>
                  <span>Semaine {g.semaines_amenorrhee||0}/41</span>
                  {restant!==null&&<span>J-{restant} avant terme</span>}
                </div>
                {g.statut==='en_cours'&&(
                  <div style={{display:'flex',gap:8,marginTop:12}}>
                    <button className="btn btn-outline btn-sm" style={{flex:1}}>📋 Consultation</button>
                    <button className="btn btn-primary btn-sm" onClick={()=>{setSelected(g);setModal('accouchement');}}>🏥 Accouchement</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {modal==='accouchement'&&selected&&<ModalAccouchement grossesse={selected} onClose={()=>{setModal(null);setSelected(null);}} onSaved={()=>{load();showMsg('✅ Accouchement et dossier bébé enregistrés !');}}/>}
    </div>
  );
}