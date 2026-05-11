import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");
const H = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

const TYPE_CFG = {
  urgent:  { bg: "#FFEBEE", color: "#C62828", label: "Urgent",  dot: "🔴" },
  urgence: { bg: "#FFEBEE", color: "#C62828", label: "Urgent",  dot: "🔴" },
  info:    { bg: "#EFF6FF", color: "#0369A1", label: "Info",    dot: "🔵" },
  alerte:  { bg: "#FFFBEB", color: "#D97706", label: "Alerte",  dot: "🟡" },
  success: { bg: "#F0FDF4", color: "#15803d", label: "Succès",  dot: "🟢" },
};
const getCfg = (type) => TYPE_CFG[type] || TYPE_CFG.info;

// ── Modal envoyer notification ──
function ModalEnvoyer({ personnel, onClose, onSent }) {
  const [form, setForm] = useState({ titre: "", message: "", type: "info", id_destinataire: "" });
  const [modeRdv, setModeRdv] = useState(false);
  const [rdvDate, setRdvDate] = useState(new Date().toISOString().split("T")[0]);
  const [rdvList, setRdvList] = useState([]);
  const [loadingRdv, setLoadingRdv] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const inp = { width: "100%", padding: "10px 14px", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 13, background: "#fdf8ff", outline: "none", boxSizing: "border-box", color: "#111827" };
  const lbl = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

  const fetchRdv = async (date) => {
    setLoadingRdv(true);
    try {
      const res = await fetch(`${API}/rendez-vous?date=${date}`, { headers: H() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setRdvList(list);
      if (list.length === 0) {
        setForm(prev => ({ ...prev, titre: `Planning RDV du ${new Date(date).toLocaleDateString("fr-FR")}`, message: `Aucun rendez-vous prévu le ${new Date(date).toLocaleDateString("fr-FR")}.` }));
      } else {
        const lignes = list.map(r => {
          const heure = r.heure_rv ? r.heure_rv.slice(0, 5) : "—";
          const pat = r.patiente?.nom ? `${r.patiente.prenom || ""} ${r.patiente.nom}`.trim() : `Patiente #${r.id_patient}`;
          const pers = r.personnel ? `${r.personnel.prenom} ${r.personnel.nom} (${r.personnel.fonction})` : "—";
          return `• ${heure} — ${pat}\n  Motif : ${r.motif || "RDV"}\n  Personnel : ${pers}`;
        }).join("\n\n");
        setForm(prev => ({ ...prev,
          titre: `Planning RDV du ${new Date(date).toLocaleDateString("fr-FR")} (${list.length} RDV)`,
          message: `Bonjour,\n\nVoici le planning des rendez-vous du ${new Date(date).toLocaleDateString("fr-FR")} :\n\n${lignes}\n\nCordialement, la Secrétaire.`,
        }));
      }
    } catch (_) {} finally { setLoadingRdv(false); }
  };

  const envoyer = async () => {
    if (!form.titre || !form.message) { setErr("Titre et message obligatoires."); return; }
    setSending(true); setErr("");
    try {
      const res = await fetch(`${API}/notifications`, {
        method: "POST", headers: H(),
        body: JSON.stringify({ titre: form.titre, message: form.message, type: form.type, id_destinataire: form.id_destinataire || null }),
      });
      if (!res.ok) throw new Error("Erreur");
      onSent("Notification envoyée avec succès ✓");
      onClose();
    } catch { setErr("Erreur lors de l'envoi."); } finally { setSending(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f9e8f7" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>Envoyer une notification</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Au personnel médical</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Toggle mode */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, background: "#fdf8ff", borderRadius: 12, padding: 4 }}>
            <button onClick={() => setModeRdv(false)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: !modeRdv ? "linear-gradient(135deg, #d81bb5, #9c27b0)" : "transparent", color: !modeRdv ? "#fff" : "#9ca3af", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ✉ Message libre
            </button>
            <button onClick={() => { setModeRdv(true); fetchRdv(rdvDate); }} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: modeRdv ? "linear-gradient(135deg, #d81bb5, #9c27b0)" : "transparent", color: modeRdv ? "#fff" : "#9ca3af", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              📅 Planning RDV
            </button>
          </div>

          {/* Mode Planning */}
          {modeRdv && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Date du planning</label>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <input type="date" value={rdvDate} onChange={e => { setRdvDate(e.target.value); fetchRdv(e.target.value); }} style={{ ...inp, flex: 1 }} />
                <button onClick={() => fetchRdv(rdvDate)} disabled={loadingRdv} style={{ padding: "9px 14px", background: "#fdf0fb", color: "#d81bb5", border: "1px solid #f5d0f0", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {loadingRdv ? "..." : "↻"}
                </button>
              </div>
              {rdvList.length > 0 && (
                <div style={{ background: "#fdf8ff", borderRadius: 10, border: "1px solid #f0c4eb", overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ padding: "8px 14px", background: "#f8e1f4", fontSize: 11, fontWeight: 700, color: "#d81bb5" }}>{rdvList.length} rendez-vous trouvé(s)</div>
                  {rdvList.map((r, i) => (
                    <div key={r.id_rv} style={{ padding: "10px 14px", borderBottom: i < rdvList.length - 1 ? "1px solid #f9e8f7" : "none", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, color: "#d81bb5", fontSize: 13, minWidth: 45 }}>{r.heure_rv?.slice(0, 5)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.patiente?.prenom} {r.patiente?.nom}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.motif} · {r.personnel ? `${r.personnel.prenom} ${r.personnel.nom}` : "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Titre */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Titre *</label>
            <input placeholder="Ex: Planning RDV du jour" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} style={inp} />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Message * {modeRdv && <span style={{ fontWeight: 400, color: "#d81bb5", textTransform: "none", letterSpacing: 0 }}>(généré automatiquement)</span>}</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={modeRdv ? 7 : 3} placeholder="Votre message..." style={{ ...inp, resize: "vertical", lineHeight: 1.6, fontFamily: modeRdv ? "monospace" : "inherit", fontSize: 12 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inp}>
                <option value="info">Info</option>
                <option value="urgent">Urgent</option>
                <option value="alerte">Alerte</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Destinataire</label>
              <select value={form.id_destinataire} onChange={e => setForm({ ...form, id_destinataire: e.target.value })} style={inp}>
                <option value="">Tout le personnel</option>
                {personnel.map(p => (
                  <option key={p.id_personnel} value={p.id_utilisateur || ""}>{p.prenom} {p.nom} — {p.fonction}</option>
                ))}
              </select>
            </div>
          </div>

          {err && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14, border: "1px solid #fbcfe8" }}>⚠ {err}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={envoyer} disabled={sending} style={{ flex: 1, background: sending ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: sending ? "wait" : "pointer" }}>
              {sending ? "Envoi..." : "📤 Envoyer"}
            </button>
            <button onClick={onClose} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Carte notification ──
function NotifCard({ n, index, onMarquerLu }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = getCfg(n.type);
  const isLong = n.message?.length > 120;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
      borderBottom: "1px solid #fdf8ff", position: "relative",
      background: !n.lu ? "linear-gradient(135deg, #fdf0fb, #fff)" : "#fff",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#fdf8ff"}
      onMouseLeave={e => e.currentTarget.style.background = !n.lu ? "linear-gradient(135deg, #fdf0fb, #fff)" : "#fff"}
    >
      {/* Barre non lue */}
      {!n.lu && <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderRadius: "0 3px 3px 0", background: "linear-gradient(180deg, #d81bb5, #9c27b0)" }} />}

      {/* Icône type */}
      <div style={{ width: 44, height: 44, borderRadius: 13, background: cfg.bg, border: `1.5px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {cfg.dot}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{n.titre}</span>
          {!n.lu && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d81bb5", display: "inline-block" }}/>}
          <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
        </div>
        <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {isLong && !expanded ? n.message.slice(0, 120) + "…" : n.message}
        </div>
        {isLong && (
          <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 11.5, color: "#d81bb5", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "3px 0", marginTop: 2 }}>
            {expanded ? "▲ Réduire" : "▼ Voir plus"}
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
            🕐 {timeAgo(n.created_at)}
          </span>
          {n.expediteur_login && (
            <span style={{ fontSize: 11, color: "#d81bb5", fontWeight: 600, background: "#fce7f3", borderRadius: 20, padding: "2px 10px" }}>
              De : {n.expediteur_login} · {n.expediteur_role}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
        {!n.lu ? (
          <button onClick={() => onMarquerLu(n.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 9, border: "1px solid #bbf7d0", background: "#dcfce7", color: "#15803d", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
            ✓ Marquer lu
          </button>
        ) : (
          <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>✓✓ Lu</span>
        )}
      </div>
    </div>
  );
}

// ── Page principale ──
export default function Notifications() {
  const [notifs, setNotifs]     = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [tab, setTab]           = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]       = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const charger = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/notifications`, { headers: H() });
      if (res.status === 401) { setError("Non authentifié."); return; }
      if (!res.ok) { setError("Erreur serveur."); return; }
      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : data.data || []);
    } catch { setError("Erreur réseau."); } finally { setLoading(false); }
  };

  const fetchPersonnel = async () => {
    try {
      const res = await fetch(`${API}/personnel-medical`, { headers: H() });
      const data = await res.json();
      setPersonnel(Array.isArray(data) ? data : data.data || []);
    } catch (_) {}
  };

  useEffect(() => { charger(); fetchPersonnel(); }, []);

  const marquerLu = async (id) => {
    await fetch(`${API}/notifications/${id}/lu`, { method: "PATCH", headers: H() });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const toutMarquerLu = async () => {
    await fetch(`${API}/notifications/tout-lu`, { method: "PATCH", headers: H() });
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    showToast("Toutes les notifications marquées comme lues ✓");
  };

  const nonLues  = notifs.filter(n => !n.lu).length;
  const urgentes = notifs.filter(n => n.type === "urgent" || n.type === "urgence").length;

  const TABS = [
    { key: "all",    label: "Toutes",   count: notifs.length },
    { key: "urgent", label: "Urgentes", count: urgentes },
    { key: "info",   label: "Info",     count: notifs.filter(n => n.type === "info").length },
    { key: "alerte", label: "Alertes",  count: notifs.filter(n => n.type === "alerte").length },
    { key: "unread", label: "Non lues", count: nonLues },
  ];

  const filtered = notifs.filter(n => {
    if (tab === "unread") return !n.lu;
    if (tab === "all")    return true;
    return n.type === tab || (tab === "urgent" && n.type === "urgence");
  });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideToast { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "linear-gradient(135deg, #15803d, #14532d)", color: "#fff", borderRadius: 13, padding: "12px 20px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 9, boxShadow: "0 8px 28px rgba(0,0,0,.2)", animation: "slideToast .3s ease" }}>
          ✓ {toast}
        </div>
      )}

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(216,27,181,0.35)", position: "relative" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {nonLues > 0 && (
              <div style={{ position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: "#fff", border: "2px solid #d81bb5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 800, color: "#d81bb5" }}>
                {nonLues > 9 ? "9+" : nonLues}
              </div>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Notifications</h1>
            <p style={{ fontSize: 13, color: nonLues > 0 ? "#d81bb5" : "#9ca3af", marginTop: 4, fontWeight: nonLues > 0 ? 600 : 400 }}>
              {nonLues > 0 ? `${nonLues} non lue(s) · En attente de votre attention` : "✨ Tout est à jour"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={toutMarquerLu} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fff", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 12.5, color: "#374151", fontWeight: 600, cursor: "pointer" }}>
            ✓ Tout marquer lu
          </button>
          <button onClick={charger} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fff", border: "1px solid #f0c4eb", borderRadius: 10, fontSize: 12.5, color: "#374151", fontWeight: 600, cursor: "pointer" }}>
            ↻ Actualiser
          </button>
          <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Envoyer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total reçues",  value: notifs.length, color: "#d81bb5", bg: "#fce7f3", icon: "🔔" },
          { label: "Non lues",      value: nonLues,       color: "#9c27b0", bg: "#fdf0fb", icon: "🔕" },
          { label: "Urgentes",      value: urgentes,      color: "#C62828", bg: "#FFEBEE", icon: "⚡" },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #f9e8f7", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, border: "1px solid #fbcfe8" }}>⚠ {error}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 12.5, borderRadius: 22, fontWeight: active ? 700 : 500, cursor: "pointer", border: active ? "none" : "1px solid #f0c4eb", background: active ? "linear-gradient(135deg, #d81bb5, #9c27b0)" : "#fff", color: active ? "#fff" : "#9ca3af", boxShadow: active ? "0 4px 14px rgba(216,27,181,0.3)" : "none" }}>
              {t.label}
              <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#fce7f3", color: active ? "#fff" : "#d81bb5", borderRadius: 12, padding: "1px 7px", fontSize: 10.5, fontWeight: 800 }}>{t.count}</span>
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#9ca3af" }}>{filtered.length} résultat(s)</span>
      </div>

      {/* Liste */}
      <div style={{ background: "#fff", border: "1px solid #f9e8f7", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        {/* Header liste */}
        <div style={{ padding: "12px 20px", background: "linear-gradient(135deg, #fdf0fb, #fce7f360)", borderBottom: "1px solid #f9e8f7", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#d81bb5", textTransform: "uppercase", letterSpacing: "0.09em" }}>
            {filtered.length} notification(s)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "50px 20px", textAlign: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #f0c4eb", borderTopColor: "#d81bb5", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Chargement des notifications…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔕</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Aucune notification</div>
            <div style={{ fontSize: 12.5, color: "#9ca3af" }}>
              {tab === "unread" ? "Toutes vos notifications sont lues ✓" : "Aucune notification dans cette catégorie"}
            </div>
          </div>
        ) : (
          filtered.map((n, i) => (
            <NotifCard key={n.id} n={n} index={i} onMarquerLu={marquerLu} />
          ))
        )}
      </div>

      {/* Modal envoyer */}
      {showModal && (
        <ModalEnvoyer personnel={personnel} onClose={() => setShowModal(false)} onSent={(msg) => { showToast(msg); charger(); }} />
      )}
    </div>
  );
}
