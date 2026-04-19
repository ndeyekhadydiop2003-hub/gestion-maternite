import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Patientes from "./pages/Patientes";
import Hospitalisation from "./pages/Hospitalisation";
import RendezVous from "./pages/RendezVous";
import Documents from "./pages/Documents";
import Compte from "./pages/Compte";

export default function SecretaireApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/patientes" element={<Patientes />} />
        <Route path="/hospitalisation" element={<Hospitalisation />} />
        <Route path="/rendez-vous" element={<RendezVous />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="*" element={<Navigate to="/secretaire" replace />} />
      </Routes>
    </Layout>
  );
}
