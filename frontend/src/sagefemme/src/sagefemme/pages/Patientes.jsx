import React, { useState, useEffect } from 'react';
import { patientesAPI, grossessesAPI, consultationsAPI, sageFemmeAPI, planningAPI, infectiologieAPI, personnelAPI } from '../services/api';

function ModalGrossesse({ patiente, onClose, onSaved }) {
  const [form, setForm] = useState({ id_patient: patiente.id_patient, date_debut: new Date().toISOString().split('T')[0], date_terme_prevu: '', semaines_amenorrhee: '', nombre_foetus: 1, rhesus: '', grossesse_a_risque: false, type_grossesse: 'simple', statut: 'en_cours' });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const handleSave = async () => { setSaving(true); setError(''); try { await grossessesAPI.create(form); onSaved(); onClose(); } catch(e){ setError(e.message); } finally { setSaving(false); } };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-header"><span className="modal-title">🤰 Nouvelle grossesse — {patiente.prenom} {patiente.nom}</span><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="sf-alert sf-alert-error">{error}</div>}
          <div className="sf-form">
            <div className="sf-form-row">
              <div className="sf-field"><label>Date début</label><input type="date" value={form.date_debut} onChange={e=>set('date_debut',e.target.value)}/></div>
              <div className="sf-field"><label>Date terme prévue</label><input type="date" value={form.date_terme_prevu} onChange={e=>set('date_terme_prevu',e.target.value)}/></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Semaines d'aménorrhée</label><input type="number" value={form.semaines_amenorrhee} onChange={e=>set('semaines_amenorrhee',e.target.value)}/></div>
              <div className="sf-field"><label>Nombre de fœtus</label><input type="number" min="1" value={form.nombre_foetus} onChange={e=>set('nombre_foetus',e.target.value)}/></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Rhésus</label><select value={form.rhesus} onChange={e=>set('rhesus',e.target.value)}><option value="">—</option><option value="positif">Positif (+)</option><option value="negatif">Négatif (−)</option></select></div>
              <div className="sf-field"><label>Type</label><select value={form.type_grossesse} onChange={e=>set('type_grossesse',e.target.value)}><option value="simple">Simple</option><option value="gemellaire">Gémellaire</option><option value="multiple">Multiple</option></select></div>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={form.grossesse_a_risque} onChange={e=>set('grossesse_a_risque',e.target.checked)}/> ⚠️ Grossesse à risque</label>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-outline" onClick={onClose}>Annuler</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'⏳...':'💾 Créer la grossesse'}</button></div>
      </div>
    </div>
  );
}

