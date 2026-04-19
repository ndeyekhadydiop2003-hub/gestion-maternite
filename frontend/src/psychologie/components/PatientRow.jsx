import { Clock, Bell, AlertCircle, Calendar, CheckCircle } from "lucide-react";

export function Avatar({ initiales, size = "md" }) {
  const sz = size === "sm" ? 34 : size === "lg" ? 48 : 40;
  const fs = size === "sm" ? "0.72rem" : size === "lg" ? "1rem" : "0.85rem";
  return (
    <div style={{
      width: sz, height: sz, borderRadius: "50%",
      background: "linear-gradient(135deg, var(--primary-light), var(--rose-light))",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: fs, color: "var(--primary-dark)",
      flexShrink: 0, border: "2px solid white",
      boxShadow: "0 2px 8px rgba(139,92,246,0.15)",
    }}>
      {initiales}
    </div>
  );
}

export function StatusTag({ statut, heure, date }) {
  if (statut === "rappeler") return (
    <div style={{ display: "flex", gap: 6 }}>
      <span className="tag-rappeler"><Bell size={11} /> À rappeler</span>
      {heure && <span className="tag-time"><Clock size={11} /> {heure}</span>}
    </div>
  );
  if (statut === "urgent") return <span className="tag-urgent"><AlertCircle size={11} /> Urgent</span>;
  if (statut === "demain") return (
    <div style={{ display: "flex", gap: 6 }}>
      <span className="tag-demain"><Calendar size={11} /> {date || "Demain"}</span>
      {heure && <span className="tag-time"><Clock size={11} /> {heure}</span>}
    </div>
  );
  if (statut === "libre") return <span className="tag-libre"><CheckCircle size={11} /> Libre</span>;
  if (statut === "normal" && date) return (
    <div style={{ display: "flex", gap: 6 }}>
      <span className="tag-demain"><Calendar size={11} /> {date}</span>
      {heure && <span className="tag-time"><Clock size={11} /> {heure}</span>}
    </div>
  );
  return null;
}

export function PatientRow({ patient, onAction }) {
  return (
    <div className="patient-row">
      <Avatar initiales={patient.initiales} />
      <div className="patient-info">
        <div className="patient-name">{patient.nom}</div>
        <div className="patient-sub">{patient.motif}</div>
      </div>
      <div className="patient-actions">
        <StatusTag statut={patient.statut} heure={patient.heure} date={patient.date} />
        {onAction && (
          <button className="btn-icon" onClick={() => onAction(patient)} title="Voir le dossier">
            <span style={{ fontSize: "0.78rem" }}>››</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({ title, icon: Icon, count, onMore, children }) {
  return (
    <div className="card-header">
      <div className="card-title">
        {Icon && <Icon size={18} />}
        {title}
        {count !== undefined && (
          <span className="badge badge-primary" style={{ fontSize: "0.72rem" }}>{count}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {children}
        {onMore && <button className="btn btn-outline btn-sm" onClick={onMore}>Voir tout</button>}
      </div>
    </div>
  );
}
