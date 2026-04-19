import { useState } from "react";

const initial = [
  {
    id: 1, de: "Équipe de jour", vers: "Équipe de nuit",
    date: "18/04/2026", heure: "19h00", auteur: "Secrétaire",
    notes: [
      "Patiente Aminata Diallo — travail en cours, surveillance renforcée",
      "Lit L03 occupé, L01 libéré suite à sortie anticipée",
      "RDV Dr Ndiaye annulé, à replanifier demain matin",
      "Stock de compresses à renouveler en urgence",
    ]
  },
  {
    id: 2, de: "Équipe de nuit", vers: "Équipe de jour",
    date: "18/04/2026", heure: "07h00", auteur: "Secrétaire",
    notes: [
      "Accouchement réussi à 02h30 — mère et enfant en bonne santé",
      "Patiente Fatou Sow — tension élevée, à surveiller",
      "Transmission des dossiers administratifs effectuée",
    ]
  },
  {
    id: 3, de: "Équipe de jour", vers: "Équipe de nuit",
    date: "17/04/2026", heure: "19h00", auteur: "Secrétaire",
    notes: [
      "3 nouvelles admissions dans la journée",
      "Rendez-vous du lendemain confirmés : 4 consultations prénatales",
      "Matériel de suivi périnatal vérifié et en ordre",
      "Famille de Mme Ba informée de l'évolution favorable",
      "Planning de garde transmis à l'équipe de nuit",
    ]
  },
];

export default function Transmissions() {
  const [transmissions, setTransmissions] = useState(initial);
  const [showModal, setShowModal]         = useState(false);
  const [detailModal, setDetailModal]     = useState(null);
  const [form, setForm] = useState({ de: "Équipe de jour", vers: "Équipe de nuit", note: "" });

  const handleAdd = () => {
    if (!form.note.trim()) return alert("Veuillez saisir au moins une note.");
    const now = new Date();
    setTransmissions([{
      id: Date.now(),
      de: form.de, vers: form.vers,
      date: now.toLocaleDateString("fr-FR"),
      heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + "h" + now.toLocaleTimeString("fr-FR", { minute: "2-digit" }),
      auteur: "Secrétaire",
      notes: form.note.split("\n").filter(l => l.trim()),
    }, ...transmissions]);
    setForm({ de: "Équipe de jour", vers: "Équipe de nuit", note: "" });
    setShowModal(false);
  };

  const dirColors = {
    "Équipe de jour": { bg: "#fef9c3", color: "#a16207", dot: "#a16207" },
    "Équipe de nuit": { bg: "#dbeafe", color: "#1d4ed8", dot: "#1d4ed8" },
  };

  const inp = { width: "100%", padding: "10px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", boxSizing: "border-box", color: "#111827", fontFamily: "'Inter', sans-serif" };
  const lbl = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Transmissions</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{transmissions.length} transmission(s) enregistrée(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle transmission
        </button>
      </div>

      {/* Liste transmissions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {transmissions.map(t => {
          const deColor   = dirColors[t.de]   || { bg: "#f3f4f6", color: "#374151", dot: "#374151" };
          const versColor = dirColors[t.vers]  || { bg: "#f3f4f6", color: "#374151", dot: "#374151" };
          return (
            <div key={t.id} style={{ background: "#fff", borderRadius: 18, border: "1px solid #f9e8f7", padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "all 0.2s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; }}
              onClick={() => setDetailModal(t)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {/* Direction */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ background: deColor.bg, color: deColor.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: deColor.dot }}/>
                      {t.de}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <span style={{ background: versColor.bg, color: versColor.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: versColor.dot }}/>
                      {t.vers}
                    </span>
                  </div>

                  {/* Meta */}
                  <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 14 }}>
                    <span>📅 {t.date} — {t.heure}</span>
                    <span>✍️ {t.auteur}</span>
                  </div>

                  {/* Aperçu première note */}
                  {t.notes[0] && (
                    <div style={{ marginTop: 12, fontSize: 13, color: "#4b5563", background: "#fdf8ff", borderRadius: 8, padding: "8px 12px", border: "1px solid #f0c4eb", borderLeft: "3px solid #d81bb5" }}>
                      {t.notes[0]}
                      {t.notes.length > 1 && <span style={{ color: "#9ca3af", marginLeft: 6 }}>+{t.notes.length - 1} autres...</span>}
                    </div>
                  )}
                </div>

                {/* Badge notes */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 16, flexShrink: 0 }}>
                  <span style={{ background: "#fdf0fb", color: "#d81bb5", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, border: "1px solid #f5d0f0" }}>
                    {t.notes.length} note{t.notes.length > 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Cliquer pour voir</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal détail ── */}
      {detailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 500, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>
                  {detailModal.de} → {detailModal.vers}
                </h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                  {detailModal.date} — {detailModal.heure} · {detailModal.auteur}
                </p>
              </div>
              <button onClick={() => setDetailModal(null)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              {detailModal.notes.length} note(s)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {detailModal.notes.map((note, i) => (
                <div key={i} style={{ display: "flex", gap: 12, background: "#fdf8ff", borderRadius: 10, padding: "12px 14px", border: "1px solid #f0c4eb", borderLeft: "3px solid #d81bb5" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{note}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setDetailModal(null)} style={{ width: "100%", marginTop: 20, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Modal nouvelle transmission ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>Nouvelle transmission</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Renseignez les notes à transmettre</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>De</label>
                <select value={form.de} onChange={e => setForm({ ...form, de: e.target.value })} style={inp}>
                  <option>Équipe de jour</option>
                  <option>Équipe de nuit</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Vers</label>
                <select value={form.vers} onChange={e => setForm({ ...form, vers: e.target.value })} style={inp}>
                  <option>Équipe de nuit</option>
                  <option>Équipe de jour</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Notes à transmettre *</label>
              <textarea
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                rows={5}
                placeholder={"Une note par ligne. Ex:\nPatiente Aminata Diallo — tension élevée\nLit L03 libéré après sortie\nRDV Dr Ndiaye à 09h00"}
                style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
              />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Saisissez une note par ligne — chaque ligne sera une note séparée</p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAdd} style={{ flex: 1, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
                Enregistrer
              </button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}