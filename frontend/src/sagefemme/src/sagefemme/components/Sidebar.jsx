import React from 'react';
import { useAuth } from '../context/AuthContext';
const navItems = [
  { id: 'accueil', label: 'Accueil', icon: '🏠' },
  { id: 'patientes', label: 'Patientes', icon: '👩' },
  { id: 'rendez-vous', label: 'Rendez-vous', icon: '📅' },
  { id: 'suivi-grossesse', label: 'Suivi Grossesse', icon: '🤰' },
  { id: 'suivi-postnatal', label: 'Suivi Postnatal', icon: '👶' },
  { id: 'examens', label: 'Examens', icon: '🔬' },
  { id: 'vaccinations', label: 'Vaccinations', icon: '💉' },
  { id: 'parametres', label: 'Paramètres', icon: '⚙️' },
];
export default function Sidebar({ active, onNavigate }) {
  const { user, logout } = useAuth();
  const pm = user?.personnelMedical;
  const name = pm ? pm.prenom + ' ' + pm.nom : user?.login || 'Sage-femme';
  const initials = pm ? (pm.prenom?.[0] || '') + (pm.nom?.[0] || '') : (user?.login?.[0] || 'S');
  return (
    <aside className="sf-sidebar">
      <div className="sf-sidebar__logo"><h2>Maternité</h2><span>Gestion médicale</span></div>
      <div className="sf-sidebar__user">
        <div className="sf-sidebar__avatar">{initials.toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sf-sidebar__user-name">{name}</div>
          <div className="sf-sidebar__user-role">Sage-femme</div>
        </div>
      </div>
      <nav className="sf-sidebar__nav">
        {navItems.map(item => (
          <button key={item.id} className={'sf-nav-item' + (active === item.id ? ' active' : '')}
            onClick={() => onNavigate(item.id)}>
            <span className="icon">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="sf-sidebar__logout">
        <button onClick={logout}>🚪 Se déconnecter</button>
      </div>
    </aside>
  );
}
