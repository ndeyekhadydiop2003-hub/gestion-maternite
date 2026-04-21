import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form.login, form.password); }
    catch { setError('Identifiants incorrects.'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fdf2f8,#fce7f3,#fbcfe8)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:20,padding:'44px 38px',width:'100%',maxWidth:400,boxShadow:'0 24px 60px rgba(236,72,153,.12)',border:'1px solid #fce7f3'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:68,height:68,borderRadius:'50%',background:'linear-gradient(135deg,#f472b6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 14px'}}>🏥</div>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:24,fontWeight:600,color:'#1f2937',marginBottom:6}}>Maternité</h1>
          <p style={{fontSize:13,color:'#9ca3af'}}>Système de gestion médicale</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="sf-alert sf-alert-error">{error}</div>}
          <div className="sf-form">
            <div className="sf-field"><label>Identifiant</label><input type="text" placeholder="Votre login" value={form.login} onChange={e=>setForm(p=>({...p,login:e.target.value}))} required/></div>
            <div className="sf-field"><label>Mot de passe</label><input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/></div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center',marginTop:6}} disabled={loading}>{loading?'⏳ Connexion...':'🔐 Se connecter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}