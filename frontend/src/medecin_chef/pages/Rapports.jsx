import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
  PieChart, Pie, Cell,
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const moisData = [
  { label: "Nov", "Voie basse": 42, "Césarienne": 18 },
  { label: "Déc", "Voie basse": 48, "Césarienne": 12 },
  { label: "Jan", "Voie basse": 45, "Césarienne": 10 },
  { label: "Fév", "Voie basse": 45, "Césarienne": 24 },
  { label: "Mar", "Voie basse": 55, "Césarienne": 20 },
  { label: "Avr", "Voie basse": 58, "Césarienne": 22 },
];

const occupationData = [
  { jour: "Lun", taux: 72 }, { jour: "Mar", taux: 75 },
  { jour: "Mer", taux: 80 }, { jour: "Jeu", taux: 76 },
  { jour: "Ven", taux: 80 }, { jour: "Sam", taux: 78 }, { jour: "Dim", taux: 82 },
];

const pathologiesData = [
  { name: "Pré-éclampsie", value: 30 },
  { name: "Diabète gest.", value: 22 },
  { name: "Anémie", value: 25 },
  { name: "HTA gravidique", value: 15 },
  { name: "Autres", value: 8 },
];
const PIE_COLORS = ["#d81bb5", "#7c3aed", "#ec4899", "#f9a8d4", "#ddd6fe"];

const servicesData = [
  { service: "CPN", patients: 142 },
  { service: "Salle d'acc.", patients: 90 },
  { service: "Bloc op.", patients: 60 },
  { service: "Neonat.", patients: 85 },
  { service: "Hospit.", patients: 75 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #f0c4eb", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6, fontSize: 13 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
          {p.name} : {p.value}
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #f0c4eb", borderRadius: 10, padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: payload[0].payload.fill }}>
        {payload[0].name} : {payload[0].value}%
      </div>
    </div>
  );
};

export default function Rapports() {
  const [personnel, setPersonnel] = useState([]);

  useEffect(() => {
    const h = { Accept: "application/json", Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/personnel`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => {
      setPersonnel(Array.isArray(d) ? d : d.data || []);
    }).catch(() => {});
  }, []);

  const kpis = [
    { value: "83",  label: "Accouchements / mois", trend: "+12%", up: true },
    { value: "30%", label: "Taux de césarienne",   trend: "-3%",  up: false },
    { value: "0",   label: "Mortalité maternelle", trend: "stable", up: true },
    { value: "94%", label: "Satisfaction patientes", trend: "+2%", up: true },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#d81bb5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Rapports & Statistiques</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Indicateurs du service</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Vue d'ensemble · 6 derniers mois</p>
        </div>
        <button style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ⬇ Exporter PDF
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #f0e0f5", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, color: k.up ? "#15803d" : "#ea580c", fontWeight: 600, marginBottom: 8 }}>
              {k.up ? "▲" : "▼"} {k.trend}
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Graphiques ligne 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Accouchements par mois */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid #f0e0f5" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: 4 }}>Accouchements par mois</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Voie basse vs Césarienne</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moisData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Voie basse" fill="#d81bb5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Césarienne" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Taux d'occupation */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid #f0e0f5" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: 4 }}>Taux d'occupation</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>7 derniers jours</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={occupationData}>
              <defs>
                <linearGradient id="gradOccup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d81bb5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d81bb5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="taux" stroke="#d81bb5" strokeWidth={2} fill="url(#gradOccup)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques ligne 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Pathologies */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid #f0e0f5" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: 4 }}>Pathologies fréquentes</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Répartition cumulée</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <PieChart width={150} height={150}>
              <Pie data={pathologiesData} cx={70} cy={70} innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                {pathologiesData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
            <div style={{ flex: 1 }}>
              {pathologiesData.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#6b7280", flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activité par service */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid #f0e0f5" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: 4 }}>Activité par service</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Patientes prises en charge</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={servicesData} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="service" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="patients" fill="#d81bb5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance médecins */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f9e8f7" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>Performance par médecin</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>30 derniers jours</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fdf8ff" }}>
              {["MÉDECIN", "CONSULTATIONS", "ACCOUCHEMENTS", "SATISFACTION"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 10, color: "#d81bb5", fontWeight: 700, letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(personnel.length > 0 ? personnel : [
              { prenom: "Dr.", nom: "Ba", id_personnel: 1 },
              { prenom: "Dr.", nom: "Sow", id_personnel: 2 },
              { prenom: "Dr.", nom: "Mbaye", id_personnel: 3 },
            ]).slice(0, 5).map((p, i) => {
              const consults     = [124, 156, 87, 102, 134][i] || 100;
              const accouche     = [38, 12, 42, 8, 25][i] || 10;
              const satisfaction = [94, 96, 92, 95, 93][i] || 90;
              return (
                <tr key={p.id_personnel} style={{ borderBottom: "1px solid #fdf8ff" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.prenom} {p.nom}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#374151" }}>{consults}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#374151" }}>{accouche}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, background: "#f9fafb", borderRadius: 4, height: 6 }}>
                        <div style={{ width: `${satisfaction}%`, height: "100%", background: "linear-gradient(90deg, #d81bb5, #9c27b0)", borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#d81bb5" }}>{satisfaction}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}