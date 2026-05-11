import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import ValiderDossiers from "./pages/ValiderDossiers";
import Personnel from "./pages/Personnel";
import Dossiers from "./pages/Dossiers";
import Rapports from "./pages/Rapports";
import Compte from "./pages/Compte";

export default function MedecinApp() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Accueil />} />
        <Route path="valider-dossiers" element={<ValiderDossiers />} />
        <Route path="personnel" element={<Personnel />} />
        <Route path="dossiers" element={<Dossiers />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="compte" element={<Compte />} />
        <Route path="*" element={<Navigate to="/medecin_chef" replace />} />
      </Routes>
    </Layout>
  );
}
