import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const inp = {
  width: "100%", padding: "10px 14px",
  border: "1px solid #f0c4eb", borderRadius: 10,
  fontSize: 13, background: "#fdf8ff",
  outline: "none", boxSizing: "border-box",
  color: "#111827", fontFamily: "'Nunito', sans-serif"
};
const lbl = {
  fontSize: 11, fontWeight: 700, color: "#9ca3af",
  textTransform: "uppercase", letterSpacing: "0.06em",
  display: "block", marginBottom: 6
};

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function PwField({ label, pwKey, pw, setPw, show, toggleShow }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={pw[pwKey]}
          onChange={e => setPw({ ...pw, [pwKey]: e.target.value })}
          style={{ ...inp, padding: "10px 42px 10px 14px" }}
        />
        <button type="button" onClick={toggleShow} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#d81bb5", padding: 0, display: "flex", alignItems: "center" }}>
          <EyeIcon visible={show} />
        </button>
      </div>
    </div>
  );
}

export default function Compte() {
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState({ nom: "", email: "", role: "" });

  const [pwModal, setPwModal]     = useState(false);
  const [pw, setPw]               = useState({ ancien: "", nouveau: "", confirmer: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [showAncien, setShowAncien]       = useState(false);
  const [showNouveau, setShowNouveau]     = useState(false);
  const [showConfirmer, setShowConfirmer] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/me`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Erreur " + res.status);
        const data = await res.json();
        setForm({ nom: data.login || "", email: data.login || "", role: data.role_acces || "" });
      } catch {
        const local = JSON.parse(localStorage.getItem("user") || "{}");
        setForm({ nom: local.login || "", email: local.login || "", role: local.role_acces || "" });
      } finally { setLoading(false); }
    };
    fetchMe();
  }, []);

  const handleSave = async () => {
    setSaveError("");
    try {
      const res = await fetch(`${API}/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ login: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setSaveError(err.message); }
  };

  const handleChangePw = async () => {
    setPwError(""); setPwSuccess("");
    if (!pw.ancien || !pw.nouveau || !pw.confirmer) { setPwError("Tous les champs sont obligatoires."); return; }
    if (pw.nouveau !== pw.confirmer) { setPwError("Les mots de passe ne correspondent pas."); return; }
    if (pw.nouveau.length < 6) { setPwError("Minimum 6 caractères."); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API}/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ancien_mdp: pw.ancien, nouveau_mdp: pw.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setPwSuccess("Mot de passe modifié avec succès !");
      setPw({ ancien: "", nouveau: "", confirmer: "" });
      setTimeout(() => { setPwModal(false); setPwSuccess(""); }, 2000);
    } catch (err) { setPwError(err.message); } finally { setPwLoading(false); }
  };

  const initiales = (form.nom || "S")[0].toUpperCase();

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Chargement...</div>;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Mon compte</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Gérez vos informations personnelles</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20, maxWidth: 860 }}>

        {/* ── Carte profil gauche ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", padding: 28, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, marginBottom: 16, boxShadow: "0 8px 24px rgba(216,27,181,0.3)" }}>
            {initiales}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{form.nom}</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>{form.role || "Secrétaire"}</div>

          {/* Badges infos */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "🏥", label: "Service", value: "Gynécologie-Obstétrique" },
              { icon: "📍", label: "Localisation", value: "Darou Khoudoss · Dakar" },
              { icon: "🔑", label: "Rôle", value: form.role || "Secrétaire" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fdf8ff", borderRadius: 10, padding: "10px 14px", border: "1px solid #f0c4eb", textAlign: "left" }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginTop: 1 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Formulaire droite ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Infos compte */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", padding: 28, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ width: 4, height: 18, background: "#d81bb5", borderRadius: 4, display: "inline-block" }}/>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Informations du compte</h2>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Nom complet</label>
              <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={inp} placeholder="Votre nom complet" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Identifiant (Login)</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp} placeholder="Votre identifiant" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Rôle</label>
              <input value={form.role || "Secrétaire"} readOnly style={{ ...inp, background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" }} />
            </div>

            {saved     && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, marginBottom: 14, border: "1px solid #bbf7d0" }}>✓ Enregistré avec succès</div>}
            {saveError && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14, border: "1px solid #fbcfe8" }}>⚠ {saveError}</div>}

            <button onClick={handleSave} style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
              Enregistrer les modifications
            </button>
          </div>

          {/* Sécurité */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f9e8f7", padding: 28, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 4, height: 18, background: "#d81bb5", borderRadius: 4, display: "inline-block" }}/>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Sécurité</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fdf8ff", borderRadius: 12, padding: "14px 18px", border: "1px solid #f0c4eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Mot de passe</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Dernière modification : récente</div>
                </div>
              </div>
              <button onClick={() => { setPwModal(true); setPwError(""); setPwSuccess(""); setShowAncien(false); setShowNouveau(false); setShowConfirmer(false); }}
                style={{ background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(216,27,181,0.25)" }}>
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal mot de passe ── */}
      {pwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 420, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>Changer le mot de passe</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Minimum 6 caractères</p>
              </div>
              <button onClick={() => { setPwModal(false); setPw({ ancien: "", nouveau: "", confirmer: "" }); }} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #f0c4eb", background: "#fdf8ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {pwError   && <div style={{ background: "#fce7f3", color: "#be185d", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #fbcfe8" }}>⚠ {pwError}</div>}
            {pwSuccess && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #bbf7d0" }}>✓ {pwSuccess}</div>}

            <PwField label="Ancien mot de passe"               pwKey="ancien"    pw={pw} setPw={setPw} show={showAncien}    toggleShow={() => setShowAncien(!showAncien)} />
            <PwField label="Nouveau mot de passe"              pwKey="nouveau"   pw={pw} setPw={setPw} show={showNouveau}   toggleShow={() => setShowNouveau(!showNouveau)} />
            <PwField label="Confirmer le nouveau mot de passe" pwKey="confirmer" pw={pw} setPw={setPw} show={showConfirmer} toggleShow={() => setShowConfirmer(!showConfirmer)} />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleChangePw} disabled={pwLoading} style={{ flex: 1, background: pwLoading ? "#e07fcc" : "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", border: "none", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: pwLoading ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(216,27,181,0.3)" }}>
                {pwLoading ? "Modification..." : "Confirmer"}
              </button>
              <button onClick={() => { setPwModal(false); setPw({ ancien: "", nouveau: "", confirmer: "" }); }} style={{ flex: 1, background: "#fdf8ff", color: "#d81bb5", border: "1px solid #f0c4eb", borderRadius: 24, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}