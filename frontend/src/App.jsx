import { Routes, Route } from 'react-router-dom';
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SecretaireApp from "./secretaire/SecretaireApp";
import PediatreApp from "./pediatre/PediatreApp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/secretaire/*" element={<SecretaireApp />} />
      <Route path="/pediatre/*" element={<PediatreApp />} />
    </Routes>
  );
}
