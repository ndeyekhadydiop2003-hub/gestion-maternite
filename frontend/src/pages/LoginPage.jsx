import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const loginPhoto = "/login.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ naissances: '…', satisfaction: '98%', service: '24h/7' });

  useEffect(() => {
    setLogin('');
    setPassword('');
    setError('');
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${apiUrl}/stats/public`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(r => {
        if (!r.ok) throw new Error('Erreur ' + r.status);
        return r.json();
      })
      .then(data => {
        setStats({
          naissances: data.total_naissances !== undefined
            ? Number(data.total_naissances).toLocaleString('fr-FR') + (data.total_naissances > 0 ? '+' : '')
            : '0',
          satisfaction: data.satisfaction ? data.satisfaction + '%' : '98%',
          service: '24h/7',
        });
      })
      .catch(() => {
        setStats({ naissances: '0', satisfaction: '98%', service: '24h/7' });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Identifiants incorrects');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.utilisateur));

      setLogin('');
      setPassword('');

      const role = data.utilisateur?.role_acces;

      if (role === 'secretaire')       navigate('/secretaire');
      else if (role === 'sage_femme')  navigate('/sagefemme');
      else if (role === 'admin')       navigate('/admin');
      else if (role === 'pediatre')    navigate('/pediatre');
      else if (role === 'infirmiere')  navigate('/infirmiere');
      else if (role === 'psychologue')  navigate('/psychologue');
      else                             navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily:"'Nunito', sans-serif", background:'#FFF0F5', height:'100vh', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .root { display:flex; height:calc(100vh - 2rem); max-height:800px; width:100%; max-width:1100px; border-radius:24px; overflow:hidden; border:1px solid #F8BBD9; background:#fff; box-shadow:0 8px 48px rgba(216,88,143,0.15); position:relative; }
        .back-button { position:absolute; top:16px; left:16px; z-index:10; background:rgba(255,255,255,0.3); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.4); width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:white; transition:all 0.2s ease; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
        .back-button:hover { background:rgba(255,255,255,0.5); transform:translateX(-3px); }
        .left { flex:1.3; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:3rem 2rem 2rem 2rem; color:white; }
        .left-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(136,14,79,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(136,14,79,0.75) 100%); z-index:1; }
        .brand { position:relative; z-index:3; display:flex; align-items:center; gap:15px; padding-left:60px; margin-top:0.5rem; }
        .logo-wrap { width:60px; height:60px; background:rgba(255,255,255,0.25); backdrop-filter:blur(10px); border:2px solid rgba(255,255,255,0.4); border-radius:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .brand-text h1 { font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:700; color:#fff; letter-spacing:0.01em; line-height:1.3; text-shadow:0 2px 4px rgba(0,0,0,0.2); }
        .brand-text p { font-size:11px; color:rgba(255,255,255,0.9); margin-top:3px; font-weight:500; }
        .hero { position:relative; z-index:3; margin-top:auto; margin-bottom:1rem; }
        .hero-title { font-family:'Cormorant Garamond',serif; font-size:34px; line-height:1.1; color:#fff; font-weight:600; margin-bottom:1rem; text-shadow:0 2px 10px rgba(0,0,0,0.3); }
        .hero-title em { font-style:italic; color:#F8BBD9; }
        .hero-sub { font-size:14px; line-height:1.6; color:rgba(255,255,255,0.95); max-width:360px; font-weight:400; text-shadow:0 1px 3px rgba(0,0,0,0.2); }
        .stats { position:relative; z-index:3; display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:0; }
        .stat-card { background:rgba(255,255,255,0.15); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.25); border-radius:14px; padding:14px 8px; text-align:center; transition:transform 0.3s ease; }
        .stat-card:hover { transform:translateY(-5px); background:rgba(255,255,255,0.2); }
        .stat-n { font-family:'Cormorant Garamond',serif; font-size:22px; color:#fff; font-weight:700; display:block; }
        .stat-l { font-size:10px; color:rgba(255,255,255,0.9); letter-spacing:0.08em; display:block; margin-top:4px; text-transform:uppercase; font-weight:700; }
        .right { flex:0.9; background:#FFF8FB; display:flex; flex-direction:column; justify-content:center; padding:1rem 2.5rem 1rem; position:relative; overflow:hidden; }
        .top-badge { position:absolute; top:1.5rem; right:1.5rem; display:flex; align-items:center; gap:12px; }
        .top-mini-logo { width:44px; height:44px; background:#C2185B; border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(194,24,91,0.2); }
        .top-mini-name .a { font-size:14px; font-weight:800; color:#880E4F; line-height:1.2; }
        .top-mini-name .b { font-size:11px; color:#E91E8C; font-weight:600; }
        .heading h2 { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:600; color:#880E4F; margin-bottom:8px; }
        .heading p { font-size:15px; color:#C2668A; margin-bottom:1rem; }
        .flabel { display:block; font-size:11.5px; font-weight:800; color:#AD1457; margin-bottom:10px; letter-spacing:0.07em; text-transform:uppercase; }
        .inp-wrap { position:relative; margin-bottom:0.7rem; }
        .inp-icon { position:absolute; left:18px; top:50%; transform:translateY(-50%); width:20px; height:20px; color:#CE93B8; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .inp-field { width:100%; padding:12px 18px 12px 50px; border:2px solid #F8BBD9; border-radius:18px; font-family:'Nunito',sans-serif; font-size:15px; background:#FFF0F5; color:#880E4F; outline:none; transition:all 0.3s ease; }
        .inp-field:focus { border-color:#AD1457; background:#fff; box-shadow:0 0 0 5px rgba(194,24,91,0.08); }
        .row-misc { display:flex; align-items:center; justify-content:flex-end; margin-bottom:0.8rem; }
        .forgot { font-size:14px; color:#AD1457; text-decoration:none; font-weight:700; }
        .btn-login { width:100%; padding:13px; background:#C2185B; color:#fff; border:none; border-radius:20px; font-family:'Nunito',sans-serif; font-size:15px; font-weight:700; cursor:pointer; letter-spacing:0.03em; display:flex; align-items:center; justify-content:center; gap:12px; transition:all 0.3s ease; margin-bottom:0.8rem; box-shadow:0 6px 20px rgba(194,24,91,0.25); }
        .btn-login:hover:not(:disabled) { background:#880E4F; transform:translateY(-2px); box-shadow:0 8px 25px rgba(194,24,91,0.35); }
        .btn-login:disabled { opacity:0.7; cursor:not-allowed; }
        .error-box { background:#FFF0F0; border:1px solid #F8BBD9; border-left:4px solid #C2185B; border-radius:12px; padding:12px 16px; margin-bottom:1.2rem; font-size:13px; color:#880E4F; font-weight:600; }
        .sec-note { display:flex; align-items:flex-start; gap:12px; background:#FCE4EC; border-radius:14px; border:1px solid #F8BBD9; padding:10px 16px; margin-top:0.5rem; }
        .sec-note p { font-size:12px; color:#880E4F; line-height:1.6; font-weight:500; }
        @media (max-width:1000px) { .left { display:none; } .root { max-width:600px; } .back-button { color:#C2185B; background:#FCE4EC; border-color:#F8BBD9; } }
      `}</style>

      <div className="root">

        <button className="back-button" onClick={() => navigate('/')} title="Retour">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        {/* ═══ GAUCHE ═══ */}
        <div className="left">
          <div style={{ position:'absolute', inset:0, backgroundImage:`url(${loginPhoto})`, backgroundSize:'cover', backgroundPosition:'center', zIndex:0 }}/>
          <div className="left-overlay"/>
          <div className="brand">
            <div className="logo-wrap">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <path d="M16 7C16 7 9 3.5 6 8.5C3 13.5 7.5 18.5 11.5 20.5L16 25L20.5 20.5C24.5 18.5 29 13.5 26 8.5C23 3.5 16 7 16 7Z" fill="rgba(255,255,255,0.95)"/>
                <path d="M10.5 15H12.5L14 12L16 19L17.5 14L19 15H21.5" stroke="#C2185B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1>Maternité CHRANT</h1>
              <p>Service Gynécologie-Obstétrique · Thies</p>
            </div>
          </div>
          <div className="hero">
            <h2 className="hero-title">Chaque naissance<br/>mérite une <em>attention<br/>parfaite</em></h2>
            <p className="hero-sub">Système de gestion numérique sécurisé pour le suivi complet des patientes et des nouveau-nés.</p>
          </div>
          <div className="stats">
            {[
              { n: stats.naissances,   l: 'Naissances'   },
              { n: stats.satisfaction, l: 'Satisfaction'  },
              { n: stats.service,      l: 'Service'       },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <span className="stat-n">{s.n}</span>
                <span className="stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ DROITE ═══ */}
        <div className="right">
          <div className="top-badge">
            <div className="top-mini-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 21C12 21 3 14 3 8.5C3 5.4 5.4 3 8.5 3C10.1 3 11.6 3.8 12 5C12.4 3.8 13.9 3 15.5 3C18.6 3 21 5.4 21 8.5C21 14 12 21 12 21Z"/>
              </svg>
            </div>
            <div className="top-mini-name">
              <div className="a">Maternité CHRANT</div>
              <div className="b">Portail Médical Sécurisé</div>
            </div>
          </div>

          <div className="heading" style={{ marginTop: '1rem' }}>
            <h2>Bienvenue</h2>
            <p>Accédez à votre espace professionnel</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="flabel">Identifiant</label>
            <div className="inp-wrap">
              <div className="inp-icon">👤</div>
              <input
                type="text"
                value={login}
                autoComplete="off"
                onChange={e => setLogin(e.target.value)}
                className="inp-field"
                placeholder="Votre identifiant"
              />
            </div>

            <label className="flabel">Mot de passe</label>
            <div className="inp-wrap">
              <div className="inp-icon">🔒</div>
             <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          onInput={(e) => setPassword(e.target.value)} 
          className="inp-field"
          placeholder="Votre mot de passe"
        />
            </div>

            <div className="row-misc">
              <a href="#" className="forgot">Mot de passe oublié ?</a>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Connexion en cours…' : 'Se connecter →'}
            </button>
          </form>

          <div className="sec-note">
            <div style={{ fontSize: '18px', marginTop: '2px' }}>🛡️</div>
            <p>Environnement de santé sécurisé. Vos accès sont journalisés pour garantir la confidentialité des données patientes.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;