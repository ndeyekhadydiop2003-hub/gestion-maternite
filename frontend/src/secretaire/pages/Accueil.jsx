import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Activity, UserPlus, Calendar, BedDouble, FileText, User } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

function Sparkline({ color, points = "0,20 10,15 20,18 30,10 40,14 50,8 60,12" }) {
  return (
    <svg width="65" height="28" viewBox="0 0 70 30" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function compareHier(today, yesterday) {
  today = Number(today || 0);
  yesterday = Number(yesterday || 0);
  if (yesterday === 0) {
    if (today === 0) return { text: "0%", color: "#9ca3af" };
    return { text: "+100%", color: "#16a34a" };
  }
  const diff = today - yesterday;
  const percent = Math.round((diff / yesterday) * 100);
  return {
    text: `${percent > 0 ? "+" : ""}${percent}%`,
    color: percent > 0 ? "#16a34a" : percent < 0 ? "#dc2626" : "#9ca3af",
  };
}

export default function Accueil() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState({});
  const toggleCheck = (i) => setChecked(c => ({ ...c, [i]: !c[i] }));

  useEffect(() => {
    const headers = { Accept: "application/json", Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/dashboard/stats`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data || { total_patientes: 0, total_patientes_hier: 0, total_hospitalisees: 0, rdv_aujourdhui: 0, rdv_hier: 0 }))
      .catch(() => setStats({ total_patientes: 0, total_patientes_hier: 0, total_hospitalisees: 0, rdv_aujourdhui: 0, rdv_hier: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const v = (key) => (loading ? "..." : stats?.[key] ?? 0);
  const patientTrend = compareHier(stats?.total_patientes, stats?.total_patientes_hier);
  const rdvTrend = compareHier(stats?.rdv_aujourdhui, stats?.rdv_hier);

  const statCards = [
    {
      label: "Total Patientes", value: v("total_patientes"),
      trend: patientTrend.text, trendColor: patientTrend.color,
      sub: "Dossiers enregistrés", icon: <Users size={16} color="#d81bb5" />,
      bg: "#fce7f3", spark: "#d81bb5",
    },
    {
      label: "Hospitalisations", value: v("total_hospitalisees"),
      trend: null, sub: "Actives en cours",
      icon: <Heart size={16} color="#7c3aed" />,
      bg: "#f3e8ff", spark: "#7c3aed",
    },
    {
      label: "Rendez-vous", value: v("rdv_aujourdhui"),
      trend: rdvTrend.text, trendColor: rdvTrend.color,
      sub: "Aujourd'hui", icon: <Activity size={16} color="#0284c7" />,
      bg: "#dbeafe", spark: "#0284c7",
    },
  ];

  // ── Activités du secrétaire — non cliquables, informatifs
  const activites = [
    {
      icon: <UserPlus size={20} color="#d81bb5" />,
      bg: "#fce7f3", border: "#fbcfe8",
      label: "Enregistrement des patientes",
      desc: "Saisie des dossiers à l'accueil et mise à jour des informations personnelles.",
    },
    {
      icon: <Calendar size={20} color="#7c3aed" />,
      bg: "#f3e8ff", border: "#ddd6fe",
      label: "Gestion des rendez-vous",
      desc: "Planification, confirmation et suivi des rendez-vous médicaux.",
    },
    {
      icon: <BedDouble size={20} color="#15803d" />,
      bg: "#dcfce7", border: "#bbf7d0",
      label: "Admissions & hospitalisations",
      desc: "Suivi des admissions, gestion des lits et enregistrement des sorties.",
    },
    {
      icon: <FileText size={20} color="#0284c7" />,
      bg: "#dbeafe", border: "#bfdbfe",
      label: "Documents & PDF",
      desc: "Génération des fiches, lettres et rapports administratifs.",
    },
    {
      icon: <User size={20} color="#ea580c" />,
      bg: "#fff7ed", border: "#fed7aa",
      label: "Gestion du compte",
      desc: "Mise à jour des identifiants et modification du mot de passe.",
    },
  ];

  const checklist = [
    { num: 1, text: "Confirmer les rendez-vous du jour par téléphone" },
    { num: 2, text: "Vérifier les dossiers incomplets" },
    { num: 3, text: "Préparer les fiches d'admission" },
    { num: 4, text: "Imprimer les documents demandés" },
    { num: 5, text: "Mettre à jour les dossiers des patientes sorties" },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      {/* BONJOUR
    <div style={{ background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)", borderRadius: 16, padding: "20px 28px", marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#d81bb5", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Espace Médecin Chef</div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
        Bonjour, {user.login || "Dr. Diallo"} 👋
      </h2>
      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{today.charAt(0).toUpperCase() + today.slice(1)}</p>
    </div> */}

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

      {/* BUREAU ADMINISTRATIF */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ width: 4, height: 22, borderRadius: 8, background: "#d81bb5" }} />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>Bureau administratif</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>

        {/* GAUCHE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Bannière */}
          <div style={{ background: "linear-gradient(135deg, #fdf2fb 0%, #f3e8ff 100%)", borderRadius: 20, padding: "24px 28px", border: "1px solid #f0c4eb", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(216,27,181,0.06)" }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fce7f3", color: "#d81bb5", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
              🔔 Accueil & coordination
            </span>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>
              Une vue claire pour gérer<br />le flux des patientes
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280", maxWidth: 340 }}>
              Suivez les arrivées, confirmez les rendez-vous et gardez les dossiers prêts sans charge clinique inutile.
            </p>
            <button
              onClick={() => navigate("/secretaire/patientes")}
              style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.35)" }}
            >
              Voir les patientes →
            </button>
          </div>

          {/* ── Activités du secrétaire — non cliquables ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {activites.map((a, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `1px solid ${a.border}`,
                  borderRadius: 16,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  // Pas de cursor pointer, pas de hover effect = non cliquable
                }}
              >
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
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>À préparer</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>Organisation du secrétariat</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checklist.map((item) => (
              <div
                key={item.num}
                onClick={() => toggleCheck(item.num)}
                style={{ display: "flex", alignItems: "center", gap: 12, background: checked[item.num] ? "#f0fdf4" : "#fdf8ff", borderRadius: 12, padding: "12px 16px", border: `1px solid ${checked[item.num] ? "#bbf7d0" : "#f0c4eb"}`, cursor: "pointer", transition: "all 0.2s" }}
              >
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
              <span style={{ fontSize: 11, color: "#d81bb5", fontWeight: 700 }}>{Object.values(checked).filter(Boolean).length}/{checklist.length}</span>
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