import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Activity, Clock, Phone } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

// Mini sparkline SVG
function Sparkline({ color, points = "0,20 10,15 20,18 30,10 40,14 50,8 60,12" }) {
  return (
    <svg width="70" height="30" viewBox="0 0 70 30" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Couleurs avatar
const avatarColors = [
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fed7aa", color: "#c2410c" },
  { bg: "#d1fae5", color: "#065f46" },
];

function AvatarInitiales({ nom, idx }) {
  const ini = nom ? nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const c = avatarColors[idx % avatarColors.length];
  return (
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
      {ini}
    </div>
  );
}

// Couleurs statut RDV
const statutConfig = {
  planifie:  { label: "Planifié",  color: "#0284c7", bg: "#dbeafe", dot: "#0284c7" },
  confirme:  { label: "Confirmé",  color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  annule:    { label: "Annulé",    color: "#be185d", bg: "#fce7f3", dot: "#be185d" },
  effectue:  { label: "Effectué",  color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
};

export default function Accueil() {
  const navigate    = useNavigate();
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [rdvs, setRdvs]           = useState([]);
  const [patientes, setPatientes] = useState([]);

  useEffect(() => {
    const headers = { Accept: "application/json", Authorization: `Bearer ${getToken()}` };
    const today = new Date().toISOString().split("T")[0];

    // Stats dashboard
    fetch(`${API}/dashboard/stats`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); else setStats({ total_patientes: 0, total_hospitalisees: 0, rdv_aujourdhui: 0, transmissions_jour: 0 }); })
      .catch(() => setStats({ total_patientes: 0, total_hospitalisees: 0, rdv_aujourdhui: 0, transmissions_jour: 0 }))
      .finally(() => setLoading(false));

    // RDV du jour
    fetch(`${API}/rendez-vous?date=${today}`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRdvs(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setRdvs([]));

    // Patientes récentes
    fetch(`${API}/patientes`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const all = Array.isArray(data) ? data : data.data || [];
        setPatientes(all.slice(0, 4));
      })
      .catch(() => setPatientes([]));
  }, []);

  const v = (key) => loading ? "…" : (stats?.[key] ?? 0);

  const statCards = [
    {
      label: "Total Patientes",
      value: v("total_patientes"),
      trend: "+12%",
      trendColor: "#15803d",
      sub: "Dossiers enregistrés",
      badge: null,
      icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={18} color="#d81bb5" strokeWidth={1.8}/></div>,
      sparkColor: "#d81bb5",
      sparkPoints: "0,22 10,18 20,20 30,14 40,16 50,10 60,13",
    },
    {
      label: "Hospitalisations",
      value: v("total_hospitalisees"),
      trend: null,
      sub: "Active en cours",
      badge: { label: "● Actives", color: "#d81bb5", bg: "#fce7f3" },
      icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={18} color="#d81bb5" strokeWidth={1.8}/></div>,
      sparkColor: "#7c3aed",
      sparkPoints: "0,10 10,18 20,12 30,20 40,8 50,16 60,10",
    },
    {
      label: "Rendez-vous",
      value: v("rdv_aujourdhui"),
      trend: "+2",
      trendColor: "#15803d",
      sub: "Aujourd'hui",
      badge: null,
      icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}><Activity size={18} color="#0284c7" strokeWidth={1.8}/></div>,
      sparkColor: "#0284c7",
      sparkPoints: "0,20 10,12 20,16 30,8 40,14 50,6 60,10",
    },
    {
      label: "Transmissions",
      value: v("transmissions_jour"),
      trend: "0",
      trendColor: "#9ca3af",
      sub: "Notes du jour",
      badge: null,
      icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={18} color="#ca8a04" strokeWidth={1.8}/></div>,
      sparkColor: "#ca8a04",
      sparkPoints: "0,15 10,15 20,10 30,20 40,10 50,20 60,15",
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap");
        * { font-feature-settings: 'ss01', 'cv11'; }
      `}</style>

      {/* ── Vue d'ensemble ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <span style={{ width: 4, height: 28, background: "#d81bb5", borderRadius: 4, display: "inline-block", flexShrink: 0 }}/>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#111827", margin: 0, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.01em" }}>
            Vue d'ensemble
          </h1>
        </div>
        <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>Données du jour</span>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: "1px solid #ede8df", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{s.label}</span>
              {s.icon}
            </div>

            <div style={{ fontSize: 42, fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>

            {s.trend && (
              <div style={{ fontSize: 12, color: s.trendColor, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                {s.trend} vs hier
              </div>
            )}

            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: s.badge ? 10 : 0 }}>{s.sub}</div>

            {s.badge && (
              <span style={{ background: s.badge.bg, color: s.badge.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{s.badge.label}</span>
            )}

            <div style={{ marginTop: 12 }}>
              <Sparkline color={s.sparkColor} points={s.sparkPoints} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Activité du jour ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <span style={{ width: 4, height: 28, background: "#d81bb5", borderRadius: 4, display: "inline-block", flexShrink: 0 }}/>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", margin: 0, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.01em" }}>
          Activité du jour
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Programme du jour ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #ede8df", padding: "24px 26px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Programme du jour
              </h3>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{rdvs.length} rendez-vous aujourd'hui</p>
            </div>
            <button onClick={() => navigate("/secretaire/rendez-vous")} style={{ fontSize: 12, fontWeight: 600, color: "#d81bb5", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 18 }}>
            {rdvs.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "20px 0" }}>Aucun rendez-vous aujourd'hui</div>
            ) : rdvs.map((r, i) => {
              const sc = statutConfig[r.statut] || { label: r.statut, color: "#6b7280", bg: "#f3f4f6", dot: "#6b7280" };
              const heure = r.heure_rv ? r.heure_rv.slice(0, 5) : "—";
              const nomPatiente = r.patiente?.nom || `Patiente #${r.id_patient}`;
              return (
                <div key={r.id_rv} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: i < rdvs.length - 1 ? "1px solid #f9e8f7" : "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc.dot, flexShrink: 0, marginTop: 6 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {heure}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{r.motif || "Rendez-vous"}</div>
                    <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#9ca3af" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {nomPatiente}
                      </span>
                      {r.personnel && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                          {`${r.personnel.prenom || ""} ${r.personnel.nom || ""}`.trim()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Patientes récentes ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #ede8df", padding: "24px 26px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Patientes récentes
              </h3>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Dernières mises à jour</p>
            </div>
            <button onClick={() => navigate("/secretaire/patientes")} style={{ fontSize: 12, fontWeight: 600, color: "#d81bb5", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 18 }}>
            {patientes.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "20px 0" }}>Aucune patiente enregistrée</div>
            ) : patientes.map((p, i) => (
              <div key={p.id_patient} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < patientes.length - 1 ? "1px solid #f9e8f7" : "none" }}>
                <AvatarInitiales nom={p.nom} idx={i} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{p.nom}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {p.date_naissance ? `Née le ${new Date(p.date_naissance).toLocaleDateString("fr-FR")}` : ""}
                    {p.groupe_sanguin ? ` · ${p.groupe_sanguin}` : ""}
                    {p.motif ? ` · ${p.motif}` : ""}
                  </div>
                </div>
                <span style={{ background: "#fdf0fb", color: "#d81bb5", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  Enregistrée
                </span>
                {p.telephone && (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} title={p.telephone}>
                    <Phone size={13} color="#9ca3af" strokeWidth={1.8}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}