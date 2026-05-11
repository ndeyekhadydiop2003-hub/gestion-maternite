import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SecretaireApp from "./secretaire/SecretaireApp";
import MedecinApp from "./medecin_chef/MedecinApp";
import PediatreApp from "./pediatre/PediatreApp";

function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) return <Navigate to="/login" replace />;
  if (role && user.role_acces !== role) return <Navigate to="/login" replace />;
  return children;
}



export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/secretaire/*" element={
          <ProtectedRoute role="secretaire">
            <SecretaireApp />
          </ProtectedRoute>
        } />

        <Route path="/medecin_chef/*" element={
          <ProtectedRoute role="medecin_chef">
            <MedecinApp />
          </ProtectedRoute>
        } />

        <Route path="/pediatre/*" element={
          <ProtectedRoute role="pediatre">
            <PediatreApp />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
   
  );

  
}