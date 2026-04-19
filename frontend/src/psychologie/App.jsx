import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Dossiers from "./pages/Dossiers";
import Patients from "./pages/Patients";
import Suivis from "./pages/Suivis";
import Messages from "./pages/Messages";
import "./styles.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard onNavigate={setActivePage} />,
    agenda: <Agenda />,
    dossiers: <Dossiers />,
    patients: <Patients />,
    suivis: <Suivis />,
    messages: <Messages />,
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {pages[activePage] || <Dashboard onNavigate={setActivePage} />}
      </main>
    </div>
  );
}
