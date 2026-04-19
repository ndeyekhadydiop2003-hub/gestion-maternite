import { useState } from "react";
import { Folder, Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, SectionHeader } from "../components/PatientRow";
import Modal from "../components/Modal";
import { dossiers } from "../data/mockData";

function StatutBadge({ statut }) {
  if (statut === "urgent") return <span className="tag-urgent">Urgent</span>;
  if (statut === "libre")  return <span className="tag-libre">Libre</span>;
  return <span className="badge badge-green">Actif</span>;
}

export default function Dossiers() {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [page, setPage]         = useState(1);
  const PER_PAGE = 6;

  const filtered = dossiers.filter(d =>
    d.nom.toLowerCase().includes(search.toLowerCase()) ||
    d.diagnostic.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Folder size={22} /> Dossiers patients</div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nouveau dossier
        </button>
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ display:"flex", gap:12, marginBottom:20, alignItems:"center" }}>
          <div className="search-wrap" style={{ flex:1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="btn btn-outline btn-sm">Filtrer</button>
          <button className="btn btn-outline btn-sm">Exporter</button>
        </div>

        {/* Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Diagnostic</th>
              <th>Séances</th>
              <th>Prochaine</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(d => (
              <tr key={d.id}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar initiales={d.initiales} size="sm" />
                    <span style={{ fontWeight:700 }}>{d.nom}</span>
                  </div>
                </td>
                <td style={{ color:"var(--text-medium)", fontSize:"0.85rem" }}>{d.diagnostic}</td>
                <td>
                  <span className="badge badge-primary">{d.seances} séances</span>
                </td>
                <td style={{ fontSize:"0.85rem", fontWeight:600 }}>{d.prochaine}</td>
                <td><StatutBadge statut={d.statut} /></td>
                <td>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn-icon" title="Voir" onClick={() => setSelected(d)}><Eye size={14}/></button>
                    <button className="btn-icon" title="Modifier"><Edit size={14}/></button>
                    <button className="btn-icon" title="Supprimer" style={{ color:"var(--red)" }}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">
            {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} de {filtered.length} dossiers
          </span>
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn-icon" disabled={page===1} onClick={() => setPage(p=>p-1)}><ChevronLeft size={15}/></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n => (
              <button key={n}
                className={n===page ? "btn btn-primary btn-sm" : "btn-icon"}
                style={n===page ? { borderRadius:8, padding:"5px 10px" } : {}}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button className="btn-icon" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}><ChevronRight size={15}/></button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Dossier — ${selected?.nom}`} width={560}>
        {selected && (
          <>
            <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20, padding:16, background:"var(--bg)", borderRadius:12 }}>
              <Avatar initiales={selected.initiales} size="lg" />
              <div>
                <div style={{ fontWeight:800, fontSize:"1.05rem" }}>{selected.nom}</div>
                <div style={{ color:"var(--text-medium)", fontSize:"0.85rem", marginTop:3 }}>{selected.diagnostic}</div>
                <div style={{ marginTop:6 }}><StatutBadge statut={selected.statut} /></div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
              {[
                { label:"Nombre de séances", val: `${selected.seances} séances` },
                { label:"Prochaine séance",  val: selected.prochaine },
                { label:"Statut du dossier", val: selected.statut },
                { label:"Dernière mise à jour", val: "23 Avr. 2024" },
              ].map(({label,val}) => (
                <div key={label} style={{ background:"var(--bg)", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-medium)", marginBottom:4 }}>{label}</div>
                  <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{val}</div>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Notes cliniques</label>
              <textarea className="form-textarea" defaultValue="Aucune note pour le moment." />
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-primary"><Edit size={14}/> Modifier le dossier</button>
            </div>
          </>
        )}
      </Modal>

      {/* Nouveau dossier Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouveau dossier patient">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input className="form-input" placeholder="Prénom" />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input className="form-input" placeholder="Nom" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Diagnostic</label>
          <input className="form-input" placeholder="Ex: Dépression, Burn-out, TCC..." />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group">
            <label className="form-label">Date de naissance</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select className="form-select">
              <option>Actif</option><option>Urgent</option><option>Libre</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes initiales</label>
          <textarea className="form-textarea" placeholder="Notes d'admission..." />
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
          <button className="btn btn-primary" onClick={() => setShowNew(false)}>
            <Plus size={14}/> Créer le dossier
          </button>
        </div>
      </Modal>
    </div>
  );
}
