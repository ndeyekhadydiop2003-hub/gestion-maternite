import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const statutStyle = {
  active:     { bg: "#dcfce7", color: "#15803d", dot: "#15803d", label: "Active"     },
  terminee:   { bg: "#dbeafe", color: "#1d4ed8", dot: "#1d4ed8", label: "Terminée"   },
  transferee: { bg: "#fef9c3", color: "#a16207", dot: "#a16207", label: "Transférée" },
  en_attente: { bg: "#fff7ed", color: "#ea580c", dot: "#ea580c", label: "En attente" },
};

const detecterPriorite = (motif) => {
  const m = (motif || "").toLowerCase();
  if (m.includes("urgence") || m.includes("complication") || m.includes("hémorragie") || m.includes("hemorragie") || m.includes("travail avancé") || m.includes("detresse"))
    return { label: "Urgente", color: "#be185d", bg: "#fce7f3", dot: "#be185d" };
  if (m.includes("travail") || m.includes("accouchement") || m.includes("contraction"))
    return { label: "Normale", color: "#ea580c", bg: "#fff7ed", dot: "#ea580c" };
  return { label: "Stable", color: "#15803d", bg: "#dcfce7", dot: "#15803d" };
};

const avatarColors = [
  "linear-gradient(135deg, #d81bb5, #9c27b0)",
  "linear-gradient(135deg, #7c3aed, #4c1d95)",
  "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
  "linear-gradient(135deg, #ea580c, #7c2d12)",
  "linear-gradient(135deg, #15803d, #14532d)",
];

function Avatar({ nom, idx }) {
  const ini = nom ? nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColors[idx % avatarColors.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
      {ini}
    </div>
  );
}

const emptyForm = { date_admission: "", motif: "", id_patient: "", id_lit: "" };
const inp = { width: "100%", padding: "10px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", boxSizing: "border-box", color: "#111827", fontFamily: "'Inter', system-ui, sans-serif" };
const lbl = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

