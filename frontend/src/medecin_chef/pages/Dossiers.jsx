import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const avatarColors = ["linear-gradient(135deg, #d81bb5, #9c27b0)", "linear-gradient(135deg, #7c3aed, #4c1d95)", "linear-gradient(135deg, #1d4ed8, #1e3a8a)", "linear-gradient(135deg, #ea580c, #7c2d12)", "linear-gradient(135deg, #15803d, #14532d)"];

function Avatar({ nom, prenom, idx }) {
  const ini = `${(prenom || "")[0] || ""}${(nom || "")[0] || ""}`.toUpperCase() || "?";
  return <div style={{ width: 44, height: 44, borderRadius: "50%", background: avatarColors[idx % avatarColors.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{ini}</div>;
}

const tabs = ["Résumé", "Consultations", "Accouchements", "Examens"];

export default function Dossiers() {
  const [patientes, setPatientes] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [accouchements, setAccouchements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Résumé");

  useEffect(() => {
    const h = { Accept: "application/json", Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/patientes`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => {
      const arr = Array.isArray(d) ? d : d.data || [];
      setPatientes(arr);
      if (arr.length > 0) setSelected(arr[0]);
    }).catch(() => {}).finally(() => setLoading(false));
    fetch(`${API}/consultations`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => setConsultations(Array.isArray(d) ? d : d.data || [])).catch(() => {});
    fetch(`${API}/accouchements`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => setAccouchements(Array.isArray(d) ? d : d.data || [])).catch(() => {});
  }, []);

  const filtered = patientes.filter(p => !search || `${p.prenom || ""} ${p.nom}`.toLowerCase().includes(search.toLowerCase()));
  const patienteConsultations = consultations.filter(c => selected && c.id_patient === selected.id_patient);
  const patienteAccouchements = accouchements.filter(a => selected && a.id_grossesse);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
  const age = (dob) => { if (!dob) return "—"; const diff = Date.now() - new Date(dob); return Math.floor(diff / (365.25 * 24 * 3600 * 1000)) + " ans"; };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>Dossiers médicaux</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Recherche, historique complet et suivi médical</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Liste patientes */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f9e8f7" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Nom ou n° dossier..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "9px 14px 9px 32px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", color: "#111827" }} />
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? <div style={{ padding: 20, textAlign: "center", color: "#9ca3af" }}>Chargement...</div> :
              filtered.map((p, idx) => {
                const isSelected = selected?.id_patient === p.id_patient;
                return (
                  <div key={p.id_patient} onClick={() => { setSelected(p); setActiveTab("Résumé"); }}
                    style={{ padding: "14px 16px", borderBottom: "1px solid #fdf8ff", cursor: "pointer", background: isSelected ? "#fdf0fb" : "#fff", borderLeft: isSelected ? "3px solid #d81bb5" : "3px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar nom={p.nom} prenom={p.prenom} idx={idx} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{age(p.date_naissance)} · PAT-{String(p.id_patient).padStart(6, "0")}</div>
                        {p.motif && <div style={{ fontSize: 11, color: "#d81bb5", marginTop: 2 }}>{p.motif}</div>}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Détail dossier */}
        {selected ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", overflow: "hidden" }}>
            {/* Header patient */}
            <div style={{ background: "linear-gradient(135deg, #fce7f3, #fdf0fb)", padding: "24px 28px", borderBottom: "1px solid #f0c4eb" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <Avatar nom={selected.nom} prenom={selected.prenom} idx={0} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>{selected.prenom} {selected.nom}</h2>
                    <span style={{ background: "#d81bb5", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>Suivi grossesse en cours</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{age(selected.date_naissance)} · F · Groupe {selected.groupe_sanguin || "—"} · PAT-{String(selected.id_patient).padStart(6, "0")}</div>
                  <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                    {selected.telephone && <span>📞 {selected.telephone}</span>}
                    {selected.adresse && <span>📍 {selected.adresse}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, padding: "0 28px", borderBottom: "1px solid #f0e0f5" }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 20px", border: "none", background: "none", fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? "#d81bb5" : "#6b7280", cursor: "pointer", borderBottom: activeTab === tab ? "2px solid #d81bb5" : "2px solid transparent", transition: "all 0.15s" }}>
                  {tab} {tab === "Consultations" ? `(${patienteConsultations.length})` : ""}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: 500 }}>
              {activeTab === "Résumé" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    {[
                      { title: "Antécédents médicaux", icon: "❤", items: ["Aucun antécédent renseigné"] },
                      { title: "Antécédents chirurgicaux", icon: "⚕", items: ["Aucune chirurgie renseignée"] },
                      { title: "Allergies", icon: "⚠", items: ["Aucune allergie connue"] },
                      { title: "Antécédents gynéco", icon: "👤", items: [selected.situation_matrimoniale || "Non renseigné"] },
                    ].map(({ title, icon, items }) => (
                      <div key={title} style={{ background: "#fdf8ff", borderRadius: 12, padding: "16px", border: "1px solid #f0c4eb" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>{icon} {title}</div>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4b5563", marginBottom: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d81bb5", flexShrink: 0 }}/>
                            {item}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Infos de base */}
                  <div style={{ background: "#fdf8ff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f0c4eb" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>📋 Informations du dossier</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      {[["Groupe sanguin", selected.groupe_sanguin || "—"], ["Date naissance", formatDate(selected.date_naissance)], ["Motif", selected.motif || "—"], ["Téléphone", selected.telephone || "—"], ["Adresse", selected.adresse || "—"], ["Enregistrée le", formatDate(selected.created_at)]].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginTop: 3 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Consultations" && (
                <div>
                  {patienteConsultations.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: 13 }}>Aucune consultation enregistrée pour cette patiente</div>
                  ) : patienteConsultations.map((c, i) => (
                    <div key={c.id_consultation} style={{ background: "#fdf8ff", borderRadius: 12, padding: "16px 18px", marginBottom: 12, border: "1px solid #f0c4eb" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Consultation du {formatDate(c.date_consultation)}</div>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>#{c.id_consultation}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                        {[["Tension", c.tension || "—"], ["Temp.", c.temperature ? `${c.temperature}°C` : "—"], ["Poids", c.poids ? `${c.poids}kg` : "—"], ["H.Ut.", c.hauteur_uterine ? `${c.hauteur_uterine}cm` : "—"]].map(([l, v]) => (
                          <div key={l} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #f0e0f5" }}>
                            <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>{l}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginTop: 2 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {c.observation && <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>{c.observation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Accouchements" && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: 13 }}>
                  {patienteAccouchements.length === 0 ? "Aucun accouchement enregistré pour cette patiente" : `${patienteAccouchements.length} accouchement(s)`}
                </div>
              )}

              {activeTab === "Examens" && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: 13 }}>Aucun examen enregistré pour cette patiente</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, minHeight: 400 }}>
            Sélectionnez une patiente
          </div>
        )}
      </div>
    </div>
  );
}
