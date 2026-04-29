import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Activity, Phone } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

/* ---------- Sparkline ---------- */
function Sparkline({
  color,
  points = "0,20 10,15 20,18 30,10 40,14 50,8 60,12",
}) {
  return (
    <svg width="65" height="28" viewBox="0 0 70 30" fill="none">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Avatar ---------- */
const avatarColors = [
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fed7aa", color: "#c2410c" },
  { bg: "#d1fae5", color: "#065f46" },
];

function AvatarInitiales({ nom, idx }) {
  const ini = nom
    ? nom
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const c = avatarColors[idx % avatarColors.length];

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: c.bg,
        color: c.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {ini}
    </div>
  );
}

/* ---------- Statut RDV ---------- */
const statutConfig = {
  planifie: {
    label: "Planifié",
    color: "#0284c7",
    bg: "#dbeafe",
    dot: "#0284c7",
  },
  confirme: {
    label: "Confirmé",
    color: "#15803d",
    bg: "#dcfce7",
    dot: "#15803d",
  },
  annule: {
    label: "Annulé",
    color: "#be185d",
    bg: "#fce7f3",
    dot: "#be185d",
  },
  effectue: {
    label: "Effectué",
    color: "#7c3aed",
    bg: "#ede9fe",
    dot: "#7c3aed",
  },
};

/* ---------- Compare vs hier ---------- */
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
    color:
      percent > 0
        ? "#16a34a"
        : percent < 0
        ? "#dc2626"
        : "#9ca3af",
  };
}

export default function Accueil() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rdvs, setRdvs] = useState([]);
  const [patientes, setPatientes] = useState([]);

  useEffect(() => {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    };

    const today = new Date().toISOString().split("T")[0];

    /* Stats */
    fetch(`${API}/dashboard/stats`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setStats(
          data || {
            total_patientes: 0,
            total_patientes_hier: 0,
            total_hospitalisees: 0,
            rdv_aujourdhui: 0,
            rdv_hier: 0,
          }
        );
      })
      .catch(() =>
        setStats({
          total_patientes: 0,
          total_patientes_hier: 0,
          total_hospitalisees: 0,
          rdv_aujourdhui: 0,
          rdv_hier: 0,
        })
      )
      .finally(() => setLoading(false));

    /* RDV */
    fetch(`${API}/rendez-vous?date=${today}`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) =>
        setRdvs(Array.isArray(data) ? data.slice(0, 4) : [])
      )
      .catch(() => setRdvs([]));

    /* Patientes */
    fetch(`${API}/patientes`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const all = Array.isArray(data) ? data : data.data || [];
        setPatientes(all.slice(0, 4));
      })
      .catch(() => setPatientes([]));
  }, []);

  const v = (key) => (loading ? "..." : stats?.[key] ?? 0);

  const patientTrend = compareHier(
    stats?.total_patientes,
    stats?.total_patientes_hier
  );

  const rdvTrend = compareHier(
    stats?.rdv_aujourdhui,
    stats?.rdv_hier
  );

  const statCards = [
    {
      label: "Total Patientes",
      value: v("total_patientes"),
      trend: patientTrend.text,
      trendColor: patientTrend.color,
      sub: "Dossiers enregistrés",
      icon: <Users size={16} color="#d81bb5" />,
      bg: "#fce7f3",
      spark: "#d81bb5",
    },
    {
      label: "Hospitalisations",
      value: v("total_hospitalisees"),
      trend: null,
      sub: "Actives en cours",
      icon: <Heart size={16} color="#7c3aed" />,
      bg: "#f3e8ff",
      spark: "#7c3aed",
    },
    {
      label: "Rendez-vous",
      value: v("rdv_aujourdhui"),
      trend: rdvTrend.text,
      trendColor: rdvTrend.color,
      sub: "Aujourd'hui",
      icon: <Activity size={16} color="#0284c7" />,
      bg: "#dbeafe",
      spark: "#0284c7",
    },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* TITRE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <span
          style={{
            width: 4,
            height: 26,
            borderRadius: 8,
            background: "#d81bb5",
          }}
        />
        <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
          Vue d'ensemble
        </h1>
        <span style={{ color: "#9ca3af", fontSize: 13 }}>
          Données du jour
        </span>
      </div>

      {/* CARDS PLUS PETITES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {statCards.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "16px 18px",
              border: "1px solid #ede8df",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </span>

              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.icon}
              </div>
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              {s.value}
            </div>

            {s.trend && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.trendColor,
                  marginBottom: 4,
                }}
              >
                {s.trend} vs hier
              </div>
            )}

            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                marginBottom: 10,
              }}
            >
              {s.sub}
            </div>

            <Sparkline color={s.spark} />
          </div>
        ))}
      </div>

      {/* ACTIVITE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
        }}
      >
        {/* PROGRAMME DU JOUR */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 22,
            border: "1px solid #ede8df",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Programme du jour</h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                {rdvs.length} rendez-vous aujourd'hui
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/secretaire/rendez-vous")
              }
              style={{
                border: "none",
                background: "none",
                color: "#d81bb5",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Voir tout
            </button>
          </div>

          {rdvs.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>
              Aucun rendez-vous
            </div>
          ) : (
            rdvs.map((r, i) => {
              const sc =
                statutConfig[r.statut] ||
                statutConfig.planifie;

              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < rdvs.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {r.motif || "Rendez-vous"}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 6,
                    }}
                  >
                    {r.heure_rv?.slice(0, 5) || "--:--"}
                  </div>

                  <span
                    style={{
                      background: sc.bg,
                      color: sc.color,
                      padding: "4px 10px",
                      borderRadius: 30,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {sc.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* PATIENTES */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 22,
            border: "1px solid #ede8df",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                Patientes récentes
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                Dernières mises à jour
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/secretaire/patientes")
              }
              style={{
                border: "none",
                background: "none",
                color: "#d81bb5",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Voir tout
            </button>
          </div>

          {patientes.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>
              Aucune patiente
            </div>
          ) : (
            patientes.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    i < patientes.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                }}
              >
                <AvatarInitiales nom={p.nom} idx={i} />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    {p.nom}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    {p.groupe_sanguin || ""}
                  </div>
                </div>

                {p.telephone && (
                  <Phone
                    size={14}
                    color="#9ca3af"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}