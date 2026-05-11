import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const prioriteStyle = {
  urgent:  { bg: "#fce7f3", color: "#be185d", label: "Urgent" },
  moderee: { bg: "#fff7ed", color: "#ea580c", label: "Modérée" },
  routine: { bg: "#f0fdf4", color: "#15803d", label: "Routine" },
};

const avatarColors = ["linear-gradient(135deg, #d81bb5, #9c27b0)", "linear-gradient(135deg, #7c3aed, #4c1d95)", "linear-gradient(135deg, #1d4ed8, #1e3a8a)", "linear-gradient(135deg, #ea580c, #7c2d12)"];

function Avatar({ nom, prenom, idx }) {
  const ini = `${(prenom || nom || "?")[0]}${nom ? nom[0] : ""}`.toUpperCase().slice(0, 2);
  return <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarColors[idx % avatarColors.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{ini}</div>;
}

const getPriorite = (c) => {
  const t = parseFloat(c.tension);
  if (t > 14) return "urgent";
  if (t > 12) return "moderee";
  return "routine";
};

export default function ValiderDossiers() {
  const [consultations, setConsultations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch(`${API}/consultations`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => { const arr = Array.isArray(d) ? d : d.data || []; setConsultations(arr); if (arr.length > 0) setSelected(arr[0]); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = consultations.filter(c => !search || (c.patiente?.nom || "").toLowerCase().includes(search.toLowerCase()) || String(c.id_consultation).includes(search));
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

  const handleValider = () => {
    setValidating(true);
    setTimeout(() => { setValidating(false); setSuccessMsg("Dossier validé avec succès !"); setTimeout(() => setSuccessMsg(""), 3000); }, 1000);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#d81bb5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Validation Médicale</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>Dossiers à valider</h1>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{consultations.length} dossiers en attente de votre signature</p>
          </div>
          <div style={{ background: "#fce7f3", borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#be185d" }}>{consultations.length} en attente</span>
          </div>
        </div>
      </div>

      {successMsg && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, border: "1px solid #bbf7d0" }}>✓ {successMsg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        {/* Liste */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f9e8f7" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Rechercher patient ou n°..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "9px 14px 9px 32px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", color: "#111827" }} />
            </div>
          </div>
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {loading ? <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>Chargement...</div> :
              filtered.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>Aucun dossier</div> :
              filtered.map((c, idx) => {
                const prio = getPriorite(c); const ps = prioriteStyle[prio];
                const isSelected = selected?.id_consultation === c.id_consultation;
                return (
                  <div key={c.id_consultation} onClick={() => setSelected(c)} style={{ padding: "14px 16px", borderBottom: "1px solid #fdf8ff", cursor: "pointer", background: isSelected ? "#fdf0fb" : "#fff", borderLeft: isSelected ? "3px solid #d81bb5" : "3px solid transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{c.patiente?.prenom} {c.patiente?.nom || `Patient #${c.id_patient}`}</div>
                      <span style={{ background: ps.bg, color: ps.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{ps.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{c.observation?.slice(0, 40) || "Consultation"}...</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>DSR-2026-{String(c.id_consultation).padStart(4, "0")} · {formatDate(c.date_consultation)}</div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Détail */}
        {selected ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", padding: "24px 28px" }}>
            <div style={{ background: "linear-gradient(135deg, #fce7f3, #fdf0fb)", borderRadius: 14, padding: "18px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, border: "1px solid #f0c4eb" }}>
              <Avatar nom={selected.patiente?.nom} prenom={selected.patiente?.prenom} idx={0} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>{selected.patiente?.prenom} {selected.patiente?.nom || `Patient #${selected.id_patient}`}</h2>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Consultation · {formatDate(selected.date_consultation)}</p>
              </div>
              <span style={{ background: prioriteStyle[getPriorite(selected)].bg, color: prioriteStyle[getPriorite(selected)].color, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{prioriteStyle[getPriorite(selected)].label}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {[["N° Dossier", `DSR-2026-${String(selected.id_consultation).padStart(4, "0")}`], ["Médecin", selected.personnel ? `${selected.personnel.prenom} ${selected.personnel.nom}` : "—"], ["Service", "Consultation"], ["Date", formatDate(selected.date_consultation)]].map(([l, v]) => (
                <div key={l} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: "1px solid #f0e0f5" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fdf8ff", borderRadius: 12, padding: "16px 18px", marginBottom: 20, border: "1px solid #f0c4eb" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#d81bb5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Observation / Motif</div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{selected.observation || "Aucune observation renseignée"}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Signes vitaux
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[["TENSION", selected.tension ? `${selected.tension} mmHg` : "—"], ["TEMP.", selected.temperature ? `${selected.temperature} °C` : "—"], ["POIDS", selected.poids ? `${selected.poids} kg` : "—"], ["H. UTÉRINE", selected.hauteur_uterine ? `${selected.hauteur_uterine} cm` : "—"]].map(([l, v]) => (
                  <div key={l} style={{ background: "#fff", borderRadius: 12, padding: "14px", border: "1px solid #f0e0f5", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 6 }}>{l}</div>
                    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleValider} disabled={validating} style={{ flex: 1, background: validating ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "13px", fontSize: 13, fontWeight: 700, cursor: validating ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
                {validating ? "Validation en cours..." : "✓ Valider & Signer le dossier"}
              </button>
              <button style={{ padding: "13px 20px", background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Reporter</button>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, minHeight: 400 }}>
            Sélectionnez un dossier pour le consulter
          </div>
        )}
      </div>
    </div>
  );
}
