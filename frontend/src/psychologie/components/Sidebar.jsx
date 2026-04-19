import { Calendar, Users, Folder, Activity, FileText, Package, User, LayoutDashboard, LogOut, Heart } from "lucide-react";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "agenda",    icon: Calendar,        label: "Agenda" },
  { id: "dossiers",  icon: Folder,          label: "Dossiers" },
  { id: "patients",  icon: Users,           label: "Patients" },
  { id: "suivis",    icon: Activity,        label: "Suivis" },
  { id: "messages",  icon: FileText,        label: "Messages" },
  { id: "stock",     icon: Package,         label: "Stock" },
  { id: "profil",    icon: User,            label: "Profil" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--bg-sidebar)",
      borderRight: "1.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
      boxShadow: "2px 0 16px rgba(168,139,250,0.07)",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 28px", borderBottom: "1.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg, var(--primary), var(--rose))",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(176,136,249,0.4)",
          }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-dark)", lineHeight: 1.2 }}>Gestion</div>
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.78rem", color: "var(--primary)", lineHeight: 1.2 }}>Psychologie</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map(({ id, icon: Icon, label }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 12,
                border: "none",
                background: active ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "transparent",
                color: active ? "white" : "var(--text-medium)",
                fontFamily: "Nunito",
                fontWeight: active ? 700 : 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                marginBottom: 4,
                transition: "all 0.15s",
                boxShadow: active ? "0 4px 12px rgba(139,92,246,0.3)" : "none",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#ede9fe"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 12px", borderTop: "1.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, var(--primary), var(--rose))",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: "0.85rem",
          }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-dark)" }}>Antoine</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-medium)" }}>Psychologue</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.78rem" }}>
          <LogOut size={14} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
