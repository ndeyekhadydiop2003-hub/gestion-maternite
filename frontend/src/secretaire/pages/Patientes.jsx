import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const emptyForm = {
  nom: "", prenom: "", date_naissance: "", telephone: "",
  motif: "", groupe_sanguin: "", situation_matrimoniale: "", adresse: ""
};

const avatarColors = [
  "linear-gradient(135deg, #d81bb5, #9c27b0)",
  "linear-gradient(135deg, #7c3aed, #4c1d95)",
  "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
  "linear-gradient(135deg, #ea580c, #7c2d12)",
  "linear-gradient(135deg, #15803d, #14532d)",
  "linear-gradient(135deg, #0284c7, #075985)",
];

const gsColors = {
  "A+":  { bg: "#fce7f3", color: "#be185d" }, "A-":  { bg: "#fce7f3", color: "#be185d" },
  "B+":  { bg: "#dbeafe", color: "#1d4ed8" }, "B-":  { bg: "#dbeafe", color: "#1d4ed8" },
  "AB+": { bg: "#ede9fe", color: "#6d28d9" }, "AB-": { bg: "#ede9fe", color: "#6d28d9" },
  "O+":  { bg: "#dcfce7", color: "#15803d" }, "O-":  { bg: "#fff7ed", color: "#ea580c" },
};

function Avatar({ nom, prenom, idx }) {
  const ini = `${(prenom||"")[0]||""}${(nom||"")[0]||""}`.toUpperCase() || "?";
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColors[idx % avatarColors.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
      {ini}
    </div>
  );
}

const inp = { width: "100%", padding: "10px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", boxSizing: "border-box", color: "#111827", fontFamily: "'Inter', sans-serif" };
const lbl = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

