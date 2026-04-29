import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const navItems = [
  {
    path: "/secretaire", label: "Accueil",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  {
    path: "/secretaire/patientes", label: "Patientes",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
  },
  {
    path: "/secretaire/hospitalisation", label: "Hospitalisation",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  },
  {
    path: "/secretaire/rendez-vous", label: "Rendez-vous",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  },
  {
    path: "/secretaire/documents", label: "Documents PDF",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  },
  {
    path: "/secretaire/compte", label: "Mon compte",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  },
];

// ── Horloge ──────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'Inter', monospace", fontSize: 14, fontWeight: 500, color: "#d81bb5", background: "#f8e1f4", padding: "6px 14px", borderRadius: 20, letterSpacing: "0.05em" }}>
      ● {time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

const typeColors = {
  urgent: { bg: "#fce7f3", color: "#be185d" },
  alerte: { bg: "#fff7ed", color: "#ea580c" },
  info:   { bg: "#fdf0fb", color: "#d81bb5" },
};

const prioriteStyle = {
  urgente: { bg: "#fce7f3", color: "#be185d", dot: "#be185d" },
  normale: { bg: "#dcfce7", color: "#15803d", dot: "#15803d" },
};

const inpStyle = {
  width: "100%", padding: "9px 12px", border: "1px solid #f0c4eb",
  borderRadius: 8, fontSize: 13, background: "#fdf8ff", outline: "none",
  boxSizing: "border-box", color: "#111827", fontFamily: "'Inter', sans-serif"
};
const lbl = {
  fontSize: 11, fontWeight: 700, color: "#9ca3af",
  textTransform: "uppercase", letterSpacing: "0.06em",
  display: "block", marginBottom: 6
};

// ── NotifBell ─────────────────────────────────────────────────
function NotifBell() {
  const [open, setOpen]             = useState(false);
  const [onglet, setOnglet]         = useState("notifs"); // "notifs" | "demandes"
  const [notifs, setNotifs]         = useState([]);
  const [nonLues, setNonLues]       = useState(0);
  const [demandes, setDemandes]     = useState([]);
  const [personnel, setPersonnel]   = useState([]);

  // Modal notification libre
  const [showModalNotif, setShowModalNotif] = useState(false);
  const [newNotif, setNewNotif]             = useState({ titre: "", message: "", type: "info", id_destinataire: "" });
  const [sending, setSending]               = useState(false);

  // Modal fixer RDV
  const [showModalRdv, setShowModalRdv]     = useState(false);
  const [demandeSelectee, setDemandeSelectee] = useState(null);
  const [rdvForm, setRdvForm]               = useState({ date_rv: "", heure_rv: "", motif: "", priorite: "normale" });
  const [savingRdv, setSavingRdv]           = useState(false);
  const [erreurRdv, setErreurRdv]           = useState("");

  const ref = useRef(null);

  // ── Fetches ────────────────────────────────────────────────
  const fetchNotifs = async () => {
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data);
      setNonLues(data.filter(n => !n.lu).length);
    } catch (_) {}
  };

  const fetchDemandes = async () => {
    try {
      const res = await fetch(`${API}/planifier-rv`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const enAttente = (Array.isArray(data) ? data : data.data || []).filter(d => d.statut === "en_attente");
      setDemandes(enAttente);
    } catch (_) {}
  };

  const fetchPersonnel = async () => {
    try {
      const res = await fetch(`${API}/personnel`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setPersonnel(Array.isArray(data) ? data : data.data || []);
    } catch (_) {}
  };

  useEffect(() => {
    fetchNotifs();
    fetchDemandes();
    fetchPersonnel();
    const interval = setInterval(() => { fetchNotifs(); fetchDemandes(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const badgeTotal = nonLues + demandes.length;

  // ── Actions ────────────────────────────────────────────────
  const marquerLu = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/lu`, {
        method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNotifs(notifs.map(n => n.id === id ? { ...n, lu: true } : n));
      setNonLues(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const toutMarquer = async () => {
    try {
      await fetch(`${API}/notifications/tout-lu`, {
        method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNotifs(notifs.map(n => ({ ...n, lu: true })));
      setNonLues(0);
    } catch (_) {}
  };

  const envoyerNotif = async () => {
    if (!newNotif.titre || !newNotif.message) { alert("Titre et message obligatoires."); return; }
    setSending(true);
    try {
      const res = await fetch(`${API}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ titre: newNotif.titre, message: newNotif.message, type: newNotif.type, id_destinataire: newNotif.id_destinataire || null }),
      });
      if (!res.ok) throw new Error("Erreur");
      setShowModalNotif(false);
      setNewNotif({ titre: "", message: "", type: "info", id_destinataire: "" });
      fetchNotifs();
    } catch (err) { alert("Erreur : " + err.message); }
    finally { setSending(false); }
  };

  const confirmerRdv = async () => {
    if (!rdvForm.date_rv || !rdvForm.heure_rv) { setErreurRdv("Date et heure obligatoires."); return; }
    setSavingRdv(true); setErreurRdv("");
    try {
      // 1. Confirmer la planification → crée le RDV
      const res = await fetch(`${API}/planifier-rv/${demandeSelectee.id}/confirmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(rdvForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      // 2. Notifier le personnel concerné
      const nomPatiente  = demandeSelectee.patiente  ? `${demandeSelectee.patiente.prenom || ""} ${demandeSelectee.patiente.nom || ""}`.trim()  : `Patiente #${demandeSelectee.id_patient}`;
      const nomPersonnel = demandeSelectee.personnel ? `${demandeSelectee.personnel.prenom || ""} ${demandeSelectee.personnel.nom || ""}`.trim() : "";
      const dateFormatee = new Date(rdvForm.date_rv).toLocaleDateString("fr-FR");

      await fetch(`${API}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          titre:           `✅ RDV confirmé — ${nomPatiente}`,
          message:         `Bonjour ${nomPersonnel},\n\nVotre demande de rendez-vous a été confirmée :\n\n• Patiente : ${nomPatiente}\n• Date : ${dateFormatee}\n• Heure : ${rdvForm.heure_rv}\n• Motif : ${rdvForm.motif || demandeSelectee.motif || "—"}\n\nCordialement, la Secrétaire.`,
          type:            "info",
          id_destinataire: demandeSelectee.personnel?.id_utilisateur || null,
        }),
      });

      setShowModalRdv(false);
      setDemandeSelectee(null);
      setRdvForm({ date_rv: "", heure_rv: "", motif: "", priorite: "normale" });
      fetchDemandes();
      fetchNotifs();
    } catch (err) { setErreurRdv(err.message); }
    finally { setSavingRdv(false); }
  };

  return (
    <>
      {/* ── Cloche ── */}
      <div ref={ref} style={{ position: "relative" }}>
        <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #ede8df", background: open ? "#fdf0fb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {badgeTotal > 0 && (
            <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: demandes.length > 0 ? "#be185d" : "#d81bb5", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
              {badgeTotal}
            </span>
          )}
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div style={{ position: "absolute", right: 0, top: 44, width: 380, background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", border: "1px solid #f0c4eb", zIndex: 300, overflow: "hidden" }}>

            {/* Header dropdown */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f9e8f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Centre de notifications</div>
              <button onClick={() => { setShowModalNotif(true); setOpen(false); }}
                style={{ fontSize: 11, color: "#fff", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", border: "none", borderRadius: 20, padding: "5px 10px", cursor: "pointer", fontWeight: 600 }}>
                + Envoyer
              </button>
            </div>

            {/* Onglets */}
            <div style={{ display: "flex", borderBottom: "1px solid #f9e8f7" }}>
              <button onClick={() => setOnglet("notifs")} style={{ flex: 1, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", borderBottom: onglet === "notifs" ? "2px solid #d81bb5" : "2px solid transparent", background: "none", color: onglet === "notifs" ? "#d81bb5" : "#9ca3af" }}>
                🔔 Notifications {nonLues > 0 && <span style={{ background: "#fce7f3", color: "#be185d", borderRadius: 20, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{nonLues}</span>}
              </button>
              <button onClick={() => setOnglet("demandes")} style={{ flex: 1, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", borderBottom: onglet === "demandes" ? "2px solid #d81bb5" : "2px solid transparent", background: "none", color: onglet === "demandes" ? "#d81bb5" : "#9ca3af" }}>
                📅 Demandes RDV {demandes.length > 0 && <span style={{ background: "#fce7f3", color: "#be185d", borderRadius: 20, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{demandes.length}</span>}
              </button>
            </div>

            {/* ── Onglet Notifications ── */}
            {onglet === "notifs" && (
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Aucune notification</div>
                ) : notifs.map(n => {
                  const tc = typeColors[n.type] || typeColors.info;
                  const initiales = (n.expediteur_login || "?")[0].toUpperCase();
                  return (
                    <div key={n.id} onClick={() => marquerLu(n.id)}
                      style={{ padding: "12px 18px", borderBottom: "1px solid #fdf8ff", background: n.lu ? "#fff" : "#fdf0fb", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                      onMouseLeave={e => e.currentTarget.style.background = n.lu ? "#fff" : "#fdf0fb"}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {initiales}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{n.titre}</div>
                          {!n.lu && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d81bb5", flexShrink: 0, marginTop: 3 }}/>}
                        </div>
                        <div style={{ fontSize: 11, color: "#d81bb5", marginBottom: 3 }}>{n.expediteur_login} · {n.expediteur_role}</div>
                        <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                          <span style={{ background: tc.bg, color: tc.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{n.type}</span>
                          <span style={{ fontSize: 10, color: "#9ca3af" }}>{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {nonLues > 0 && (
                  <div style={{ padding: "10px 18px", borderTop: "1px solid #f9e8f7", textAlign: "center" }}>
                    <span style={{ fontSize: 12, color: "#d81bb5", fontWeight: 600, cursor: "pointer" }} onClick={toutMarquer}>✓ Tout marquer comme lu</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Onglet Demandes RDV ── */}
            {onglet === "demandes" && (
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {demandes.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                    Aucune demande en attente
                  </div>
                ) : demandes.map(d => {
                  const p = prioriteStyle[d.priorite] || prioriteStyle.normale;
                  const nomPatiente  = d.patiente  ? `${d.patiente.prenom || ""} ${d.patiente.nom || ""}`.trim()  : `#${d.id_patient}`;
                  const nomPersonnel = d.personnel ? `${d.personnel.prenom || ""} ${d.personnel.nom || ""}`.trim() : `#${d.id_personnel}`;
                  return (
                    <div key={d.id} style={{ padding: "14px 18px", borderBottom: "1px solid #fdf8ff" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{nomPatiente}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Dr. {nomPersonnel} · {d.personnel?.fonction || ""}</div>
                        </div>
                        <span style={{ background: p.bg, color: p.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.dot }}/>
                          {d.priorite}
                        </span>
                      </div>
                      {d.motif && (
                        <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 8, background: "#fdf8ff", padding: "6px 10px", borderRadius: 8 }}>
                          📋 {d.motif}
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {d.delai_recommande && `⏱ ${d.delai_recommande}`}
                          {d.date_souhaitee && ` · 📅 ${new Date(d.date_souhaitee).toLocaleDateString("fr-FR")}`}
                        </div>
                        <button
                          onClick={() => {
                            setDemandeSelectee(d);
                            setRdvForm({ date_rv: d.date_souhaitee || "", heure_rv: "", motif: d.motif || "", priorite: d.priorite || "normale" });
                            setShowModalRdv(true);
                            setOpen(false);
                          }}
                          style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(216,27,181,0.3)" }}
                        >
                          📅 Fixer un RDV
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ padding: "8px 18px", borderTop: "1px solid #f9e8f7", textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "#d81bb5", fontWeight: 600, cursor: "pointer" }} onClick={() => { fetchNotifs(); fetchDemandes(); }}>↻ Actualiser</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Fixer un RDV ── */}
      {showModalRdv && demandeSelectee && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>📅 Fixer un rendez-vous</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Confirmer la demande de planification</p>
              </div>
              <button onClick={() => { setShowModalRdv(false); setDemandeSelectee(null); setErreurRdv(""); }}
                style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Résumé demande */}
            <div style={{ background: "#fdf8ff", borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: "1px solid #f0c4eb" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Demande de planification</div>
              {[
                ["Patiente",  demandeSelectee.patiente  ? `${demandeSelectee.patiente.prenom || ""} ${demandeSelectee.patiente.nom || ""}`.trim()  : `#${demandeSelectee.id_patient}`],
                ["Personnel", demandeSelectee.personnel ? `${demandeSelectee.personnel.prenom || ""} ${demandeSelectee.personnel.nom || ""}`.trim() + ` — ${demandeSelectee.personnel.fonction || ""}` : "—"],
                ["Motif",     demandeSelectee.motif || "—"],
                ["Délai",     demandeSelectee.delai_recommande || "—"],
                ["Priorité",  demandeSelectee.priorite],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f9e8f7" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{value}</span>
                </div>
              ))}
            </div>

            {erreurRdv && (
              <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14, border: "1px solid #fbcfe8" }}>⚠ {erreurRdv}</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Date du RDV *</label>
                <input type="date" value={rdvForm.date_rv} onChange={e => setRdvForm({ ...rdvForm, date_rv: e.target.value })} style={inpStyle} />
              </div>
              <div>
                <label style={lbl}>Heure *</label>
                <input type="time" value={rdvForm.heure_rv} onChange={e => setRdvForm({ ...rdvForm, heure_rv: e.target.value })} style={inpStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Motif</label>
              <input placeholder="Ex: Consultation de suivi" value={rdvForm.motif} onChange={e => setRdvForm({ ...rdvForm, motif: e.target.value })} style={inpStyle} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Priorité</label>
              <select value={rdvForm.priorite} onChange={e => setRdvForm({ ...rdvForm, priorite: e.target.value })} style={inpStyle}>
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
                <option value="critique">Critique</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmerRdv} disabled={savingRdv}
                style={{ flex: 1, background: savingRdv ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: savingRdv ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
                {savingRdv ? "Confirmation..." : "✅ Confirmer le RDV + Notifier"}
              </button>
              <button onClick={() => { setShowModalRdv(false); setDemandeSelectee(null); setErreurRdv(""); }}
                style={{ background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Envoyer Notification libre ── */}
      {showModalNotif && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>Envoyer une notification</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Au personnel médical</p>
              </div>
              <button onClick={() => setShowModalNotif(false)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Titre *</label>
              <input placeholder="Ex: Information importante" value={newNotif.titre} onChange={e => setNewNotif({ ...newNotif, titre: e.target.value })} style={inpStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Message *</label>
              <textarea value={newNotif.message} onChange={e => setNewNotif({ ...newNotif, message: e.target.value })} rows={4}
                placeholder="Votre message..." style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={lbl}>Type</label>
                <select value={newNotif.type} onChange={e => setNewNotif({ ...newNotif, type: e.target.value })} style={inpStyle}>
                  <option value="info">Info</option>
                  <option value="urgent">Urgent</option>
                  <option value="alerte">Alerte</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Destinataire</label>
                <select value={newNotif.id_destinataire} onChange={e => setNewNotif({ ...newNotif, id_destinataire: e.target.value })} style={inpStyle}>
                  <option value="">Tout le personnel</option>
                  {personnel.map(p => (
                    <option key={p.id_personnel} value={p.id_utilisateur || ""}>{p.prenom} {p.nom} — {p.fonction}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={envoyerNotif} disabled={sending}
                style={{ flex: 1, background: sending ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px", fontSize: 13, fontWeight: 700, cursor: sending ? "wait" : "pointer" }}>
                {sending ? "Envoi..." : "📤 Envoyer la notification"}
              </button>
              <button onClick={() => setShowModalNotif(false)}
                style={{ background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Layout principal ──────────────────────────────────────────
export default function Layout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const initiales = (user.login || "S")[0].toUpperCase();

  const [query, setQuery]               = useState("");
  const [results, setResults]           = useState([]);
  const [searching, setSearching]       = useState(false);
  const [showSearch, setShowSearch]     = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API}/patientes`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        const all = Array.isArray(data) ? data : data.data || [];
        setResults(all.filter(p => `${p.prenom || ""} ${p.nom || ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6));
      } catch (_) {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#FBF8F3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e9b8e0; border-radius: 4px; }
        .nav-link { transition: all 0.15s ease; }
        .nav-link:hover { background: #f8e1f4 !important; color: #d81bb5 !important; }
        .nav-link:hover span { color: #d81bb5 !important; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: "#fff", borderRight: "1px solid #f8e1f4", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, boxShadow: "2px 0 12px rgba(233,30,99,0.05)" }}>
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(233,30,99,0.3)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21C12 21 3 14 3 8.5C3 5.4 5.4 3 8.5 3C10.1 3 11.6 3.8 12 5C12.4 3.8 13.9 3 15.5 3C18.6 3 21 5.4 21 8.5C21 14 12 21 12 21Z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#d81bb5", lineHeight: 1.2 }}>Portail</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#e07fcc", letterSpacing: "0.08em", textTransform: "uppercase" }}>SECRÉTAIRE</div>
            </div>
          </div>
        </div>

        <div style={{ margin: "0 12px 16px", background: "linear-gradient(135deg, #f8e1f4, #fdf0fb)", borderRadius: 12, padding: "12px 14px", border: "1px solid #e9b8e0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
              {initiales}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#7b1060" }}>{user.login || "Secrétaire"}</div>
              <div style={{ fontSize: 11, color: "#e07fcc", fontWeight: 500 }}>Secrétaire médicale</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 8px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#e9b8e0", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 12px", marginBottom: 8 }}>NAVIGATION</div>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div className="nav-link" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 2, borderRadius: 10, background: active ? "linear-gradient(135deg, #f8e1f4, #fdf0fb)" : "transparent", color: active ? "#d81bb5" : "#9e9e9e", fontWeight: active ? 700 : 600, fontSize: 13, border: active ? "1px solid #e9b8e0" : "1px solid transparent" }}>
                  <span style={{ color: active ? "#d81bb5" : "#bdbdbd", flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ padding: "12px 8px" }}>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", width: "100%", borderRadius: 10, background: "none", border: "none", color: "#bdbdbd", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8e1f4"; e.currentTarget.style.color = "#d81bb5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#bdbdbd"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #f8e1f4", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 8px rgba(233,30,99,0.05)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#d81bb5", letterSpacing: "0.06em", textTransform: "uppercase" }}>MATERNITÉ DAROU KHOUDOSS · DAKAR</div>
            <div style={{ fontSize: 11, color: "#e07fcc", fontStyle: "italic", marginTop: 1 }}>Portail Secrétaire</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Clock />

            {/* Recherche */}
            <div ref={searchRef} style={{ position: "relative" }}>
              <button onClick={() => setShowSearch(!showSearch)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #f8e1f4", background: "#FBF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              {showSearch && (
                <div style={{ position: "absolute", right: 0, top: 44, width: 320, background: "#fff", border: "1px solid #f8e1f4", borderRadius: 14, boxShadow: "0 8px 24px rgba(233,30,99,0.12)", zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #f8e1f4" }}>
                    <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une patiente..."
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#333", background: "transparent" }} />
                  </div>
                  {searching && <div style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>Recherche...</div>}
                  {!searching && query.length >= 2 && results.length === 0 && <div style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>Aucune patiente trouvée</div>}
                  {results.map(p => (
                    <div key={p.id_patient} onClick={() => { navigate("/secretaire/patientes"); setShowSearch(false); setQuery(""); }}
                      style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f8e1f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>{formatDate(p.date_naissance)} · {p.telephone || "—"}</div>
                      </div>
                      <span style={{ background: "#f8e1f4", color: "#d81bb5", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>#{p.id_patient}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NotifBell />

            <div style={{ fontSize: 12, fontWeight: 700, color: "#d81bb5", background: "#f8e1f4", padding: "4px 10px", borderRadius: 20 }}>FR</div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FBF8F3", border: "1px solid #f8e1f4", borderRadius: 24, padding: "4px 12px 4px 4px", cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                {initiales}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#7b1060" }}>{user.login || "Secrétaire"} ▾</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px 32px", minHeight: "calc(100vh - 60px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}