function ModalConsultation({ patiente, onClose, onSaved }) {
  const [tab, setTab] = useState('consultation');
  const [grossesses, setGrossesses] = useState([]);
  const [gynecologues, setGynecologues] = useState([]);
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [form, setForm] = useState({
    id_patient: patiente.id_patient, id_grossesse: '',
    date_consultation: new Date().toISOString().split('T')[0],
    motif_consultation: '', poids: '', temperature: '', tension: '', observation: '', prochain_rdv: '',
    hauteur_uterine: '', bruit_coeur_foetal: '', mouvements_foetaux: '', gravite: '', parite: '', type_presentation: '',
    methode_contraceptive: '', desir_grossesse: '',
    type_infection: '', agent_pathogene: '', traitement_ATB: '', risque_neonatal: '', statut_resolution: '',
    transfert_gyneco: false, id_gyneco: '', motif_transfert: '',
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  useEffect(()=>{
    patientesAPI.grossesses(patiente.id_patient).then(d=>setGrossesses(Array.isArray(d)?d:(d.data||[]))).catch(()=>{});
    personnelAPI.list().then(d=>{
      const list=Array.isArray(d)?d:(d.data||[]);
      setGynecologues(list.filter(p=>p.utilisateur?.role_acces==='gynécologue'));
    }).catch(()=>{});
  },[patiente]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const c = await consultationsAPI.create({ id_patient:form.id_patient, id_grossesse:form.id_grossesse||null, date_consultation:form.date_consultation, motif_consultation:form.motif_consultation, poids:form.poids||null, temperature:form.temperature||null, tension:form.tension||null, observation:form.observation, prochain_rdv:form.prochain_rdv||null });
      const idC = c.id_consultation;
      if(form.hauteur_uterine||form.bruit_coeur_foetal||form.mouvements_foetaux)
        await sageFemmeAPI.create({ id_consultation:idC, id_grossesse:form.id_grossesse||null, hauteur_uterine:form.hauteur_uterine||null, bruit_coeur_foetal:form.bruit_coeur_foetal||null, mouvements_foetaux:form.mouvements_foetaux||null, gravite:form.gravite||null, parite:form.parite||null, type_presentation:form.type_presentation||null });
      if(form.methode_contraceptive||form.desir_grossesse)
        await planningAPI.create({ id_consultation:idC, methode_contraceptive:form.methode_contraceptive||null, desir_grossesse:form.desir_grossesse||null, date_prochaine_visite:form.prochain_rdv||null });
      if(form.type_infection||form.agent_pathogene)
        await infectiologieAPI.create({ id_consultation:idC, type_infection:form.type_infection||null, agent_pathogene:form.agent_pathogene||null, traitement_ATB:form.traitement_ATB||null, risque_neonatal:form.risque_neonatal||null, statut_resolution:form.statut_resolution||null });
      if(form.transfert_gyneco&&form.id_gyneco&&form.motif_transfert)
        await consultationsAPI.transfertGyneco(idC, { id_gyneco:form.id_gyneco, motif_transfert:form.motif_transfert });
      onSaved(); onClose();
    } catch(e){ setError(e.message); } finally { setSaving(false); }
  };

  const TABS = [
    {id:'consultation',label:'📋 Consultation'},
    {id:'sagefemme',label:'🤰 Suivi SF'},
    {id:'planning',label:'📅 Planning'},
    {id:'infectio',label:'🦠 Infectiologie'},
    {id:'transfert',label:'🏥 Transfert gynéco'},
  ];

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header"><span className="modal-title">📋 Nouvelle consultation — {patiente.prenom} {patiente.nom}</span><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="sf-alert sf-alert-error">{error}</div>}
          <div className="sf-tabs">{TABS.map(t=><button key={t.id} className={'sf-tab'+(tab===t.id?' active':'')} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>

          {tab==='consultation'&&<div className="sf-form">
            <div className="sf-form-row">
              <div className="sf-field"><label>Date consultation</label><input type="date" value={form.date_consultation} onChange={e=>set('date_consultation',e.target.value)}/></div>
              <div className="sf-field"><label>Grossesse liée</label><select value={form.id_grossesse} onChange={e=>set('id_grossesse',e.target.value)}><option value="">— Aucune —</option>{grossesses.map(g=><option key={g.id_grossesse} value={g.id_grossesse}>{g.semaines_amenorrhee||0} SA — {g.statut}</option>)}</select></div>
            </div>
            <div className="sf-field"><label>Motif</label><input value={form.motif_consultation} onChange={e=>set('motif_consultation',e.target.value)} placeholder="Ex: Visite de routine..."/></div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Poids (kg)</label><input type="number" step="0.1" value={form.poids} onChange={e=>set('poids',e.target.value)} placeholder="68.5"/></div>
              <div className="sf-field"><label>Température (°C)</label><input type="number" step="0.1" value={form.temperature} onChange={e=>set('temperature',e.target.value)} placeholder="37.2"/></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Tension artérielle</label><input value={form.tension} onChange={e=>set('tension',e.target.value)} placeholder="12/8"/></div>
              <div className="sf-field"><label>Prochain RDV recommandé</label><input type="date" value={form.prochain_rdv} onChange={e=>set('prochain_rdv',e.target.value)}/></div>
            </div>
            <div className="sf-alert sf-alert-info" style={{fontSize:12}}>ℹ️ La date de prochain RDV sera transmise à la secrétaire pour créer le rendez-vous officiel.</div>
            <div className="sf-field"><label>Observation</label><textarea value={form.observation} onChange={e=>set('observation',e.target.value)} placeholder="Observations cliniques..."/></div>
          </div>}

          {tab==='sagefemme'&&<div className="sf-form">
            <div className="sf-form-row">
              <div className="sf-field"><label>Hauteur utérine (cm)</label><input type="number" step="0.1" value={form.hauteur_uterine} onChange={e=>set('hauteur_uterine',e.target.value)}/></div>
              <div className="sf-field"><label>Bruit cœur fœtal</label><input value={form.bruit_coeur_foetal} onChange={e=>set('bruit_coeur_foetal',e.target.value)} placeholder="140 bpm"/></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Mouvements fœtaux</label><select value={form.mouvements_foetaux} onChange={e=>set('mouvements_foetaux',e.target.value)}><option value="">—</option><option value="absents">Absents</option><option value="faibles">Faibles</option><option value="normaux">Normaux</option><option value="actifs">Actifs</option></select></div>
              <div className="sf-field"><label>Présentation</label><input value={form.type_presentation} onChange={e=>set('type_presentation',e.target.value)} placeholder="Céphalique, siège..."/></div>
            </div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Gravité</label><input type="number" value={form.gravite} onChange={e=>set('gravite',e.target.value)}/></div>
              <div className="sf-field"><label>Parité</label><input type="number" value={form.parite} onChange={e=>set('parite',e.target.value)}/></div>
            </div>
          </div>}

          {tab==='planning'&&<div className="sf-form">
            <div className="sf-field"><label>Méthode contraceptive</label><input value={form.methode_contraceptive} onChange={e=>set('methode_contraceptive',e.target.value)} placeholder="Pilule, DIU, implant..."/></div>
            <div className="sf-field"><label>Désir de grossesse</label><select value={form.desir_grossesse} onChange={e=>set('desir_grossesse',e.target.value)}><option value="">—</option><option value="oui">Oui</option><option value="non">Non</option><option value="indecis">Indécis</option></select></div>
            <div className="sf-alert sf-alert-info" style={{fontSize:12}}>ℹ️ Planning accessible aussi au gynécologue.</div>
          </div>}

          {tab==='infectio'&&<div className="sf-form">
            <div className="sf-form-row">
              <div className="sf-field"><label>Type infection</label><input value={form.type_infection} onChange={e=>set('type_infection',e.target.value)} placeholder="Urinaire, vaginale..."/></div>
              <div className="sf-field"><label>Agent pathogène</label><input value={form.agent_pathogene} onChange={e=>set('agent_pathogene',e.target.value)} placeholder="E.coli, Streptocoque B..."/></div>
            </div>
            <div className="sf-field"><label>Traitement ATB</label><textarea value={form.traitement_ATB} onChange={e=>set('traitement_ATB',e.target.value)} placeholder="Antibiotique, posologie, durée..."/></div>
            <div className="sf-form-row">
              <div className="sf-field"><label>Risque néonatal</label><select value={form.risque_neonatal} onChange={e=>set('risque_neonatal',e.target.value)}><option value="">—</option><option value="faible">Faible</option><option value="modere">Modéré</option><option value="eleve">Élevé</option></select></div>
              <div className="sf-field"><label>Statut résolution</label><select value={form.statut_resolution} onChange={e=>set('statut_resolution',e.target.value)}><option value="">—</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option><option value="chronique">Chronique</option><option value="echec">Échec</option></select></div>
            </div>
          </div>}

          {tab==='transfert'&&<div className="sf-form">
            <div className="sf-alert sf-alert-warning">⚠️ En cas de complication, vous pouvez transférer ce dossier vers un gynécologue. Le gynécologue recevra une notification et accèdera au dossier complet.</div>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',fontWeight:600,color:'#b91c1c'}}>
              <input type="checkbox" checked={form.transfert_gyneco} onChange={e=>set('transfert_gyneco',e.target.checked)}/>
              🏥 Transférer ce dossier vers un gynécologue
            </label>
            {form.transfert_gyneco&&<>
              <div className="sf-field"><label>Gynécologue destinataire</label>
                <select value={form.id_gyneco} onChange={e=>set('id_gyneco',e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {gynecologues.map(g=><option key={g.id_personnel} value={g.id_personnel}>Dr. {g.prenom} {g.nom}</option>)}
                </select>
              </div>
              <div className="sf-field"><label>Motif du transfert — Décrire la complication</label>
                <textarea value={form.motif_transfert} onChange={e=>set('motif_transfert',e.target.value)} placeholder="Ex: Prééclampsie, saignements, placenta praevia..." style={{minHeight:90}}/>
              </div>
              <div className="sf-alert sf-alert-info" style={{fontSize:12}}>⚡ Le gynécologue recevra : dossier patiente, grossesse, consultations, examens, infectiologie.</div>
            </>}
          </div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'⏳ Enregistrement...':'💾 Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Patientes() {
  const [patientes, setPatientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => patientesAPI.list().then(d=>setPatientes(Array.isArray(d)?d:(d.data||[]))).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const filtered = patientes.filter(p=>`${p.nom} ${p.prenom} ${p.telephone||''}`.toLowerCase().includes(search.toLowerCase()));

  const openDossier = async (p) => {
    setSelected(p);
    const [g,c,a] = await Promise.all([
      patientesAPI.grossesses(p.id_patient).catch(()=>[]),
      patientesAPI.consultations(p.id_patient).catch(()=>[]),
      patientesAPI.antecedents(p.id_patient).catch(()=>[]),
    ]);
    setDetail({ grossesses:Array.isArray(g)?g:(g.data||[]), consultations:Array.isArray(c)?c:(c.data||[]), antecedents:Array.isArray(a)?a:(a.data||[]) });
  };

  const showMsg = (m) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };

  if(loading) return <div className="sf-loading"><div className="sf-spinner"/></div>;

  if(selected&&detail) return (
    <div>
      {msg&&<div className="sf-alert sf-alert-success" style={{marginBottom:14}}>{msg}</div>}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
        <button className="btn btn-outline btn-sm" onClick={()=>{setSelected(null);setDetail(null);}}>← Retour</button>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'#374151'}}>Dossier — {selected.prenom} {selected.nom}</h2>
        <span className={`badge ${selected.statut==='active'?'badge-green':'badge-gray'}`}>{selected.statut}</span>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button className="btn btn-outline btn-sm" onClick={()=>setModal('grossesse')}>🤰 + Grossesse</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal('consultation')}>📋 + Consultation</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:16}}>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">👤 Identité</span></div>
          <div className="sf-card__body" style={{fontSize:13,display:'flex',flexDirection:'column',gap:6}}>
            <div><strong>Nom:</strong> {selected.prenom} {selected.nom}</div>
            <div><strong>Naissance:</strong> {selected.date_naissance}</div>
            <div><strong>Situation:</strong> {selected.situation_matrimoniale||'—'}</div>
            <div><strong>Tél:</strong> {selected.telephone||'—'}</div>
            <div><strong>Groupe sg:</strong> <span className="badge badge-pink">{selected.groupe_sanguin||'—'}</span></div>
            <div><strong>Notes:</strong> <span style={{color:'#9ca3af'}}>{selected.notes_cliniques||'—'}</span></div>
          </div>
        </div>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">🤰 Grossesses ({detail.grossesses.length})</span></div>
          <div style={{padding:'8px 0',maxHeight:200,overflowY:'auto'}}>
            {detail.grossesses.length===0&&<div className="sf-empty"><div className="sf-empty__text">Aucune grossesse</div></div>}
            {detail.grossesses.map(g=>(
              <div key={g.id_grossesse} style={{padding:'8px 14px',borderBottom:'1px solid #fce7f3'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:13,fontWeight:600}}>{g.semaines_amenorrhee||0} SA</span>
                  <span className={`badge ${g.grossesse_a_risque?'badge-amber':'badge-green'}`}>{g.grossesse_a_risque?'⚠️ Risque':'Normal'}</span>
                </div>
                <div style={{fontSize:11,color:'#9ca3af',marginTop:3}}>DPA: {g.date_terme_prevu||'—'} · {g.statut}</div>
                <div className="pregnancy-bar"><div className="pregnancy-bar__fill" style={{width:Math.min(((g.semaines_amenorrhee||0)/41)*100,100)+'%'}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="sf-card">
          <div className="sf-card__header"><span className="sf-card__title">📋 Antécédents ({detail.antecedents.length})</span></div>
          <div style={{padding:'8px 14px',maxHeight:200,overflowY:'auto'}}>
            {detail.antecedents.length===0&&<div className="sf-empty"><div className="sf-empty__text">Aucun antécédent</div></div>}
            {detail.antecedents.map(a=>(
              <div key={a.id_antecedent} style={{marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:600}}>{a.categorie}</div>
                <div style={{fontSize:12,color:'#6b7280'}}>{a.description}</div>
                <span className={`badge ${a.gravite==='critique'?'badge-red':a.gravite==='grave'?'badge-amber':'badge-teal'}`} style={{fontSize:10}}>{a.gravite}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sf-card">
        <div className="sf-card__header"><span className="sf-card__title">📅 Consultations ({detail.consultations.length})</span></div>
        <div className="sf-table-wrap">
          <table className="sf-table">
            <thead><tr><th>Date</th><th>Motif</th><th>Poids</th><th>Tension</th><th>Prochain RDV</th><th>Transfert</th></tr></thead>
            <tbody>
              {detail.consultations.length===0&&<tr><td colSpan={6}><div className="sf-empty"><div className="sf-empty__text">Aucune consultation</div></div></td></tr>}
              {detail.consultations.map(c=>(
                <tr key={c.id_consultation}>
                  <td><strong>{c.date_consultation}</strong></td>
                  <td>{c.motif_consultation||'—'}</td>
                  <td>{c.poids?c.poids+' kg':'—'}</td>
                  <td>{c.tension||'—'}</td>
                  <td>{c.prochain_rdv?<span className="badge badge-blue">{c.prochain_rdv}</span>:'—'}</td>
                  <td>{c.transfert_gyneco?<span className="badge badge-amber">⚡ Transféré</span>:'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal==='grossesse'&&<ModalGrossesse patiente={selected} onClose={()=>setModal(null)} onSaved={()=>{openDossier(selected);showMsg('✅ Grossesse créée avec succès !');}}/>}
      {modal==='consultation'&&<ModalConsultation patiente={selected} onClose={()=>setModal(null)} onSaved={()=>{openDossier(selected);showMsg('✅ Consultation enregistrée !');}}/>}
    </div>
  );

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#374151'}}>👩 Dossiers Patientes</h2>
        <div className="sf-search"><span className="sf-search__icon">🔍</span><input placeholder="Rechercher une patiente..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>
      <div className="sf-alert sf-alert-info" style={{marginBottom:14,fontSize:12}}>ℹ️ Les patientes sont enregistrées par la secrétaire. Vous pouvez créer des grossesses et des consultations médicales.</div>
      <div className="sf-card">
        <div className="sf-table-wrap">
          <table className="sf-table">
            <thead><tr><th>Patiente</th><th>Naissance</th><th>Groupe sg.</th><th>Situation</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={6}><div className="sf-empty"><div className="sf-empty__icon">🔍</div><div className="sf-empty__text">Aucune patiente trouvée</div></div></td></tr>}
              {filtered.map(p=>(
                <tr key={p.id_patient}>
                  <td><div className="pat-info"><div className="pat-avatar">{p.nom?.[0]}{p.prenom?.[0]}</div><div><div className="pat-info__name">{p.prenom} {p.nom}</div><div className="pat-info__sub">{p.telephone}</div></div></div></td>
                  <td>{p.date_naissance}</td>
                  <td><span className="badge badge-pink">{p.groupe_sanguin||'—'}</span></td>
                  <td>{p.situation_matrimoniale||'—'}</td>
                  <td><span className={`badge ${p.statut==='active'?'badge-green':'badge-gray'}`}>{p.statut}</span></td>
                  <td><button className="btn btn-primary btn-sm" onClick={()=>openDossier(p)}>📂 Dossier</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}