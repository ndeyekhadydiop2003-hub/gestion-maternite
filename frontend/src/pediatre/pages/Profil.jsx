import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

export default function Profil() {
  const [medecin,   setMedecin]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // ── Mode édition login ──
  const [editMode,  setEditMode]  = useState(false);
  const [newLogin,  setNewLogin]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState(null);

  // ── Changement mot de passe ──
  const [showMdp,   setShowMdp]   = useState(false);
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp,setNouveauMdp]= useState('');
  const [confirmMdp,setConfirmMdp]= useState('');
  const [mdpMsg,    setMdpMsg]    = useState(null);
  const [mdpLoading,setMdpLoading]= useState(false);

  useEffect(() => {
    api.get('/me')
      .then(res => {
        const u = res.data;
        setMedecin({
          login:     u.login      ?? '—',
          role:      u.role_acces ?? '—',
          initiales: u.login ? u.login.slice(0, 2).toUpperCase() : '?',
        });
        setNewLogin(u.login ?? '');
      })
      .catch(err => setError(err.response?.data?.message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Sauvegarder login ──
  const handleSaveLogin = async () => {
    if (!newLogin.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await api.put('/me', { login: newLogin });
      setMedecin(prev => ({
        ...prev,
        login:     newLogin,
        initiales: newLogin.slice(0, 2).toUpperCase(),
      }));
      setEditMode(false);
      setSaveMsg({ type: 'success', text: '✓ Login mis à jour avec succès.' });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Changer mot de passe ──
  const handleChangeMdp = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      setMdpMsg({ type: 'error', text: 'Tous les champs sont obligatoires.' });
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setMdpMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (nouveauMdp.length < 6) {
      setMdpMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    setMdpLoading(true);
    setMdpMsg(null);
    try {
      await api.put('/me/password', {
        ancien_mdp:  ancienMdp,
        nouveau_mdp: nouveauMdp,
      });
      setMdpMsg({ type: 'success', text: '✓ Mot de passe modifié avec succès.' });
      setAncienMdp('');
      setNouveauMdp('');
      setConfirmMdp('');
      setShowMdp(false);
      setTimeout(() => setMdpMsg(null), 3000);
    } catch (err) {
      setMdpMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement.' });
    } finally {
      setMdpLoading(false);
    }
  };

  if (loading) return (
    <div className="page-anim" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ color: 'var(--gray)', marginTop: 12 }}>Chargement...</p>
    </div>
  );

  if (error) return (
    <div className="page-anim" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}>❌</div>
      <p style={{ color: 'red', marginTop: 12 }}>{error}</p>
      <button className="btn-primary btn-sm" onClick={() => window.location.reload()}>
        Réessayer
      </button>
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--sand)', borderRadius: 9,
    fontSize: 13, fontFamily: 'DM Sans, sans-serif',
    background: 'var(--bg)', outline: 'none', color: 'var(--dark)',
  };

  const msgStyle = (type) => ({
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14,
    background: type === 'success' ? 'var(--teal-light)' : 'var(--red-light)',
    borderLeft: `4px solid ${type === 'success' ? 'var(--teal)' : 'var(--red)'}`,
    color: type === 'success' ? 'var(--teal)' : 'var(--red)',
  });

  return (
    <div className="page-anim">
      <div className="page-title">
        <h2>Profil</h2>
        <button
          className="btn-primary btn-sm"
          onClick={() => { setEditMode(!editMode); setSaveMsg(null); }}
        >
          {editMode ? '✕ Annuler' : '✏️ Modifier'}
        </button>
      </div>

      {/* ── Banner ── */}
      <div className="profil-banner">
        <div className="profil-ava">{medecin.initiales}</div>
        <div>
          <div className="profil-name">{medecin.login}</div>
          <div className="profil-role">{medecin.role}</div>
          <div className="profil-badge">🔒 {medecin.role}</div>
        </div>
      </div>

      {/* ── Message global ── */}
      {saveMsg && <div style={msgStyle(saveMsg.type)}>{saveMsg.text}</div>}

      {/* ── Informations du compte ── */}
      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <div className="profil-section-title">👤 Informations du compte</div>

        {/* Login */}
        <div className="profil-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <span className="pr-icon">👤</span>
            <span>Login</span>
            {!editMode && (
              <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{medecin.login}</span>
            )}
          </div>
          {editMode && (
            <div style={{ width: '100%', display: 'flex', gap: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={newLogin}
                onChange={e => setNewLogin(e.target.value)}
                placeholder="Nouveau login"
              />
              <button
                className="btn-primary btn-sm"
                onClick={handleSaveLogin}
                disabled={saving}
              >
                {saving ? '⏳' : '✓ Sauvegarder'}
              </button>
            </div>
          )}
        </div>

        {/* Rôle */}
        <div className="profil-row">
          <span className="pr-icon">🏷️</span>
          <span>Rôle</span>
          <span style={{ marginLeft: 'auto' }}>
            <span className="badge b-purple">{medecin.role}</span>
          </span>
        </div>
      </div>

      {/* ── Sécurité ── */}
      <div className="card card-pad">
        <div className="profil-section-title">🔐 Sécurité</div>

        {/* Mot de passe */}
        <div className="profil-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <span className="pr-icon">🔒</span>
            <span>Mot de passe</span>
            <span
              style={{ marginLeft: 'auto', color: 'var(--rose-2)', cursor: 'pointer', fontSize: 13 }}
              onClick={() => { setShowMdp(!showMdp); setMdpMsg(null); }}
            >
              {showMdp ? 'Annuler ✕' : 'Modifier ›'}
            </span>
          </div>

          {showMdp && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mdpMsg && <div style={msgStyle(mdpMsg.type)}>{mdpMsg.text}</div>}
              <input
                style={inputStyle}
                type="password"
                placeholder="Ancien mot de passe"
                value={ancienMdp}
                onChange={e => setAncienMdp(e.target.value)}
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="Nouveau mot de passe"
                value={nouveauMdp}
                onChange={e => setNouveauMdp(e.target.value)}
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmMdp}
                onChange={e => setConfirmMdp(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={handleChangeMdp}
                disabled={mdpLoading}
                style={{ justifyContent: 'center' }}
              >
                {mdpLoading ? '⏳ Modification...' : '🔒 Changer le mot de passe'}
              </button>
            </div>
          )}
        </div>

        <div className="profil-row">
          <span className="pr-icon">📱</span>
          <span>Authentification à deux facteurs</span>
          <span className="badge b-normal" style={{ marginLeft: 'auto' }}>Activée</span>
        </div>
        <div className="profil-row">
          <span className="pr-icon">🖥️</span>
          <span>Sessions actives</span>
          <span className="badge b-rose" style={{ marginLeft: 'auto' }}>3 activées</span>
        </div>
      </div>
    </div>
  );
}



Profil.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};