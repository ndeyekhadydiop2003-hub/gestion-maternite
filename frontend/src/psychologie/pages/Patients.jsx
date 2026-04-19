import { useState } from "react";
import { Users, Search, Plus, Phone, Mail, Edit, Eye, Trash2 } from "lucide-react";
import { Avatar } from "../components/PatientRow";
import Modal from "../components/Modal";
import { patients } from "../data/mockData";

const fullPatients = patients.map((p, i) => ({
  ...p,
  email: `${p.nom.toLowerCase().replace(/\s/g, ".")}@email.com`,
  tel: `06 ${String(10+i).padStart(2,"0")} ${String(20+i).padStart(2,"0")} ${String(30+i).padStart(2,"0")} ${String(40+i).padStart(2,"0")}`,
  age: 28 + i * 3,
  dateInscription: `${i+1}/01/2024`,
}));

export default function Patients() {
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = fullPatients.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.motif.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Users size={22} /> Patients</div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nouveau patient
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Total patients", num: "248", color: "var(--primary)" },
          { label: "Actifs ce mois", num: "42",  color: "var(--green)" },
          { label: "Nouveaux",       num: "8",   color: "var(--rose)" },
          { label: "Urgents",        num: "4",   color: "var(--orange)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:"center", padding:16 }}>
            <div style={{ fontSize:"1.8rem", fontWeight:800, color:s.color, fontFamily:"Poppins" }}>{s.num}</div>
            <div style={{ fontSize:"0.82rem", color:"var(--text-medium)", marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          <div className="search-wrap" style={{ flex:1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline btn-sm">Filtrer</button>
          <button className="btn btn-outline btn-sm">Exporter</button>
        </div>

        {/* Grid patients */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              border: "1.5px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              background: "white",
              transition: "box-shadow 0.2s, transform 0.15s",
              cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow-hover)"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <Avatar initiales={p.initiales} size="lg" />
                <div>
                  <div style={{ fontWeight:800, fontSize:"0.95rem" }}>{p.nom}</div>
                  <div style={{ fontSize:"0.76rem", color:"var(--text-medium)" }}>{p.age} ans</div>
                </div>
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--text-medium)", marginBottom:10 }}>
                <div style={{ marginBottom:4 }}>📋 {p.motif}</div>
                <div style={{ marginBottom:4 }}>📅 Inscrit le {p.dateInscription}</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className="btn-icon" title="Voir" onClick={() => setSelected(p)}><Eye size={13}/></button>
                <button className="btn-icon" title="Appeler"><Phone size={13}/></button>
                <button className="btn-icon" title="Email"><Mail size={13}/></button>
                <button className="btn-icon" title="Modifier"><Edit size={13}/></button>
                <button className="btn-icon" title="Supprimer" style={{ color:"var(--red)", marginLeft:"auto" }}><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination" style={{ marginTop:20 }}>
          <span className="pagination-info">{filtered.length} patients affichés</span>
          <button className="btn btn-outline btn-sm">Voir tous les 248 →</button>
        </div>
      </div>

      {/* Fiche patient */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Fiche — ${selected?.nom}`} width={520}>
        {selected && (
          <>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <Avatar initiales={selected.initiales} size="lg" />
              <div style={{ fontWeight:800, fontSize:"1.1rem", marginTop:10 }}>{selected.nom}</div>
              <div style={{ color:"var(--text-medium)", fontSize:"0.85rem" }}>{selected.age} ans</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Motif",    val: selected.motif },
                { label:"Statut",   val: selected.statut },
                { label:"Email",    val: selected.email },
                { label:"Téléphone",val: selected.tel },
                { label:"Date inscription", val: selected.dateInscription },
                { label:"Prochain RDV",     val: selected.date || "Non planifié" },
              ].map(({label,val}) => (
                <div key={label} style={{ background:"var(--bg)", borderRadius:10, padding:"10px 14px" }}>
                  <div style={{ fontSize:"0.72rem", color:"var(--text-medium)", marginBottom:2 }}>{label}</div>
                  <div style={{ fontWeight:700, fontSize:"0.85rem" }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-rose"><Phone size={14}/> Appeler</button>
              <button className="btn btn-primary"><Edit size={14}/> Modifier</button>
            </div>
          </>
        )}
      </Modal>

      {/* Nouveau patient */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouveau patient">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" placeholder="Prénom" /></div>
          <div className="form-group"><label className="form-label">Nom</label><input className="form-input" placeholder="Nom" /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group"><label className="form-label">Date de naissance</label><input type="date" className="form-input" /></div>
          <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" placeholder="06..." /></div>
        </div>
        <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="email@..." /></div>
        <div className="form-group">
          <label className="form-label">Motif de consultation</label>
          <input className="form-input" placeholder="Ex: Dépression, Anxiété..." />
        </div>
        <div className="form-group">
          <label className="form-label">Notes initiales</label>
          <textarea className="form-textarea" placeholder="Première impression, contexte..." />
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
          <button className="btn btn-primary" onClick={() => setShowNew(false)}><Plus size={14}/> Ajouter le patient</button>
        </div>
      </Modal>
    </div>
  );
}