export default function Hospitalisation() {
  const [admissions, setAdmissions]   = useState([]);
  const [patientes, setPatientes]     = useState([]);
  const [lits, setLits]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal voir/modifier
  const [viewModal, setViewModal]     = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [editForm, setEditForm]       = useState({});

  // Modal sortie
  const [sortieModal, setSortieModal]     = useState(null);
  const [dateSortie, setDateSortie]       = useState("");
  const [sortieLoading, setSortieLoading] = useState(false);
  const [sortieError, setSortieError]     = useState("");

  const priorite = form.motif ? detecterPriorite(form.motif) : null;

  // ── Filtres ──────────────────────────────────────────────────
  const [filterDate, setFilterDate]       = useState("");
  const [filterInitiale, setFilterInitiale] = useState("");

  const filtered = admissions.filter(a => {
    const nom = a.patiente?.nom || "";
    const matchInitiale = !filterInitiale || nom.toLowerCase().startsWith(filterInitiale.toLowerCase());
    const matchDate = !filterDate || (a.date_admission && a.date_admission.startsWith(filterDate));
    return matchInitiale && matchDate;
  });

  const fetchAdmissions = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/hospitalisations`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Erreur " + res.status);
      const data = await res.json();
      setAdmissions(Array.isArray(data) ? data : data.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchPatientes = async () => {
    try {
      const res = await fetch(`${API}/patientes`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setPatientes(Array.isArray(data) ? data : data.data || []);
    } catch (_) {}
  };

  const fetchLits = async () => {
    try {
      const res = await fetch(`${API}/lits`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setLits(Array.isArray(data) ? data : data.data || []);
    } catch (_) {
      try {
        const res = await fetch(`${API}/lits`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
        const data = await res.json();
        setLits((Array.isArray(data) ? data : data.data || []).filter(l => l.statut === "libre"));
      } catch (_) {}
    }
  };

  useEffect(() => { fetchAdmissions(); fetchPatientes(); fetchLits(); }, []);

  const handleSubmit = async () => {
    if (!form.date_admission || !form.id_patient || !form.motif) { alert("Date, patiente et motif obligatoires."); return; }
    setSaving(true);
    try {
      const body = { date_admission: form.date_admission, motif: form.motif, id_patient: parseInt(form.id_patient) };
      if (form.id_lit) body.id_lit = parseInt(form.id_lit);
      const res = await fetch(`${API}/hospitalisations`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setShowModal(false); setForm(emptyForm);
      setNotification({ msg: data.message, type: data.statut === "active" ? "success" : "warning", orientation: data.orientation });
      setTimeout(() => setNotification(null), 5000);
      fetchAdmissions(); fetchLits();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const handleSortie = async () => {
    if (!dateSortie) { setSortieError("Veuillez saisir la date de sortie."); return; }
    setSortieLoading(true); setSortieError("");
    try {
      const res = await fetch(`${API}/hospitalisations/${sortieModal.id_hospitalisation}/sortie`, { method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ date_sorti: dateSortie }) });
      if (!res.ok) throw new Error("Erreur");
      setSortieModal(null); setDateSortie("");
      setNotification({ msg: "Sortie enregistrée — Lit libéré avec succès", type: "success" });
      setTimeout(() => setNotification(null), 3000);
      fetchAdmissions(); fetchLits();
    } catch (err) { setSortieError(err.message); } finally { setSortieLoading(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/hospitalisations/${viewModal.id_hospitalisation}`, { method: "PUT", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(editForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setViewModal(null); setEditMode(false);
      setNotification({ msg: "Hospitalisation modifiée avec succès", type: "success" });
      setTimeout(() => setNotification(null), 3000);
      fetchAdmissions();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const openView = (a) => { setViewModal(a); setEditForm({ motif: a.motif, statut: a.statut }); setEditMode(false); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
  const actives   = admissions.filter(a => a.statut === "active").length;
  const enAttente = admissions.filter(a => a.statut === "en_attente").length;
  const terminees = admissions.filter(a => a.statut === "terminee").length;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Hospitalisations</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{admissions.length} hospitalisation(s) enregistrée(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle admission
        </button>
      </div>

      {notification && (
        <div style={{ background: notification.type === "success" ? "#dcfce7" : "#fff7ed", color: notification.type === "success" ? "#15803d" : "#ea580c", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, border: `1px solid ${notification.type === "success" ? "#bbf7d0" : "#fed7aa"}` }}>
          {notification.type === "success" ? "✓" : "⚠"} {notification.msg}
          {notification.orientation && <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>📍 Orientation : <strong>{notification.orientation}</strong></div>}
        </div>
      )}
      {error && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, border: "1px solid #fbcfe8" }}>⚠ {error}</div>}

      {/* ── Filtres ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Date admission</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fff", outline: "none", color: "#111827", fontFamily: "'Inter', sans-serif" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Initiale patiente</label>
          <input placeholder="Ex: A" value={filterInitiale} onChange={e => setFilterInitiale(e.target.value)} maxLength={2}
            style={{ padding: "9px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fff", outline: "none", color: "#111827", width: 100, fontFamily: "'Inter', sans-serif" }} />
        </div>
        {(filterDate || filterInitiale) && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={() => { setFilterDate(""); setFilterInitiale(""); }}
              style={{ padding: "9px 16px", background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Réinitialiser
            </button>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", marginLeft: "auto" }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>{filtered.length} résultat(s)</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          {
            v: lits.length, l: "Lits disponibles", sub: "En maternité",
            color: "#15803d", lightBg: "#dcfce7", border: "#bbf7d0",
            icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          },
          {
            v: actives, l: "Hospitalisations actives", sub: "En cours",
            color: "#7c3aed", lightBg: "#ede9fe", border: "#ddd6fe",
            icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          },
          {
            v: enAttente, l: "En attente", sub: "Orientation en cours",
            color: "#ea580c", lightBg: "#fff7ed", border: "#fed7aa",
            icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          },
          {
            v: terminees, l: "Sorties", sub: "Enregistrées",
            color: "#0284c7", lightBg: "#e0f2fe", border: "#bae6fd",
            icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: `1px solid ${s.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", fontFamily: "'Inter', system-ui, sans-serif" }}>{s.l}</span>
              {s.icon}
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 6, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.01em" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Inter', system-ui, sans-serif" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#d1d5db" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#d1d5db" }}>Aucune hospitalisation trouvée.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #fce7f3" }}>
                {["PATIENTE", "LIT", "DATE ADMISSION", "DATE SORTIE", "MOTIF", "STATUT", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, color: "#d81bb5", fontWeight: 700, letterSpacing: "0.06em", background: "#fdf8ff" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const s = statutStyle[a.statut] || { bg: "#f3f4f6", color: "#374151", dot: "#374151", label: a.statut };
                return (
                  <tr key={a.id_hospitalisation} style={{ borderBottom: "1px solid #fdf8ff", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar nom={a.patiente?.nom} idx={idx} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{a.patiente?.nom || `#${a.id_patient}`}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>
                        {a.lit ? `${a.lit.numero_lit}${a.lit.salle ? "/" + a.lit.salle.numero_chambre : ""}` : "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{a.lit?.salle?.type_chambre || "Maternité"}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#4b5563", fontWeight: 500 }}>{formatDate(a.date_admission)}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#4b5563" }}>{formatDate(a.date_sorti)}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#4b5563", maxWidth: 130 }}>{a.motif}</td>

                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }}/>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openView(a)} style={{ background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Voir</button>
                        {(a.statut === "active" || a.statut === "en_attente") && (
                          <button onClick={() => { setSortieModal(a); setDateSortie(""); setSortieError(""); }}
                            style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            Sortie
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Voir / Modifier */}
      {viewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Avatar nom={viewModal.patiente?.nom} idx={0} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>{viewModal.patiente?.nom || "Patiente"}</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Hospitalisation #{viewModal.id_hospitalisation}</p>
              </div>
              <button onClick={() => setViewModal(null)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {editMode ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Motif</label>
                  <input value={editForm.motif || ""} onChange={e => setEditForm({ ...editForm, motif: e.target.value })} style={inp} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Statut</label>
                  <select value={editForm.statut || ""} onChange={e => setEditForm({ ...editForm, statut: e.target.value })} style={inp}>
                    <option value="active">Active</option>
                    <option value="terminee">Terminée</option>
                    <option value="transferee">Transférée</option>
                    <option value="en_attente">En attente</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleEdit} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "Enregistrement..." : "Sauvegarder"}</button>
                  <button onClick={() => setEditMode(false)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: "#fdf8ff", borderRadius: 14, padding: "16px 18px", marginBottom: 20, border: "1px solid #f9e8f7" }}>
                  {[
                    ["Lit", viewModal.lit ? `Lit ${viewModal.lit.numero_lit}` : "—"],
                    ["Salle", viewModal.lit?.salle?.type_chambre || "Maternité"],
                    ["Date admission", formatDate(viewModal.date_admission)],
                    ["Date sortie", formatDate(viewModal.date_sorti)],
                    ["Motif", viewModal.motif],
                    ["Statut", statutStyle[viewModal.statut]?.label || viewModal.statut],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #fce7f3" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setEditMode(true)} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✏ Modifier</button>
                  <button onClick={() => setViewModal(null)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fermer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal admission */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>Nouvelle admission</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{lits.length === 0 ? "⚠ Aucun lit — orientation automatique" : `${lits.length} lit(s) disponible(s)`}</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {priorite && form.motif.length > 3 && (
              <div style={{ background: priorite.bg, color: priorite.color, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
                Priorité : <strong>{priorite.label}</strong>{lits.length === 0 && <span> → Orientation : <strong>{priorite.orientation}</strong></span>}
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Patiente *</label>
              <select value={form.id_patient} onChange={e => setForm({ ...form, id_patient: e.target.value })} style={inp}>
                <option value="">-- Sélectionner --</option>
                {patientes.map(p => <option key={p.id_patient} value={p.id_patient}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Motif *</label>
              <input placeholder="Ex: travail avancé, urgence, consultation..." value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} style={inp} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Lit {lits.length === 0 ? "(aucun disponible)" : ""}</label>
              <select value={form.id_lit} onChange={e => setForm({ ...form, id_lit: e.target.value })} disabled={lits.length === 0} style={{ ...inp, background: lits.length === 0 ? "#f9fafb" : "#fdf8ff", cursor: lits.length === 0 ? "not-allowed" : "pointer" }}>
                <option value="">{lits.length === 0 ? "Orientation automatique" : "-- Sélectionner un lit --"}</option>
                {lits.map(l => <option key={l.id_lit} value={l.id_lit}>{l.numero_lit}{l.salle ? "/" + l.salle.numero_chambre : ""} — {l.salle?.type_chambre || "Maternité"}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Date d'admission *</label>
              <input type="date" value={form.date_admission} onChange={e => setForm({ ...form, date_admission: e.target.value })} style={inp} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: saving ? "#e07fcc" : lits.length === 0 ? "linear-gradient(135deg, #f97316, #ea580c)" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                {saving ? "Enregistrement..." : lits.length === 0 ? `Orienter (${priorite?.orientation || "Salle d'attente"})` : "Admettre en Maternité"}
              </button>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sortie */}
      {sortieModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 400, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>Enregistrer la sortie</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{sortieModal.patiente?.nom} · {sortieModal.lit ? `${sortieModal.lit.numero_lit}${sortieModal.lit.salle ? '/' + sortieModal.lit.salle.numero_chambre : ''}` : ""}</p>
              </div>
            </div>
            {sortieError && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14, border: "1px solid #fbcfe8" }}>⚠ {sortieError}</div>}
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Date de sortie *</label>
              <input type="date" value={dateSortie} onChange={e => setDateSortie(e.target.value)} style={{ ...inp, border: "1px solid #bbf7d0", background: "#f0fdf4" }} />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>Cette date s'affichera dans le tableau et le lit sera libéré automatiquement.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSortie} disabled={sortieLoading} style={{ flex: 1, background: sortieLoading ? "#86efac" : "linear-gradient(135deg, #15803d, #14532d)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: sortieLoading ? "wait" : "pointer" }}>
                {sortieLoading ? "Enregistrement..." : "Confirmer la sortie"}
              </button>
              <button onClick={() => { setSortieModal(null); setDateSortie(""); setSortieError(""); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}