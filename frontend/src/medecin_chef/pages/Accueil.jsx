import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Users, Activity, FileText, BarChart2, User } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

function Sparkline({ color, points = "0,20 10,15 20,18 30,10 40,14 50,8 60,12" }) {
  return (
    <svg width="65" height="28" viewBox="0 0 70 30" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const activites = [
  {
    icon: <CheckSquare size={20} color="#d81bb5" />,
    bg: "#fce7f3", border: "#fbcfe8",
    label: "Validation des dossiers",
    desc: "Revue et signature des dossiers médicaux en attente de validation.",
  },
  {
    icon: <Users size={20} color="#7c3aed" />,
    bg: "#f3e8ff", border: "#ddd6fe",
    label: "Gestion du personnel",
    desc: "Supervision de l'équipe médicale, plannings et performances.",
  },
  {
    icon: <FileText size={20} color="#0891b2" />,
    bg: "#e0f2fe", border: "#bae6fd",
    label: "Dossiers médicaux",
    desc: "Consultation et recherche de l'historique médical des patientes.",
  },
  {
    icon: <BarChart2 size={20} color="#059669" />,
    bg: "#d1fae5", border: "#a7f3d0",
    label: "Rapports & statistiques",
    desc: "Indicateurs clés du service, tableaux de bord et analyses.",
  },
  {
    icon: <User size={20} color="#ea580c" />,
    bg: "#fff7ed", border: "#fed7aa",
    label: "Mon compte",
    desc: "Gestion du profil, mot de passe et préférences personnelles.",
  },
];

const checklist = [
  { num: 1, text: "Valider les dossiers en attente de signature" },
  { num: 2, text: "Superviser les consultations du jour" },
  { num: 3, text: "Vérifier les rapports d'activité" },
  { num: 4, text: "Contrôler la disponibilité du personnel" },
  { num: 5, text: "Mettre à jour les protocoles médicaux" },
];

export default function Accueil() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ dossiers: 0, personnel: 0, occupation: 0 });
  const [checked, setChecked] = useState({});
  const toggleCheck = (i) => setChecked(c => ({ ...c, [i]: !c[i] }));
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    const h = { Accept: "application/json", Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/consultations`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => {
      const arr = Array.isArray(d) ? d : d.data || [];
      setStats(prev => ({ ...prev, dossiers: arr.length }));
    }).catch(() => {});
    fetch(`${API}/personnel`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => {
      const arr = Array.isArray(d) ? d : d.data || [];
      setStats(prev => ({ ...prev, personnel: arr.length }));
    }).catch(() => {});
    fetch(`${API}/lits`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => {
      const arr = Array.isArray(d) ? d : d.data || [];
      const occupes = arr.filter(l => l.est_occupe).length;
      const taux = arr.length > 0 ? Math.round((occupes / arr.length) * 100) : 0;
      setStats(prev => ({ ...prev, occupation: taux }));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: "Dossiers à valider",  value: stats.dossiers,         sub: "En attente de signature", icon: <CheckSquare size={16} color="#d81bb5" />, bg: "#fce7f3", spark: "#d81bb5" },
    { label: "Personnel en service", value: stats.personnel,        sub: "Actifs aujourd'hui",       icon: <Users size={16} color="#7c3aed" />,       bg: "#f3e8ff", spark: "#7c3aed" },
    { label: "Taux d'occupation",   value: `${stats.occupation}%`, sub: "Des lits utilisés",        icon: <Activity size={16} color="#0284c7" />,     bg: "#dbeafe", spark: "#0284c7" },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      
      BONJOUR
      <div style={{ background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)", borderRadius: 16, padding: "20px 28px", marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#d81bb5", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Espace Médecin Chef</div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Bonjour, {user.login || "Dr. Diallo"} 
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{today.charAt(0).toUpperCase() + today.slice(1)}</p>
      </div>
      
      {/* TITRE */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <span style={{ width: 4, height: 26, borderRadius: 8, background: "#d81bb5" }} />
        <h1 style={{ margin: 0, fontSize: "1.6rem" }}>Vue d'ensemble</h1>
        <span style={{ color: "#9ca3af", fontSize: 13 }}>Données du jour</span>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: "1px solid #ede8df", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{s.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 5 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>{s.sub}</div>
            <Sparkline color={s.spark} />
          </div>
        ))}
      </div>

      {/* BUREAU MÉDICAL */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ width: 4, height: 22, borderRadius: 8, background: "#d81bb5" }} />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>Bureau médical</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>

        {/* GAUCHE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Bannière */}
          <div style={{ background: "linear-gradient(135deg, #fdf2fb 0%, #f3e8ff 100%)", borderRadius: 20, padding: "24px 28px", border: "1px solid #f0c4eb", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(216,27,181,0.06)" }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fce7f3", color: "#d81bb5", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
              🏥 Direction médicale
            </span>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>
              Superviser et valider<br />les actes médicaux
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280", maxWidth: 340 }}>
              Assurez la qualité des soins, validez les dossiers et gérez l'équipe médicale en toute efficacité.
            </p>
            <button
              onClick={() => navigate("/medecin_chef/valider-dossiers")}
              style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.35)" }}
            >
              Valider les dossiers →
            </button>
          </div>

          {/* Activités — non cliquables */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {activites.map((a, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${a.border}`, borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, lineHeight: 1.5 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DROITE — Checklist */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>À superviser</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>Organisation du médecin chef</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checklist.map((item) => (
              <div key={item.num} onClick={() => toggleCheck(item.num)}
                style={{ display: "flex", alignItems: "center", gap: 12, background: checked[item.num] ? "#f0fdf4" : "#fdf8ff", borderRadius: 12, padding: "12px 16px", border: `1px solid ${checked[item.num] ? "#bbf7d0" : "#f0c4eb"}`, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: checked[item.num] ? "#dcfce7" : "#fce7f3", color: checked[item.num] ? "#15803d" : "#d81bb5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {checked[item.num] ? "✓" : item.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: checked[item.num] ? "#6b7280" : "#111827", textDecoration: checked[item.num] ? "line-through" : "none", transition: "all 0.2s" }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Progression</span>
              <span style={{ fontSize: 11, color: "#d81bb5", fontWeight: 700 }}>
                {Object.values(checked).filter(Boolean).length}/{checklist.length}
              </span>
            </div>
            <div style={{ height: 6, background: "#fce7f3", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", width: `${(Object.values(checked).filter(Boolean).length / checklist.length) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}