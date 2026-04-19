import { Calendar, Activity, MessageSquare, Clock, ArrowRight, LayoutDashboard } from "lucide-react";
import { PatientRow, SectionHeader } from "../components/PatientRow";
import { patients } from "../data/mockData";

const stats = [
  { num: 7,  label: "Rendez-vous aujourd'hui", icon: Calendar,       bg: "linear-gradient(135deg, #b088f9, #8b5cf6)" },
  { num: 4,  label: "Séances en cours",         icon: Activity,       bg: "linear-gradient(135deg, #f472b6, #ec4899)" },
  { num: 3,  label: "Séances à suivre",         icon: Clock,          bg: "linear-gradient(135deg, #fb923c, #f97316)" },
  { num: 6,  label: "Nouveaux messages",        icon: MessageSquare,  bg: "linear-gradient(135deg, #818cf8, #6366f1)" },
];

export default function Dashboard({ onNavigate }) {
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title"><LayoutDashboard size={22} /> Dashboard</div>
          <div style={{ color: "var(--text-medium)", fontSize: "0.88rem", marginTop: 4 }}>
            Mardi 23 Avril 2024 — Bonjour Antoine ! 👋
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("agenda")}>
          <Calendar size={16} /> Accéder à l'agenda
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map(({ num, label, icon: Icon, bg }) => (
          <div key={label} className="stat-card" style={{ background: bg }}>
            <div className="stat-icon"><Icon size={24} color="white" /></div>
            <div>
              <div className="stat-num">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid-2">
        {/* Patients prioritaires */}
        <div className="card">
          <SectionHeader title="Patients prioritaires" icon={Activity} onMore={() => onNavigate("suivis")} />
          {patients.slice(0, 5).map(p => (
            <PatientRow key={p.id} patient={p} />
          ))}
        </div>

        {/* Messages récents */}
        <div className="card">
          <SectionHeader title="Messages récents" icon={MessageSquare} onMore={() => onNavigate("messages")}>
            <span className="badge badge-rose">6 non lus</span>
          </SectionHeader>
          {[
            { id:1, initiales:"CL", nom:"Céline Lambert",    apercu:"Bonjour Antoine, je souhaiter...", heure:"15:30" },
            { id:2, initiales:"PL", nom:"Dr Pierre Lambert", apercu:"Dossier IntdOut",                  heure:"urgent" },
            { id:3, initiales:"MD", nom:"Mélanie Dubois",    apercu:"Reener 1H0235",                    heure:"urgent" },
            { id:4, initiales:"NG", nom:"Nicolas Girard",    apercu:"Dossier shtoalae",                 heure:"urgent" },
          ].map(m => (
            <div key={m.id} className="patient-row">
              <div className="avatar">{m.initiales}</div>
              <div className="patient-info">
                <div className="patient-name">{m.nom}</div>
                <div className="patient-sub">{m.apercu}</div>
              </div>
              {m.heure === "urgent"
                ? <span className="tag-urgent" style={{ fontSize: "0.72rem" }}>Urgent</span>
                : <span className="tag-time" style={{ fontSize: "0.72rem" }}>{m.heure}</span>}
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => onNavigate("messages")}>
              <MessageSquare size={15} /> Voir les messages <span className="badge" style={{ background:"rgba(255,255,255,0.3)", color:"white" }}>5</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
