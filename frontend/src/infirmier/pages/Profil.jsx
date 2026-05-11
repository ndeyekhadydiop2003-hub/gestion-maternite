import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

export default function Profil() {
  const [medecin,    setMedecin]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [newLogin,   setNewLogin]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState(null);
  const [showMdp,    setShowMdp]    = useState(false);
  const [ancienMdp,  setAncienMdp]  = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [mdpMsg,     setMdpMsg]     = useState(null);
  const [mdpLoading, setMdpLoading] = useState(false);

  useEffect(() => {
    api.get('/me')
      .then(res => {
        const u = res.data;
        setMedecin({
          login:     u.login      ?? '—',
          prenom:    u.prenom     ?? '—',
          nom:       u.nom        ?? '—',
          role:      u.role_acces ?? '—',
          initiales: u.prenom && u.nom
            ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase()
            : (u.login ?? '??').slice(0, 2).toUpperCase(),
        });
        setNewLogin(u.login ?? '');
      })
      .catch(err => setError(err.response?.data?.message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveLogin = async () => {
    if (!newLogin.trim()) return;
    setSaving(true); setSaveMsg(null);
    try {
      await api.put('/me', { login: newLogin });
      setMedecin(prev => ({ ...prev, login: newLogin, initiales: newLogin.slice(0, 2).toUpperCase() }));
      setEditMode(false);
      setSaveMsg({ type: 'success', text: '✓ Login mis à jour avec succès.' });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeMdp = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      setMdpMsg({ type: 'error', text: 'Tous les champs sont obligatoires.' }); return;
    }
    if (nouveauMdp !== confirmMdp) {
      setMdpMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' }); return;
    }
    if (nouveauMdp.length < 6) {
      setMdpMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' }); return;
    }
    setMdpLoading(true); setMdpMsg(null);
    try {
      await api.put('/me/password', { ancien_mdp: ancienMdp, nouveau_mdp: nouveauMdp });
      setMdpMsg({ type: 'success', text: '✓ Mot de passe modifié avec succès.' });
      setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
      setShowMdp(false);
      setTimeout(() => setMdpMsg(null), 3000);
    } catch (err) {
      setMdpMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement.' });
    } finally {
      setMdpLoading(false);
    }
  };

  if (loading) return (
    <div className="inf-page-anim" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ color: 'var(--gray)', marginTop: 12 }}>Chargement...</p>
    </div>
  );

  if (error) return (
    <div className="inf-page-anim" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}>❌</div>
      <p style={{ color: 'red', marginTop: 12 }}>{error}</p>
      <button className="inf-btn-primary" onClick={() => window.location.reload()}>Réessayer</button>
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--sand)', borderRadius: 9,
    fontSize: 13, fontFamily: 'Nunito, sans-serif',
    background: 'var(--bg)', outline: 'none', color: 'var(--dark)',
  };

  const msgStyle = (type) => ({
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14,
    background: type === 'success' ? 'var(--green-light)' : 'var(--red-light)',
    borderLeft: `4px solid ${type === 'success' ? 'var(--green)' : 'var(--red)'}`,
    color: type === 'success' ? 'var(--green)' : 'var(--red)',
  });

  const rowStyle = {
    display: 'flex', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid var(--bg)',
    gap: 10,
  };

  return (
    <div className="inf-page-anim">
      <div className="inf-page-title">
        <h2>👤 Profil</h2>
        <button
          className="inf-btn-secondary"
          onClick={() => { setEditMode(!editMode); setSaveMsg(null); }}
        >
          {editMode ? '✕ Annuler' : '✏️ Modifier'}
        </button>
      </div>

      {/* ── Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--rose-light), #fff)',
        border: '1.5px solid var(--rose-border)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--rose), var(--rose-2))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, flexShrink: 0,
        }}>
          {medecin.initiales}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)' }}>
            {medecin.prenom} {medecin.nom}
          </div>
          <div style={{ fontSize: 13, color: 'var(--rose)', fontWeight: 600, marginTop: 4 }}>
            Infirmier(e) · {medecin.login}
          </div>
          <span style={{
            display: 'inline-block', marginTop: 6,
            background: 'var(--rose-light)', color: 'var(--rose)',
            border: '1px solid var(--rose-border)',
            fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
          }}>
            🔒 {medecin.role}
          </span>
        </div>
      </div>

      {saveMsg && <div style={msgStyle(saveMsg.type)}>{saveMsg.text}</div>}

      {/* ── Informations du compte ── */}
      <div className="inf-card" style={{ marginBottom: 14 }}>
        <div className="inf-card-head"><h3>👤 Informations du compte</h3></div>
        <div style={{ padding: '4px 20px 8px' }}>

          {/* Login */}
          <div style={rowStyle}>
            <span>👤</span>
            <span style={{ color: 'var(--gray)', fontSize: 13 }}>Login</span>
            {!editMode ? (
              <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{medecin.login}</span>
            ) : (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                <input
                  style={{ ...inputStyle, maxWidth: 240 }}
                  value={newLogin}
                  onChange={e => setNewLogin(e.target.value)}
                  placeholder="Nouveau login"
                />
                <button className="inf-btn-primary" onClick={handleSaveLogin} disabled={saving}>
                  {saving ? '⏳' : '✓'}
                </button>
              </div>
            )}
          </div>

          {/* Nom complet */}
          <div style={rowStyle}>
            <span>🏷️</span>
            <span style={{ color: 'var(--gray)', fontSize: 13 }}>Nom complet</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
              {medecin.prenom} {medecin.nom}
            </span>
          </div>

          {/* Rôle */}
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span>🎭</span>
            <span style={{ color: 'var(--gray)', fontSize: 13 }}>Rôle</span>
            <span style={{ marginLeft: 'auto' }}>
              <span style={{
                background: 'var(--rose-light)', color: 'var(--rose)',
                border: '1px solid var(--rose-border)',
                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
              }}>
                {medecin.role}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Sécurité ── */}
      <div className="inf-card">
        <div className="inf-card-head"><h3>🔐 Sécurité</h3></div>
        <div style={{ padding: '4px 20px 8px' }}>

          {/* Mot de passe */}
          <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <span style={{ marginRight: 10 }}>🔒</span>
              <span style={{ color: 'var(--gray)', fontSize: 13 }}>Mot de passe</span>
              <span
                style={{ marginLeft: 'auto', color: 'var(--rose)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                onClick={() => { setShowMdp(!showMdp); setMdpMsg(null); }}
              >
                {showMdp ? 'Annuler ✕' : 'Modifier ›'}
              </span>
            </div>
            {showMdp && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {mdpMsg && <div style={msgStyle(mdpMsg.type)}>{mdpMsg.text}</div>}
                <input style={inputStyle} type="password" placeholder="Ancien mot de passe"
                  value={ancienMdp} onChange={e => setAncienMdp(e.target.value)} />
                <input style={inputStyle} type="password" placeholder="Nouveau mot de passe"
                  value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)} />
                <input style={inputStyle} type="password" placeholder="Confirmer le mot de passe"
                  value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)} />
                <button className="inf-btn-primary" onClick={handleChangeMdp} disabled={mdpLoading}>
                  {mdpLoading ? '⏳ Modification...' : '🔒 Changer le mot de passe'}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

Profil.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};