export default function Patientes() {
  const [patientes, setPatientes]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewModal, setViewModal]       = useState(null);
  const [editMode, setEditMode]         = useState(false);
  const [editForm, setEditForm]         = useState({});
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState("");
  const [successMsg, setSuccessMsg]     = useState("");

  // Filtres
  const [filterDate, setFilterDate]             = useState("");
  const [filterDateNaissance, setFilterDateNaissance] = useState("");
  const [filterGroupe, setFilterGroupe]         = useState("");
  const [filterTel, setFilterTel]               = useState("");

  const fetchPatientes = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/patientes`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Erreur " + res.status);
      const data = await res.json();
      setPatientes(Array.isArray(data) ? data : data.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPatientes(); }, []);

  const handleAdd = async () => {
    if (!form.nom || !form.prenom || !form.date_naissance) {
      alert("Nom, prénom et date de naissance sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/patientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setShowAddModal(false); setForm(emptyForm);
      setSuccessMsg("Patiente enregistrée avec succès !"); setTimeout(() => setSuccessMsg(""), 3000);
      fetchPatientes();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/patientes/${viewModal.id_patient}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setEditMode(false); setViewModal(null);
      setSuccessMsg("Patiente modifiée avec succès !"); setTimeout(() => setSuccessMsg(""), 3000);
      fetchPatientes();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const openView = (p) => {
    setViewModal(p);
    setEditForm({ nom: p.nom, prenom: p.prenom || "", date_naissance: p.date_naissance, telephone: p.telephone || "", motif: p.motif || "", groupe_sanguin: p.groupe_sanguin || "", situation_matrimoniale: p.situation_matrimoniale || "", adresse: p.adresse || "" });
    setEditMode(false);
  };

  const filtered = patientes.filter(p => {
    const nomComplet = `${p.prenom || ""} ${p.nom || ""}`.toLowerCase();
    const matchNom    = !search || nomComplet.includes(search.toLowerCase()) || String(p.id_patient).includes(search);
    const matchDate   = !filterDate || (p.created_at && p.created_at.startsWith(filterDate));
    const matchNaiss  = !filterDateNaissance || (p.date_naissance && p.date_naissance.startsWith(filterDateNaissance));
    const matchGroupe = !filterGroupe || p.groupe_sanguin === filterGroupe;
    const matchTel    = !filterTel || (p.telephone && p.telephone.includes(filterTel));
    return matchNom && matchDate && matchNaiss && matchGroupe && matchTel;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
  const hasFilter = filterDate || filterDateNaissance || filterGroupe || filterTel;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Patientes</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{patientes.length} patiente(s) enregistrée(s)</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "9px 14px 9px 34px", border: "1px solid #f0c4eb", borderRadius: 24, fontSize: 13, background: "#fff", outline: "none", width: 200, color: "#111827" }} />
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle patiente
          </button>
        </div>
      </div>

      {successMsg && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, border: "1px solid #bbf7d0" }}>✓ {successMsg}</div>}
      {error && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, border: "1px solid #fbcfe8" }}>⚠ {error}</div>}

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f9e8f7", padding: "16px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Filtres</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ ...lbl, marginBottom: 4 }}>Date inscription</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #f0c4eb", borderRadius: 8, fontSize: 13, background: "#fdf8ff", outline: "none", color: "#111827" }} />
          </div>
          <div>
            <label style={{ ...lbl, marginBottom: 4 }}>Date naissance</label>
            <input type="date" value={filterDateNaissance} onChange={e => setFilterDateNaissance(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #f0c4eb", borderRadius: 8, fontSize: 13, background: "#fdf8ff", outline: "none", color: "#111827" }} />
          </div>
          <div>
            <label style={{ ...lbl, marginBottom: 4 }}>Groupe sanguin</label>
            <select value={filterGroupe} onChange={e => setFilterGroupe(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #f0c4eb", borderRadius: 8, fontSize: 13, background: "#fdf8ff", outline: "none", color: "#111827" }}>
              <option value="">Tous</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...lbl, marginBottom: 4 }}>Téléphone</label>
            <input placeholder="Ex: 77 000" value={filterTel} onChange={e => setFilterTel(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #f0c4eb", borderRadius: 8, fontSize: 13, background: "#fdf8ff", outline: "none", color: "#111827", width: 130 }} />
          </div>
          {hasFilter && (
            <button onClick={() => { setFilterDate(""); setFilterDateNaissance(""); setFilterGroupe(""); setFilterTel(""); }} style={{ padding: "8px 16px", background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Réinitialiser
            </button>
          )}
          <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: "auto" }}>{filtered.length} résultat(s)</span>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#d1d5db" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#d1d5db" }}>Aucune patiente trouvée.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #fce7f3" }}>
                {["DÉBUT", "PATIENTE", "DATE NAISSANCE", "TÉLÉPHONE", "GROUPE SANGUIN", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, color: "#d81bb5", fontWeight: 700, letterSpacing: "0.06em", background: "#fdf8ff" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const gs = gsColors[p.groupe_sanguin];
                return (
                  <tr key={p.id_patient} style={{ borderBottom: "1px solid #fdf8ff", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{formatDate(p.created_at)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar nom={p.nom} prenom={p.prenom} idx={idx} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{p.prenom} {p.nom}</div>
                          {p.situation_matrimoniale && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{p.situation_matrimoniale}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4b5563" }}>{formatDate(p.date_naissance)}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4b5563" }}>{p.telephone || "—"}</td>
                    <td style={{ padding: "14px 20px" }}>
                      {p.groupe_sanguin ? (
                        <span style={{ background: gs?.bg || "#f3f4f6", color: gs?.color || "#374151", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: gs?.color || "#374151" }}/>
                          {p.groupe_sanguin}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button onClick={() => openView(p)} style={{ background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
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

      {/* Modal Voir / Modifier */}
      {viewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <Avatar nom={viewModal.nom} prenom={viewModal.prenom} idx={0} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>{viewModal.prenom} {viewModal.nom}</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Dossier #{viewModal.id_patient}</p>
              </div>
              <button onClick={() => { setViewModal(null); setEditMode(false); }} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {editMode ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={lbl}>Prénom</label><input value={editForm.prenom || ""} onChange={e => setEditForm({ ...editForm, prenom: e.target.value })} style={inp} /></div>
                  <div><label style={lbl}>Nom</label><input value={editForm.nom || ""} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} style={inp} /></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Date de naissance</label><input type="date" value={editForm.date_naissance || ""} onChange={e => setEditForm({ ...editForm, date_naissance: e.target.value })} style={inp} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={lbl}>Téléphone</label><input value={editForm.telephone || ""} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })} style={inp} /></div>
                  <div>
                    <label style={lbl}>Groupe sanguin</label>
                    <select value={editForm.groupe_sanguin || ""} onChange={e => setEditForm({ ...editForm, groupe_sanguin: e.target.value })} style={inp}>
                      <option value="">-- Sélectionner --</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={lbl}>Situation matrimoniale</label>
                    <select value={editForm.situation_matrimoniale || ""} onChange={e => setEditForm({ ...editForm, situation_matrimoniale: e.target.value })} style={inp}>
                      <option value="">-- Sélectionner --</option>
                      <option value="celibataire">Célibataire</option>
                      <option value="mariee">Mariée</option>
                      <option value="divorcee">Divorcée</option>
                      <option value="veuve">Veuve</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Adresse</label><input value={editForm.adresse || ""} onChange={e => setEditForm({ ...editForm, adresse: e.target.value })} style={inp} /></div>
                </div>
                <div style={{ marginBottom: 20 }}><label style={lbl}>Motif</label><input value={editForm.motif || ""} onChange={e => setEditForm({ ...editForm, motif: e.target.value })} style={inp} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleEdit} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "Enregistrement..." : "Sauvegarder"}</button>
                  <button onClick={() => setEditMode(false)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: "#fdf8ff", borderRadius: 14, padding: "16px 18px", marginBottom: 20, border: "1px solid #f9e8f7" }}>
                  {[
                    ["Prénom",             viewModal.prenom || "—"],
                    ["Nom",                viewModal.nom || "—"],
                    ["Date de naissance",  formatDate(viewModal.date_naissance)],
                    ["Téléphone",          viewModal.telephone || "—"],
                    ["Groupe sanguin",     viewModal.groupe_sanguin || "—"],
                    ["Situation",          viewModal.situation_matrimoniale || "—"],
                    ["Adresse",            viewModal.adresse || "—"],
                    ["Motif",              viewModal.motif || "—"],
                    ["Enregistrée le",     formatDate(viewModal.created_at)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #fce7f3" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setEditMode(true)} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.25)" }}>✏ Modifier</button>
                  <button onClick={() => { setViewModal(null); setEditMode(false); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fermer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Nouvelle patiente */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 500, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>Nouvelle patiente</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Remplissez les informations du dossier</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setForm(emptyForm); }} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Nom + Prénom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Prénom *</label>
                <input placeholder="Ex: Aminata" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>Nom *</label>
                <input placeholder="Ex: Diallo" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Date de naissance *</label>
              <input type="date" value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} style={inp} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Téléphone</label>
                <input placeholder="77 000 00 00" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>Groupe sanguin</label>
                <select value={form.groupe_sanguin} onChange={e => setForm({ ...form, groupe_sanguin: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner --</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Situation matrimoniale</label>
                <select value={form.situation_matrimoniale} onChange={e => setForm({ ...form, situation_matrimoniale: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner --</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="mariee">Mariée</option>
                  <option value="divorcee">Divorcée</option>
                  <option value="veuve">Veuve</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Adresse</label>
                <input placeholder="Ex: Dakar, Médina" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Motif de consultation</label>
              <input placeholder="Ex: Consultation prénatale" value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} style={inp} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAdd} disabled={saving} style={{ flex: 1, background: saving ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button onClick={() => { setShowAddModal(false); setForm(emptyForm); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}