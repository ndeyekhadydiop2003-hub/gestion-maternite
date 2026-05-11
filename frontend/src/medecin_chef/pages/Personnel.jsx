import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const SERVICES = ["Accouchement", "Bloc opératoire", "Consultation prénatale", "Néonatologie", "Hospitalisation", "Urgences obstétricales"];
const FONCTIONS = ["Sage-femme", "Médecin", "Infirmière", "Gynécologue", "Pédiatre", "Anesthésiste", "Aide-soignante", "Agent d'accueil", "Technicien de laboratoire"];
const avatarColors = ["linear-gradient(135deg, #d81bb5, #9c27b0)", "linear-gradient(135deg, #7c3aed, #4c1d95)", "linear-gradient(135deg, #1d4ed8, #1e3a8a)", "linear-gradient(135deg, #ea580c, #7c2d12)", "linear-gradient(135deg, #15803d, #14532d)", "linear-gradient(135deg, #0284c7, #075985)"];

const inp = { width: "100%", padding: "10px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", boxSizing: "border-box", color: "#111827" };
const lbl = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

function Avatar({ nom, prenom, idx }) {
  const ini = `${(prenom || "")[0] || ""}${(nom || "")[0] || ""}`.toUpperCase() || "?";
  return <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColors[idx % avatarColors.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{ini}</div>;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Personnel() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", fonction: "", service: "" });
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPersonnel = () => {
    setLoading(true);
    fetch(`${API}/personnel`, { headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setPersonnel(Array.isArray(d) ? d : d.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPersonnel(); }, []);

  const handleAdd = async () => {
    if (!form.nom || !form.prenom || !form.fonction) { alert("Nom, prénom et fonction obligatoires."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/personnel`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Erreur");
      setShowModal(false); setForm({ nom: "", prenom: "", telephone: "", fonction: "", service: "" });
      setSuccessMsg("Agent ajouté avec succès !"); setTimeout(() => setSuccessMsg(""), 3000);
      fetchPersonnel();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/personnel/${showEdit.id_personnel}`, { method: "PUT", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error("Erreur");
      setShowEdit(null); setShowDetail(null);
      setSuccessMsg("Agent modifié avec succès !"); setTimeout(() => setSuccessMsg(""), 3000);
      fetchPersonnel();
    } catch (err) { alert("Erreur : " + err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet agent ?")) return;
    try {
      await fetch(`${API}/personnel/${id}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` } });
      setShowDetail(null);
      setSuccessMsg("Agent supprimé."); setTimeout(() => setSuccessMsg(""), 3000);
      fetchPersonnel();
    } catch (err) { alert("Erreur : " + err.message); }
  };

  const filtered = personnel.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      `${p.prenom} ${p.nom}`.toLowerCase().includes(s) ||
      String(p.id_personnel).includes(s) ||
      (p.telephone || "").includes(s) ||
      formatDate(p.created_at).toLowerCase().includes(s)
    );
  });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#d81bb5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Gestion du Personnel</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Personnel &amp; affectations</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{personnel.length} membres</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
          + Ajouter un agent
        </button>
      </div>

      {successMsg && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, border: "1px solid #bbf7d0" }}>✓ {successMsg}</div>}

      {/* Affectations par service */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 4, height: 20, background: "#d81bb5", borderRadius: 4 }} />
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.2rem", fontWeight: 600, color: "#111827", margin: 0 }}>Affectations par service</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {SERVICES.map((service, si) => {
          const members = personnel.filter(p => p.service === service);
          return (
            <div key={service} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{service}</div>
                <span style={{ background: "#fce7f3", color: "#d81bb5", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{members.length}</span>
              </div>
              {members.length === 0 ? (
                <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>Aucun agent affecté</div>
              ) : members.slice(0, 2).map((m, i) => (
                <div key={m.id_personnel} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < members.length - 1 ? 10 : 0, padding: "8px 0", borderBottom: i < members.length - 1 ? "1px solid #f9e8f7" : "none" }}>
                  <Avatar nom={m.nom} prenom={m.prenom} idx={si + i} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.prenom} {m.nom}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{m.fonction}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Tableau */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 4, height: 20, background: "#d81bb5", borderRadius: 4 }} />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.2rem", fontWeight: 600, color: "#111827", margin: 0 }}>Tout le personnel</h2>
        </div>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Rechercher par ID, nom, téléphone, date..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: "9px 14px 9px 32px", border: "1px solid #f0c4eb", borderRadius: 24, fontSize: 13, background: "#fff", outline: "none", width: 300, color: "#111827" }} />
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0e0f5", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Chargement...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fdf8ff", borderBottom: "1px solid #fce7f3" }}>
                {["ID", "NOM", "RÔLE", "SERVICE", "TÉLÉPHONE", "DATE D'ENREG.", "STATUT", ""].map(h => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, color: "#d81bb5", fontWeight: 700, letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Aucun résultat</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id_personnel} style={{ borderBottom: "1px solid #fdf8ff", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>#{p.id_personnel}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar nom={p.nom} prenom={p.prenom} idx={i} />
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.prenom} {p.nom}</div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#4b5563" }}>{p.fonction || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#4b5563" }}>{p.service || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#4b5563" }}>{p.telephone || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#6b7280" }}>{formatDate(p.created_at)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>● En service</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => setShowDetail(p)}
                      style={{ background: "#fce7f3", color: "#d81bb5", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Voir →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal détail */}
      {showDetail && !showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>Détails de l'agent</h2>
              <button onClick={() => setShowDetail(null)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Avatar + nom */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "16px", background: "#fdf8ff", borderRadius: 14, border: "1px solid #f0c4eb" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22 }}>
                {`${(showDetail.prenom || "")[0] || ""}${(showDetail.nom || "")[0] || ""}`.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{showDetail.prenom} {showDetail.nom}</div>
                <div style={{ fontSize: 13, color: "#d81bb5", fontWeight: 600 }}>{showDetail.fonction}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>ID #{showDetail.id_personnel}</div>
              </div>
            </div>

            {/* Infos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Service", value: showDetail.service || "—" },
                { label: "Téléphone", value: showDetail.telephone || "—" },
                { label: "Date d'enregistrement", value: formatDate(showDetail.created_at) },
                { label: "Statut", value: "En service" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px", border: "1px solid #f0e0f5" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowEdit(showDetail); setEditForm({ nom: showDetail.nom, prenom: showDetail.prenom, telephone: showDetail.telephone || "", fonction: showDetail.fonction || "", service: showDetail.service || "" }); }}
                style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ✏️ Modifier
              </button>
              <button onClick={() => handleDelete(showDetail.id_personnel)}
                style={{ flex: 1, background: "#fff0f0", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal modifier */}
      {showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>Modifier l'agent</h2>
              <button onClick={() => setShowEdit(null)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={lbl}>Prénom *</label><input value={editForm.prenom} onChange={e => setEditForm({ ...editForm, prenom: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Nom *</label><input value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} style={inp} /></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Fonction *</label>
              <select value={editForm.fonction} onChange={e => setEditForm({ ...editForm, fonction: e.target.value })} style={inp}>
                <option value="">-- Sélectionner --</option>
                {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Service</label>
              <select value={editForm.service} onChange={e => setEditForm({ ...editForm, service: e.target.value })} style={inp}>
                <option value="">-- Sélectionner --</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 22 }}><label style={lbl}>Téléphone</label><input value={editForm.telephone} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })} style={inp} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleEdit} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button onClick={() => setShowEdit(null)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajouter */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>Ajouter un agent</h2>
              <button onClick={() => setShowModal(false)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={lbl}>Prénom *</label><input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Ex: Aminata" style={inp} /></div>
              <div><label style={lbl}>Nom *</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Diallo" style={inp} /></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Fonction *</label>
              <select value={form.fonction} onChange={e => setForm({ ...form, fonction: e.target.value })} style={inp}>
                <option value="">-- Sélectionner --</option>
                {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Service</label>
              <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={inp}>
                <option value="">-- Sélectionner --</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Téléphone</label>
              <input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="77 000 00 00" style={inp} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAdd} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "Enregistrement..." : "Ajouter l'agent"}</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}