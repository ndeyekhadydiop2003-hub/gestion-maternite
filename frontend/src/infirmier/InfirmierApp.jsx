import React, { useState, useEffect } from 'react';
import './infirmier.css';

import Sidebar       from './components/Sidebar';
import Topbar        from './components/Topbar';
import Dashboard     from './pages/Dashboard';
import SoinsBebes    from './pages/SoinsBebes';
import SoinsPostPartum from './pages/SoinsPostPartum';
import Vaccins       from './pages/Vaccins';
import Notifications from './pages/Notifications';
import Profil        from './pages/Profil';
import api           from './services/api';

export default function InfirmierApp() {
  const [activePage,   setActivePage]   = useState('dashboard');
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    api.get('/notifications/non-lues')
      .then(res => {
        const data = res.data;
        setUnreadCount(Array.isArray(data) ? data.length : (data?.count ?? 0));
      })
      .catch(() => {});
  }, [activePage]);

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':      return <Dashboard     onNavigate={handleNavigate} />;
      case 'soins-bebes':    return <SoinsBebes    />;
      case 'soins-postpart': return <SoinsPostPartum />;
      case 'vaccins':        return <Vaccins       />;
      case 'notifications':  return <Notifications />;
      case 'profil': return <Profil onNavigate={handleNavigate} />;
      default:               return <Dashboard     onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="inf-shell">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} unreadCount={unreadCount} />
      <div className="inf-main">
        <Topbar onNavigate={handleNavigate} unreadCount={unreadCount} />
        <div className="inf-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
