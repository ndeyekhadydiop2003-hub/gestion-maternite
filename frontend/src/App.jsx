import { Routes, Route } from 'react-router-dom';
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SecretaireApp from "./secretaire/SecretaireApp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/secretaire/*" element={<SecretaireApp />} />
    </Routes>
  );
}
