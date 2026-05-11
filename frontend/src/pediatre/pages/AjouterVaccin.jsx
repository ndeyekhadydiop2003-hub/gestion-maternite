import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const VACCINS_LISTE = [
  { value: 'BCG',         label: 'BCG' },
  { value: 'Hepatite_B',  label: 'Hépatite B' },
  { value: 'Polio',       label: 'Poliomyélite' },
  { value: 'Pentavalent', label: 'Pentavalent' },
  { value: 'Rotavirus',   label: 'Rotavirus' },
  { value: 'Autre',       label: 'Autre' },
];

const getIdPersonnel = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id_personnel ?? 1;
  } catch { return 1; }
};

const getNomBebe = (b) => {
  if (!b) return null;
  const p = b.patiente ?? b.accouchement?.grossesse?.patiente;
  if (p) return `Bébé de ${p.prenom ?? ''} ${p.nom ?? ''}`.trim();
  return `Nouveau-né #${b.id_nouveau_ne}`;
};

// ── id        = id du bébé
// ── idVaccin  = id du vaccin à modifier (mode édition)
export default function AjouterVaccin({ onNavigate, id, idVaccin }) {
  const [bebe,        setBebe]        = useState(null);
  const [babies,      setBabies]      = useState([]);
  const [personnel,   setPersonnel]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingInit, setLoadingInit] = useState(!!idVaccin);
  const [error,       setError]       = useState(null);
  const [success,     setSuccess]     = useState(false);
  const [form,        setForm]        = useState({
    id_nouveau_ne: id ? String(id) : '',
    nom_vaccin:    '',
    observations:  '',
    id_assigne:    '',
  });

  const isModification = !!idVaccin;

  // ── Charger infirmiers + sages-femmes ──
  useEffect(() => {
    api.get('/personnel-medical')
      .then(res => {
        const all     = res.data?.data ?? res.data ?? [];
        const filtres = Array.isArray(all) ? all.filter(p => {
          const role = p.utilisateur?.role_acces ?? '';
          return role === 'infirmiere' || role === 'infirmier' || role === 'sage_femme';
        }) : [];
        setPersonnel(filtres);
      })
      .catch(() => {});
  }, []);

  // ── Mode édition : charger le vaccin existant directement ──
  useEffect(() => {
    if (!idVaccin) return;
    api.get(`/vaccins/${idVaccin}`)
      .then(res => {
        const v = res.data;
        setForm({
          id_nouveau_ne: String(v.id_nouveau_ne ?? id ?? ''),
          nom_vaccin:    v.nom_vaccin    ?? '',
          observations:  v.observations  ?? '',
          id_assigne:    v.id_assigne ? String(v.id_assigne) : '',
        });
      })
      .catch(() => setError('Impossible de charger le vaccin.'))
      .finally(() => setLoadingInit(false));
  }, [idVaccin, id]);

  // ── Charger le bébé ──
  useEffect(() => {
    const idBebe = id
      ? Number(id)
      : form.id_nouveau_ne ? Number(form.id_nouveau_ne) : null;
    if (!idBebe) return;
    api.get(`/nouveau-nes/${idBebe}`)
      .then(res => setBebe(res.data))
      .catch(() => setBebe(null));
  }, [id, form.id_nouveau_ne]);

  // ── Charger liste bébés si pas d'id ──
  useEffect(() => {
    if (id) return;
    api.get('/nouveau-nes?per_page=100')
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        setBabies(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getPersonnelLabel = (p) => {
    const u    = p.utilisateur;
    const nom  = u ? `${u.prenom} ${u.nom}` : `Personnel #${p.id_personnel}`;
    const role = u?.role_acces === 'sage_femme' ? 'Sage-femme' : 'Infirmier(e)';
    return `${nom} — ${role}`;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const idNouveauNe = id ?? Number(form.id_nouveau_ne);

      const payload = {
        id_nouveau_ne:       idNouveauNe,
        nom_vaccin:          form.nom_vaccin,
        statut:              'prevu',
        date_administration: null,
        lot:                 null,
        site_injection:      null,
        observations:        form.observations || null,
        id_assigne:          form.id_assigne ? Number(form.id_assigne) : null,
        id_personnel:        getIdPersonnel(),
      };

      if (isModification) {
        await api.put(`/vaccins/${idVaccin}`, payload);
      } else {
        await api.post('/vaccins', payload);
      }

      setSuccess(true);
      onNavigate(id ? 'dossier-detail' : 'dossiers', payload.id_nouveau_ne ?? id);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' — '));
      } else {
        setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nomBebe = getNomBebe(bebe);

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--sand)', fontSize: 13,
    fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff',
    outline: 'none', transition: 'border-color .2s',
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, display: 'block',
    marginBottom: 6, color: 'var(--dark)',
  };

  const sectionStyle = {
    background: '#fff8fb', borderRadius: 10,
    border: '1.5px solid var(--sand)', padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 14,
  };

  const sectionTitle = {
    fontSize: 13, fontWeight: 700, color: 'var(--rose-2)', marginBottom: 2,
  };

  if (loadingInit) return (
    <div className="page-anim" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ color: 'var(--gray)', marginTop: 12 }}>Chargement...</p>
    </div>
  );

  return (
    <div className="page-anim">

      {/* ── En-tête ── */}
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn-primary btn-sm"
            style={{ background: 'var(--bg)', color: 'var(--dark)', border: '1.5px solid var(--sand)' }}
            onClick={() => onNavigate(id ? 'dossier-detail' : 'soins', id ?? null)}
          >
            ← Retour
          </button>
          <h2>{isModification ? '✏️ Modifier la planification' : '💉 Planifier un vaccin'}</h2>
        </div>
      </div>

      {/* ── Badge bébé ── */}
      {nomBebe && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 20, padding: '12px 16px',
          background: 'var(--rose-light)', borderRadius: 10,
          fontSize: 13, fontWeight: 600, color: 'var(--rose-2)',
          border: '1px solid var(--rose-border)',
        }}>
          <span style={{ fontSize: 20 }}>👶</span>
          {nomBebe}
        </div>
      )}

      {/* ── Badge modification ── */}
      {isModification && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 16, padding: '10px 16px',
          background: '#eff6ff', borderRadius: 10,
          fontSize: 13, fontWeight: 600, color: '#2563eb',
          border: '1px solid #bfdbfe',
        }}>
          ✏️ Modification — <strong style={{ marginLeft: 4 }}>{form.nom_vaccin?.replace(/_/g, ' ')}</strong>
        </div>
      )}

      <div className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="card-head">
          <h3>💉 Planification vaccinale</h3>
          {isModification && <span className="badge b-rose">Modification</span>}
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Sélection bébé si pas d'id ── */}
          {!id && (
            <div>
              <label style={labelStyle}>
                Bébé concerné <span style={{ color: 'red' }}>*</span>
              </label>
              <select name="id_nouveau_ne" value={form.id_nouveau_ne}
                onChange={handleChange} style={inputStyle}>
                <option value="">— Sélectionner un bébé —</option>
                {babies.map(b => (
                  <option key={b.id_nouveau_ne} value={b.id_nouveau_ne}>
                    {getNomBebe(b) ?? `Nouveau-né #${b.id_nouveau_ne}`}
                    {' '}— NB{String(b.id_nouveau_ne).padStart(4, '0')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Vaccin ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>💉 Vaccin</div>
            <div>
              <label style={labelStyle}>
                Vaccin <span style={{ color: 'red' }}>*</span>
              </label>
              <select name="nom_vaccin" value={form.nom_vaccin}
                onChange={handleChange}
                style={inputStyle}
                disabled={isModification} // ── En modification, on ne change pas le vaccin
              >
                <option value="">— Sélectionner —</option>
                {VACCINS_LISTE.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              {isModification && (
                <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>
                  Le type de vaccin ne peut pas être modifié.
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Statut</label>
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--rose-light)', border: '1.5px solid var(--rose-border)',
                fontSize: 13, color: 'var(--rose-2)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                📅 Prévu
              </div>
            </div>
          </div>

          {/* ── Assigné à ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>👤 Assigné à</div>
            <div>
              <label style={labelStyle}>Infirmier(e) / Sage-femme</label>
              <select name="id_assigne" value={form.id_assigne}
                onChange={handleChange} style={inputStyle}>
                <option value="">— Non assigné —</option>
                {personnel.map(p => (
                  <option key={p.id_personnel} value={p.id_personnel}>
                    {getPersonnelLabel(p)}
                  </option>
                ))}
              </select>
              {personnel.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6 }}>
                  Aucun infirmier ou sage-femme disponible.
                </div>
              )}
            </div>
          </div>

          {/* ── Observations ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>📝 Observations</div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea name="observations" value={form.observations}
                onChange={handleChange}
                placeholder="Instructions particulières, contre-indications..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          {/* ── Erreur ── */}
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: 8, padding: '12px 16px',
              color: '#dc2626', fontSize: 13,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span>❌</span><span>{error}</span>
            </div>
          )}

          {/* ── Succès ── */}
          {success && (
            <div style={{
              background: '#dcfce7', border: '1px solid #86efac',
              borderRadius: 8, padding: '12px 16px',
              color: '#16a34a', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✅</span>
              Vaccin {isModification ? 'mis à jour' : 'planifié'} avec succès ! Redirection...
            </div>
          )}

          {/* ── Boutons ── */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'flex-end',
            paddingTop: 8, borderTop: '1px solid var(--sand)', marginTop: 4,
          }}>
            <button className="btn-secondary"
              onClick={() => onNavigate(id ? 'dossier-detail' : 'soins', id ?? null)}
              disabled={loading} style={{ minWidth: 100 }}>
              Annuler
            </button>
            <button className="btn-primary" onClick={handleSubmit}
              disabled={loading || !form.nom_vaccin || (!id && !form.id_nouveau_ne)}
              style={{ minWidth: 180 }}>
              {loading
                ? '⏳ Enregistrement...'
                : isModification
                ? '✏️ Sauvegarder'
                : '📅 Planifier le vaccin'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

AjouterVaccin.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  id:         PropTypes.number,
  idVaccin:   PropTypes.number,
};