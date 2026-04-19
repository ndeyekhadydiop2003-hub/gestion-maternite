import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const docs = [
  {
    label:    "Fiche d'admission",
    desc:     "Formulaire administratif d'admission",
    icon:     "📋",
    color:    "#7c3aed", bg: "#f5f0fe", border: "#ddd0f8",
    endpoint: "/pdf/fiche-admission",
    filename: "fiche-admission.pdf",
  },
  {
    label:    "Bulletin de sortie",
    desc:     "Document de sortie d'hospitalisation",
    icon:     "🏥",
    color:    "#15803d", bg: "#f0fdf4", border: "#bbf7d0",
    endpoint: "/pdf/bulletin-sortie",
    filename: "bulletins-sortie.pdf",
  },
  {
    label:    "Liste des patientes",
    desc:     "Liste complète des patientes enregistrées",
    icon:     "👥",
    color:    "#d81bb5", bg: "#fdf0fb", border: "#f5d0f0",
    endpoint: "/pdf/liste-patientes",
    filename: "liste-patientes.pdf",
  },
  {
    label:    "Planning des RDV",
    desc:     "Planning des rendez-vous de la journée",
    icon:     "📅",
    color:    "#ea580c", bg: "#fff7ed", border: "#fed7aa",
    endpoint: "/pdf/planning-rdv",
    filename: "planning-rdv.pdf",
  },
  {
    label:    "Rapport transmissions",
    desc:     "Résumé des transmissions inter-équipes",
    icon:     "💬",
    color:    "#0284c7", bg: "#eff6ff", border: "#bfdbfe",
    endpoint: "/pdf/rapport-transmissions",
    filename: "rapport-transmissions.pdf",
  },
  {
    label:    "Occupation des lits",
    desc:     "État d'occupation des lits",
    icon:     "🛏️",
    color:    "#a16207", bg: "#fefce8", border: "#fde68a",
    endpoint: "/pdf/occupation-lits",
    filename: "occupation-lits.pdf",
  },
];

export default function Documents() {
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess]         = useState(null);
  const [error, setError]             = useState("");

  const handleDownload = async (doc, i) => {
    setDownloading(i); setError("");
    try {
      const res = await fetch(`${API}${doc.endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/pdf" },
      });
      if (!res.ok) throw new Error("Erreur lors de la génération du PDF");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = doc.filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(i);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 4000);
    } finally { setDownloading(null); }
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Documents PDF</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
          Générez et téléchargez vos documents administratifs
        </p>
      </div>

      {/* Message global erreur */}
      {error && (
        <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, border: "1px solid #fbcfe8" }}>
          ⚠ {error}
        </div>
      )}

      {/* Grille documents */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {docs.map((d, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #f9e8f7",
            padding: "24px 22px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column", gap: 0,
            transition: "all 0.2s ease",
            position: "relative", overflow: "hidden"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; }}
          >
            {/* Fond décoratif */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: d.bg, opacity: 0.8 }} />

            {/* Icône */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: d.bg, border: `1px solid ${d.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16, position: "relative", zIndex: 1 }}>
              {d.icon}
            </div>

            {/* Titre + desc */}
            <div style={{ marginBottom: 18, position: "relative", zIndex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#111827", marginBottom: 6 }}>{d.label}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{d.desc}</div>
            </div>

            {/* Bouton télécharger */}
            {success === i ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "9px 18px", fontSize: 12, fontWeight: 700, width: "fit-content" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Téléchargé !
              </div>
            ) : (
              <button
                onClick={() => handleDownload(d, i)}
                disabled={downloading === i}
                style={{
                  background: downloading === i ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)",
                  color: "#fff", border: "none", borderRadius: 20,
                  padding: "9px 18px", fontSize: 12, fontWeight: 700,
                  cursor: downloading === i ? "wait" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  width: "fit-content", boxShadow: "0 4px 12px rgba(216,27,181,0.25)",
                  transition: "all 0.15s", position: "relative", zIndex: 1
                }}
              >
                {downloading === i ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/>
                    </svg>
                    Génération...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger PDF
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}