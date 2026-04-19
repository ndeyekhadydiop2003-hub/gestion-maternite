import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { PatientRow, SectionHeader, StatusTag } from "../components/PatientRow";
import Modal from "../components/Modal";
import { patients, rdvAujourdhui } from "../data/mockData";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const start = first === 0 ? 6 : first - 1;
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

export default function Agenda() {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("Tout");

  const cells = buildCalendar(year, month);
  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  const filteredPatients = filter === "Tout" ? patients :
    filter === "Suivi" ? patients.filter(p => p.statut === "rappeler" || p.statut === "urgent") :
    patients.filter(p => p.statut === "demain");

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Calendar size={22} /> Agenda</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Ajouter rendez-vous
        </button>
      </div>

      <div className="grid-2">
        {/* Calendrier */}
        <div className="card">
          {/* Nav mois */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <span style={{ fontFamily:"Poppins", fontWeight:700, fontSize:"1rem" }}>
              {MOIS[month]} {year}
            </span>
            <button className="btn-icon" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>

          {/* Jours header */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:6 }}>
            {JOURS.map(j => (
              <div key={j} style={{ textAlign:"center", fontSize:"0.72rem", fontWeight:700, color:"var(--text-medium)", padding:"4px 0" }}>{j}</div>
            ))}
          </div>

          {/* Cellules */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
            {cells.map((d, i) => {
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSel   = d === selected;
              return (
                <div
                  key={i}
                  onClick={() => d && setSelected(d)}
                  style={{
                    height: 36, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.85rem", fontWeight: isSel || isToday ? 700 : 500,
                    cursor: d ? "pointer" : "default",
                    background: isSel ? "linear-gradient(135deg,var(--primary),var(--primary-dark))" : isToday ? "var(--rose-light)" : "transparent",
                    color: isSel ? "white" : isToday ? "var(--rose-dark)" : d ? "var(--text-dark)" : "transparent",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (d && !isSel) e.currentTarget.style.background = "var(--border)"; }}
                  onMouseLeave={e => { if (d && !isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* RDV du jour */}
          <div className="divider" />
          <div className="section-label">Rendez-vous — {selected} {MOIS[month]}</div>
          {rdvAujourdhui.map((r, i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
              <span className="tag-time" style={{ minWidth:52, justifyContent:"center" }}><Clock size={11}/>{r.heure}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{r.nom}</div>
                <div style={{ fontSize:"0.76rem", color:"var(--text-medium)" }}>{r.motif}</div>
              </div>
              <span className="badge badge-gray">Salle {r.salle}</span>
            </div>
          ))}
        </div>

        {/* Patients prioritaires */}
        <div className="card">
          {/* Filtres */}
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["Tout","Suivi","Val 24"].map(f => (
              <button
                key={f}
                className={filter === f ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                onClick={() => setFilter(f)}
              >{f}</button>
            ))}
          </div>
          <SectionHeader title="Patients prioritaires" icon={User} />
          <div style={{ fontSize:"0.78rem", color:"var(--primary)", fontWeight:600, marginBottom:10, cursor:"pointer" }}>
            Vous déprogrez &gt;
          </div>
          {filteredPatients.map(p => (
            <PatientRow key={p.id} patient={p} />
          ))}
          <div style={{ marginTop:14 }}>
            <button className="btn btn-primary" style={{ width:"100%" }} onClick={() => setShowModal(true)}>
              <Plus size={15} /> Ajouter rendez-vous
            </button>
          </div>
        </div>
      </div>

      {/* Modal nouveau RDV */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau rendez-vous">
        <div className="form-group">
          <label className="form-label">Patient</label>
          <select className="form-select">
            <option value="">Sélectionner un patient...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" defaultValue="2024-04-23" />
          </div>
          <div className="form-group">
            <label className="form-label">Heure</label>
            <input type="time" className="form-input" defaultValue="09:00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Motif</label>
          <input type="text" className="form-input" placeholder="Ex: Suivi dépression, TCC..." />
        </div>
        <div className="form-group">
          <label className="form-label">Salle</label>
          <select className="form-select">
            <option>Salle A1</option><option>Salle A2</option><option>Salle A3</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" placeholder="Notes optionnelles..." />
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
          <button className="btn btn-primary" onClick={() => setShowModal(false)}>
            <Plus size={15} /> Créer le rendez-vous
          </button>
        </div>
      </Modal>
    </div>
  );
}
