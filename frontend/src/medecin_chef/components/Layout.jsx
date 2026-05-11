import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #f0e0f0", borderRadius: 20, padding: "6px 14px" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
      <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: "#111827" }}>
        {time.toLocaleTimeString("fr-FR")}
      </span>
    </div>
  );
}

const navItems = [
  { path: "/medecin_chef", label: "Tableau de bord", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { path: "/medecin_chef/valider-dossiers", label: "Valider dossiers", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { path: "/medecin_chef/personnel", label: "Personnel", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { path: "/medecin_chef/dossiers", label: "Dossiers", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { path: "/medecin_chef/rapports", label: "Rapports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { path: "/medecin_chef/compte", label: "Mon compte", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initiales = (user.login || "Dr")[0].toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#FBF8F3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #f0c4eb; border-radius: 4px; }
        .nav-item:hover { background: #fce7f3 !important; color: #d81bb5 !important; }
        .nav-item:hover svg { stroke: #d81bb5 !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 250, background: "#fff", borderRight: "1px solid #f0e0f5", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f9e8f7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #d81bb5, #9c27b0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(216,27,181,0.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 21C12 21 3 14 3 8.5C3 5.4 5.4 3 8.5 3C10.1 3 11.6 3.8 12 5C12.4 3.8 13.9 3 15.5 3C18.6 3 21 5.4 21 8.5C21 14 12 21 12 21Z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#d81bb5" }}>Portail</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>Médecin Chef</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: "12px", background: "linear-gradient(135deg, #fce7f3, #fdf0fb)", borderRadius: 12, padding: "12px 14px", border: "1px solid #f0c4eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>
              {initiales}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#7b1060" }}>{user.login || "Dr. Diallo"}</div>
              <div style={{ fontSize: 11, color: "#d81bb5", fontWeight: 500 }}>Médecin chef de service</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "8px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#d1d5db", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 10px", marginBottom: 4 }}>NAVIGATION</div>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div className="nav-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 2, borderRadius: 10, background: active ? "#fce7f3" : "transparent", color: active ? "#d81bb5" : "#374151", fontWeight: active ? 600 : 500, fontSize: 13, transition: "all 0.15s", cursor: "pointer" }}>
                  <span style={{ color: active ? "#d81bb5" : "#9ca3af" }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid #f9e8f7" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", width: "100%", borderRadius: 10, background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fce7f3"; e.currentTarget.style.color = "#d81bb5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 250, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #f0e0f5", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>Maternité Darou Khoudoss · Dakar</div>
            <div style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", marginTop: 1 }}>Portail Médecin Chef</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Clock />
            {/* Search */}
            <button style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #f0e0f5", background: "#fdf8ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            {/* Bell */}
            <button style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #f0e0f5", background: "#fdf8ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d81bb5" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#d81bb5", border: "2px solid #fff" }} />
            </button>
            {/* FR */}
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", padding: "4px 10px", borderRadius: 20 }}>FR</div>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fdf8ff", border: "1px solid #f0c4eb", borderRadius: 24, padding: "4px 12px 4px 4px", cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #d81bb5, #9c27b0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                {initiales}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{user.login || "Dr. Diallo"} ▾</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "32px 36px", minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #f0e0f5", padding: "12px 36px", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", background: "#fff" }}>
          <span>❤ Maternité Darou Khoudoss · Dakar</span>
          <span>© 2026</span>
        </footer>
      </div>
    </div>
  );
}
