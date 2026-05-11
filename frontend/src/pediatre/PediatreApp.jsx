import React, { useState } from 'react';
import './pediatre.css';

// Components
import Sidebar    from './components/Sidebar';
import Topbar     from './components/Topbar';
import RightPanel from './components/RightPanel';

// Pages
import Dashboard     from './pages/Dashboard';
import NouveauNes    from './pages/NouveauNes';
import Dossiers      from './pages/Dossiers';
import DossierDetail from './pages/DossierDetail';
import Croissance    from './pages/Croissance';
import Soins         from './pages/Soins';
import Vaccins       from './pages/Vaccins';
import Notifications from './pages/Notifications';
import Profil        from './pages/Profil';
import AjouterBebe   from './pages/AjouterBebe';

import AjouterConsultation from './pages/AjouterConsultation';
import AjouterTraitement   from './pages/AjouterTraitement';
import PlanifierSoin       from './pages/PlanifierSoin';
import AjouterVaccin       from './pages/AjouterVaccin';

export default function PediatreApp() {
  const [activePage,            setActivePage]            = useState('dash');
  const [selectedBabyId,        setSelectedBabyId]        = useState(null);
  const [selectedSoinId,        setSelectedSoinId]        = useState(null);
  const [selectedPrescriptionId,setSelectedPrescriptionId]= useState(null);
  const [selectedVaccinId,      setSelectedVaccinId]      = useState(null);

  const handleNavigate = (page, id = null, idSoin = null, idPrescription = null, idVaccin = null) => {
    console.log('navigate:', page, 'id:', id, 'idSoin:', idSoin, 'idPrescription:', idPrescription, 'idVaccin:', idVaccin);
    setActivePage(page);
    setSelectedBabyId(id             ?? null);
    setSelectedSoinId(idSoin         ?? null);
    setSelectedPrescriptionId(idPrescription ?? null);
    setSelectedVaccinId(idVaccin     ?? null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dash':           return <Dashboard     onNavigate={handleNavigate} />;
      case 'nouveau-nes':    return <NouveauNes    onNavigate={handleNavigate} />;
      case 'dossiers':       return <Dossiers      onNavigate={handleNavigate} />;
      case 'dossier-detail': return <DossierDetail onNavigate={handleNavigate} id={selectedBabyId} />;

      case 'ajouter-consultation':
        return <AjouterConsultation onNavigate={handleNavigate} id={selectedBabyId} />;

      case 'ajouter-traitement':
        return <AjouterTraitement   onNavigate={handleNavigate} id={selectedBabyId} idPrescription={selectedPrescriptionId} />;

      case 'planifier-soin':
        return <PlanifierSoin       onNavigate={handleNavigate} id={selectedBabyId} idSoin={selectedSoinId} />;

      case 'ajouter-vaccin':
        return <AjouterVaccin       onNavigate={handleNavigate} id={selectedBabyId} idVaccin={selectedVaccinId} />;

      case 'vaccins':        return <Vaccins       onNavigate={handleNavigate} />;
      case 'notifications':  return <Notifications />;
      case 'profil':         return <Profil />;
      case 'croissance':     return <Croissance    onNavigate={handleNavigate} />;
      case 'soins':          return <Soins         onNavigate={handleNavigate} />;
      case 'ajouter-bebe':   return <AjouterBebe   onNavigate={handleNavigate} />;

      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="shell">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <div className="main">
        <Topbar onNavigate={handleNavigate} />
        <div className="content-area">
          <div className="main-panel">
            {renderPage()}
          </div>
          <RightPanel babyId={selectedBabyId} onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}