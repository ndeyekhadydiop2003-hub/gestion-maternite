import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SecretaireApp from "./secretaire/SecretaireApp";

// ── Page 403 ──────────────────────────────────────────────────────────────────
function NonAutorise() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", background: "#FFF0F5"
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>⛔</div>
      <h1 style={{ fontSize: 28, color: "#880E4F", margin: 0 }}>Accès non autorisé</h1>
      <p style={{ fontSize: 14, color: "#C2668A", marginTop: 10 }}>
        Vous n'avez pas les droits pour accéder à cette page.
      </p>
      <a href="/login" style={{
        marginTop: 20, color: "#fff", background: "#C2185B",
        padding: "10px 28px", borderRadius: 20, fontSize: 14,
        textDecoration: "none", fontWeight: 700,
        boxShadow: "0 4px 14px rgba(194,24,91,0.3)"
      }}>← Retour à la connexion</a>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Page de connexion */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Espace Secrétaire ──────────────────────────────────────────────
            role_acces doit valoir exactement "secretaire" dans votre BDD     */}
        <Route
          path="/secretaire/*"
          element={
            <ProtectedRoute roles={["secretaire"]}>
              <SecretaireApp />
            </ProtectedRoute>
          }
        />

        {/* ── Autres espaces à décommenter quand prêts ──────────────────────
        <Route
          path="/sagefemme/*"
          element={
            <ProtectedRoute roles={["sage_femme", "sage-femme", "gynecologue"]}>
              <SageFemmeApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medecin/*"
          element={
            <ProtectedRoute roles={["medecin"]}>
              <MedecinApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pediatre/*"
          element={
            <ProtectedRoute roles={["pediatre"]}>
              <PediatreApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["admin", "administrateur"]}>
              <AdminApp />
            </ProtectedRoute>
          }
        />
        ─────────────────────────────────────────────────────────────────── */}

        {/* Page accès refusé */}
        <Route path="/non-autorise" element={<NonAutorise />} />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
