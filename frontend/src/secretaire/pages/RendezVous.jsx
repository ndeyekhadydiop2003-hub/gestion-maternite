import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const statutStyle = {
  planifie:  { bg: "#fef9c3", color: "#a16207", dot: "#a16207", label: "Planifié"  },
  confirme:  { bg: "#dcfce7", color: "#15803d", dot: "#15803d", label: "Confirmé"  },
  annule:    { bg: "#fce7f3", color: "#be185d", dot: "#be185d", label: "Annulé"    },
  effectue:  { bg: "#dbeafe", color: "#1d4ed8", dot: "#1d4ed8", label: "Effectué"  },
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

const emptyForm = { date_rv: "", heure_rv: "", motif: "", statut: "planifie", id_patient: "", id_personnel: "" };
const inp = { width: "100%", padding: "10px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", boxSizing: "border-box", color: "#111827", fontFamily: "'Nunito', sans-serif" };
const lbl = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

export default function RendezVous() {
  const [rdvs, setRdvs]               = useState([]);
  const [patientes, setPatientes]     = useState([]);
  const [personnel, setPersonnel]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");

  // Modal voir/modifier
  const [viewModal, setViewModal]     = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [editForm, setEditForm]       = useState({});

  const fetchRdvs = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/rendez-vous`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Erreur " + res.status);
      const data = await res.json();
      setRdvs(Array.isArray(data) ? data : data.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchPatientes = async () => {
    try {
      const res = await fetch(`${API}/patientes`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setPatientes(Array.isArray(data) ? data : data.data || []);
    } catch (_) {}
  };

  const fetchPersonnel = async () => {
    try {
      const res = await fetch(`${API}/personnel-medical`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setPersonnel(Array.isArray(data) ? data : data.data || []);
    } catch (_) {}
  };

  useEffect(() => { fetchRdvs(); fetchPatientes(); fetchPersonnel(); }, []);

  const handleAdd = async () => {
    if (!form.date_rv || !form.heure_rv) { alert("Date et heure obligatoires."); return; }
    if (!form.id_patient) { alert("Veuillez sélectionner une patiente."); return; }
    if (!form.id_personnel) { alert("Veuillez sélectionner un membre du personnel."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/rendez-vous`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, id_patient: parseInt(form.id_patient), id_personnel: parseInt(form.id_personnel) }),
      });
      const data = await res.json();
      if (!res.ok) { const msg = data.message || Object.values(data.errors || {}).flat().join("\n"); throw new Error(msg); }
      setShowModal(false); setForm(emptyForm);
      setSuccessMsg("Rendez-vous créé avec succès !"); setTimeout(() => setSuccessMsg(""), 3000);
      fetchRdvs();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!editForm.date_rv || !editForm.heure_rv) { alert("Date et heure obligatoires."); return; }
    setSaving(true);
    try {
      // Mettre à jour les infos générales
      const res = await fetch(`${API}/rendez-vous/${viewModal.id_rv}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          date_rv:   editForm.date_rv,
          heure_rv:  editForm.heure_rv ? editForm.heure_rv.slice(0, 5) : "",
          motif:     editForm.motif || null,
          statut:    editForm.statut,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification");
      setViewModal(null); setEditMode(false);
      setSuccessMsg("Rendez-vous modifié avec succès !"); setTimeout(() => setSuccessMsg(""), 3000);
      fetchRdvs();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  // ── Filtres ──────────────────────────────────────────────────
  const [filterDate, setFilterDate]         = useState("");
  const [filterInitiale, setFilterInitiale] = useState("");

  const filtered = rdvs.filter(r => {
    const nom = r.patiente?.nom || "";
    const matchInitiale = !filterInitiale || nom.toLowerCase().startsWith(filterInitiale.toLowerCase());
    const matchDate = !filterDate || (r.date_rv && r.date_rv.startsWith(filterDate));
    return matchInitiale && matchDate;
  });

  const openView = (r) => {
    setViewModal(r);
    setEditForm({
      date_rv:      r.date_rv || "",
      heure_rv:     r.heure_rv ? r.heure_rv.slice(0, 5) : "",
      motif:        r.motif || "",
      statut:       r.statut || "planifie",
      id_patient:   r.id_patient || "",
      id_personnel: r.id_personnel || "",
    });
    setEditMode(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Rendez-vous</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{rdvs.length} rendez-vous enregistré(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau RDV
        </button>
      </div>

      {successMsg && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, border: "1px solid #bbf7d0" }}>✓ {successMsg}</div>}
      {error && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, border: "1px solid #fbcfe8" }}>⚠ {error}</div>}

      {/* ── Filtres ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Date RDV</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fff", outline: "none", color: "#111827" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Initiale patiente</label>
          <input placeholder="Ex: A" value={filterInitiale} onChange={e => setFilterInitiale(e.target.value)} maxLength={2}
            style={{ padding: "9px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fff", outline: "none", color: "#111827", width: 100 }} />
        </div>
        {(filterDate || filterInitiale) && (
          <button onClick={() => { setFilterDate(""); setFilterInitiale(""); }}
            style={{ padding: "9px 16px", background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Réinitialiser
          </button>
        )}
        <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: "auto" }}>{filtered.length} résultat(s)</span>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#d1d5db" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#d1d5db" }}>Aucun rendez-vous trouvé.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #fce7f3" }}>
                {["HEURE", "DATE", "PATIENTE", "PERSONNEL", "MOTIF", "STATUT", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, color: "#d81bb5", fontWeight: 700, letterSpacing: "0.06em", background: "#fdf8ff" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const s = statutStyle[r.statut] || { bg: "#f3f4f6", color: "#374151", dot: "#374151", label: r.statut };
                const nomPersonnel = r.personnel ? `${r.personnel.prenom || ""} ${r.personnel.nom || ""}`.trim() : `#${r.id_personnel}`;
                return (
                  <tr key={r.id_rv} style={{ borderBottom: "1px solid #fdf8ff", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", fontWeight: 800, fontSize: 15, color: "#d81bb5" }}>{r.heure_rv || "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4b5563", fontWeight: 500 }}>{formatDate(r.date_rv)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar nom={r.patiente?.nom} idx={idx} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{r.patiente?.nom || `#${r.id_patient}`}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4b5563" }}>{nomPersonnel}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4b5563", maxWidth: 140 }}>{r.motif || "—"}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }}/>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button onClick={() => openView(r)} style={{ background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Voir / Modifier ── */}
      {viewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>Rendez-vous #{viewModal.id_rv}</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{viewModal.patiente?.nom || ""}</p>
              </div>
              <button onClick={() => { setViewModal(null); setEditMode(false); }} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {editMode ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input type="date" value={editForm.date_rv} onChange={e => setEditForm({ ...editForm, date_rv: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Heure *</label>
                    <input type="time" value={editForm.heure_rv} onChange={e => setEditForm({ ...editForm, heure_rv: e.target.value })} style={inp} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Patiente</label>
                  <select value={editForm.id_patient} onChange={e => setEditForm({ ...editForm, id_patient: e.target.value })} style={inp}>
                    <option value="">-- Sélectionner une patiente --</option>
                    {patientes.map(p => <option key={p.id_patient} value={p.id_patient}>{p.nom}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Personnel médical</label>
                  <select value={editForm.id_personnel} onChange={e => setEditForm({ ...editForm, id_personnel: e.target.value })} style={inp}>
                    <option value="">-- Sélectionner --</option>
                    {personnel.map(p => <option key={p.id_personnel} value={p.id_personnel}>{`${p.prenom || ""} ${p.nom || ""}`.trim()} — {p.fonction}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Motif</label>
                  <input placeholder="Ex: Consultation prénatale" value={editForm.motif} onChange={e => setEditForm({ ...editForm, motif: e.target.value })} style={inp} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Statut</label>
                  <select value={editForm.statut} onChange={e => setEditForm({ ...editForm, statut: e.target.value })} style={inp}>
                    <option value="planifie">Planifié</option>
                    <option value="confirme">Confirmé</option>
                    <option value="annule">Annulé</option>
                    <option value="effectue">Effectué</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleEditSave} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {saving ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                  <button onClick={() => setEditMode(false)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: "#fdf8ff", borderRadius: 14, padding: "16px 18px", marginBottom: 20, border: "1px solid #f9e8f7" }}>
                  {[
                    ["Date",      formatDate(viewModal.date_rv)],
                    ["Heure",     viewModal.heure_rv || "—"],
                    ["Patiente",  viewModal.patiente?.nom || `#${viewModal.id_patient}`],
                    ["Personnel", viewModal.personnel ? `${viewModal.personnel.prenom || ""} ${viewModal.personnel.nom || ""}`.trim() : `#${viewModal.id_personnel}`],
                    ["Motif",     viewModal.motif || "—"],
                    ["Statut",    statutStyle[viewModal.statut]?.label || viewModal.statut],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #fce7f3" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setEditMode(true)} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.25)" }}>
                    ✏ Modifier
                  </button>
                  <button onClick={() => { setViewModal(null); setEditMode(false); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Nouveau RDV ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>Nouveau rendez-vous</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Planifiez un rendez-vous médical</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Date *</label>
                <input type="date" value={form.date_rv} onChange={e => setForm({ ...form, date_rv: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>Heure *</label>
                <input type="time" value={form.heure_rv} onChange={e => setForm({ ...form, heure_rv: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Patiente *</label>
              <select value={form.id_patient} onChange={e => setForm({ ...form, id_patient: e.target.value })} style={inp}>
                <option value="">-- Sélectionner une patiente --</option>
                {patientes.map(p => <option key={p.id_patient} value={p.id_patient}>{p.nom}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Personnel médical *</label>
              <select value={form.id_personnel} onChange={e => setForm({ ...form, id_personnel: e.target.value })} style={inp}>
                <option value="">-- Sélectionner --</option>
                {personnel.map(p => <option key={p.id_personnel} value={p.id_personnel}>{`${p.prenom || ""} ${p.nom || ""}`.trim()} — {p.fonction}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Motif</label>
              <input placeholder="Ex: Consultation prénatale" value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} style={inp} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} style={inp}>
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="annule">Annulé</option>
                <option value="effectue">Effectué</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAdd} disabled={saving} style={{ flex: 1, background: saving ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}