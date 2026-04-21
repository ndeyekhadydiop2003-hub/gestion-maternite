import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Accueil from './pages/Accueil';
import Patientes from './pages/Patientes';
import RendezVous from './pages/RendezVous';
import SuiviGrossesse from './pages/SuiviGrossesse';
import { SuiviPostnatal, Examens, Vaccinations, Parametres } from './pages/AutresPages';

const TITLES = { accueil:'🏠 Tableau de bord', patientes:'👩 Dossiers Patientes', 'rendez-vous':'📅 Rendez-vous', 'suivi-grossesse':'🤰 Suivi Grossesse', 'suivi-postnatal':'👶 Suivi Postnatal', examens:'🔬 Examens', vaccinations:'💉 Vaccinations', parametres:'⚙️ Paramètres' };

function Header({ page, onNavigate }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const initials = user?.personnelMedical ? (user.personnelMedical.prenom?.[0]||'')+(user.personnelMedical.nom?.[0]||'') : user?.login?.[0]||'S';
  return (
    <header className="sf-header">
      <div className="sf-header__title">{TITLES[page]||'Maternité'}</div>
      <div style={{fontSize:12,color:'#9ca3af'}}>{today}</div>
      <div className="sf-header__actions">
        <button className="btn btn-outline btn-sm" onClick={()=>window.open(`${process.env.REACT_APP_API_URL||'http://localhost:8000/api'}/pdf/planning-rdv?token=${localStorage.getItem('token')}`)}>📄 PDF</button>
        <div style={{position:'relative',cursor:'pointer'}} onClick={()=>onNavigate('parametres')}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#f472b6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:13,fontWeight:700}}>
            {initials.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('accueil');
  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fdf2f8'}}><div style={{textAlign:'center'}}><div className="sf-spinner" style={{width:48,height:48,borderWidth:4,margin:'0 auto'}}/><p style={{marginTop:16,color:'#ec4899',fontFamily:'Playfair Display,serif'}}>Chargement...</p></div></div>;
  if(!user) return <Login/>;
  const renderPage = () => {
    switch(page) {
      case 'accueil': return <Accueil onNavigate={setPage}/>;
      case 'patientes': return <Patientes/>;
      case 'rendez-vous': return <RendezVous/>;
      case 'suivi-grossesse': return <SuiviGrossesse/>;
      case 'suivi-postnatal': return <SuiviPostnatal/>;
      case 'examens': return <Examens/>;
      case 'vaccinations': return <Vaccinations/>;
      case 'parametres': return <Parametres/>;
      default: return <Accueil onNavigate={setPage}/>;
    }
  };
  return (
    <div className="sf-layout">
      <Sidebar active={page} onNavigate={setPage}/>
      <main className="sf-main">
        <Header page={page} onNavigate={setPage}/>
        <div className="sf-content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppLayout/></AuthProvider>;
}
