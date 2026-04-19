import { useState } from "react";
import { Activity, Search, ChevronRight, Clock, Plus } from "lucide-react";
import { Avatar, StatusTag, SectionHeader } from "../components/PatientRow";
import Modal from "../components/Modal";
import { patients } from "../data/mockData";

export default function Suivis() {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [filter, setFilter]     = useState("Tous");

  const filtered = patients.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous" ? true :
      filter === "Urgents" ? p.statut === "urgent" :
      filter === "À rappeler" ? p.statut === "rappeler" :
      p.statut === "demain";
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Activity size={22} /> Séances à suivre</div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nouveau suivi
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["Tous","Urgents","À rappeler","Demain"].map(f => (
          <button key={f}
            className={filter===f ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => setFilter(f)}
          >{f}</button>
        ))}
      </div>

      <div className="grid-2">
        {/* Liste principale */}
        <div className="card">
          <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
            <div className="search-wrap" style={{ flex:1 }}>
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* En-tête sélection */}
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 12px", background:"var(--bg)", borderRadius:10, marginBottom:12,
            cursor:"pointer", border:"1.5px solid var(--border)"
          }}>
            <Avatar initiales="CL" size="sm" />
            <span style={{ flex:1, fontWeight:700, fontSize:"0.88rem" }}>Céline Lambert</span>
            <ChevronRight size={15} color="var(--text-medium)" />
          </div>

          {filtered.map(p => (
            <div
              key={p.id}
              className="patient-row"
              style={{ cursor:"pointer" }}
              onClick={() => setSelected(p)}
            >
              <Avatar initiales={p.initiales} size="sm" />
              <div className="patient-info">
                <div className="patient-name">{p.nom}</div>
                <div className="patient-sub">{p.motif}</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <StatusTag statut={p.statut} heure={p.heure} date={p.date} />
                <button className="btn-icon" style={{ width:28, height:28 }}><ChevronRight size={13}/></button>
              </div>
            </div>
          ))}

          <div className="pagination">
            <span className="pagination-info">1–{filtered.length} de 248</span>
            <button className="btn btn-outline btn-sm">Gérer les suivis</button>
          </div>
        </div>

        {/* Panel détail */}
        <div className="card">
          {selected ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, padding:14, background:"var(--bg)", borderRadius:12 }}>
                <Avatar initiales={selected.initiales} size="lg" />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:"1rem" }}>{selected.nom}</div>
                  <div style={{ fontSize:"0.8rem", color:"var(--text-medium)", marginTop:2 }}>{selected.motif}</div>
                </div>
                <StatusTag statut={selected.statut} heure={selected.heure} date={selected.date} />
              </div>

              <div className="section-label">Informations du suivi</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                {[
                  { label:"Statut", val: selected.statut },
                  { label:"Prochain RDV", val: selected.date || "Non planifié" },
                  { label:"Heure", val: selected.heure || "—" },
                  { label:"Séances totales", val: "12" },
                ].map(({label,val}) => (
                  <div key={label} style={{ background:"var(--bg)", borderRadius:10, padding:"10px 14px" }}>
                    <div style={{ fontSize:"0.72rem", color:"var(--text-medium)", marginBottom:2 }}>{label}</div>
                    <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{val}</div>
                  </div>
                ))}
              </div>

              <div className="section-label">Historique des séances</div>
              {[
                { date:"17 Avr.", note:"Séance productive. Patient plus serein.", duree:"55 min" },
                { date:"10 Avr.", note:"Discussion sur les mécanismes d'évitement.", duree:"50 min" },
                { date:"03 Avr.", note:"Bilan à 1 mois. Progrès notables.", duree:"60 min" },
              ].map((s,i) => (
                <div key={i} style={{ padding:"10px 0", borderBottom:"1px solid var(--border)", display:"flex", gap:12 }}>
                  <span className="badge badge-primary" style={{ minWidth:60, justifyContent:"center" }}>{s.date}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.85rem" }}>{s.note}</div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text-medium)", marginTop:3 }}>
                      <Clock size={10} style={{ display:"inline", marginRight:4 }} />{s.duree}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <button className="btn btn-primary" style={{ flex:1 }}>
                  <Plus size={14}/> Ajouter une note
                </button>
                <button className="btn btn-rose" style={{ flex:1 }}>Planifier RDV</button>
              </div>
            </>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:320, color:"var(--text-medium)" }}>
              <Activity size={48} style={{ opacity:0.2, marginBottom:12 }} />
              <div style={{ fontWeight:600 }}>Sélectionnez un patient</div>
              <div style={{ fontSize:"0.82rem", marginTop:4 }}>pour voir le détail du suivi</div>
            </div>
          )}
        </div>
      </div>

      {/* Nouveau suivi modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouveau suivi">
        <div className="form-group">
          <label className="form-label">Patient</label>
          <select className="form-select">
            <option value="">Sélectionner...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type de suivi</label>
          <select className="form-select">
            <option>Suivi thérapie individuelle</option>
            <option>Séance couple</option>
            <option>TCC</option>
            <option>Suivi burn-out</option>
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" /></div>
          <div className="form-group"><label className="form-label">Heure</label><input type="time" className="form-input" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Priorité</label>
          <select className="form-select">
            <option>Normal</option><option>Urgent</option><option>À rappeler</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" placeholder="Notes de séance..." />
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
          <button className="btn btn-primary" onClick={() => setShowNew(false)}><Plus size={14}/> Créer</button>
        </div>
      </Modal>
    </div>
  );
}
