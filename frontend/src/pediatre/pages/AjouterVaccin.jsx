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

export default function AjouterVaccin({ onNavigate, id }) {
  const [bebe, setBebe]       = useState(null);
  const [babies, setBabies]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm]       = useState({
    id_nouveau_ne:     id ? String(id) : '',
    nom_vaccin:        '',
    date_administration: '',
    statut:            'fait',
    lot:               '',
    site_injection:    '',
    observations:      '',
  });

  useEffect(() => {
    if (!id) return;
    api.get(`/nouveau-nes/${id}`)
      .then(res => setBebe(res.data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (id) return;
    api.get('/nouveau-nes?per_page=100')
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        setBabies(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (id || !form.id_nouveau_ne) return;
    api.get(`/nouveau-nes/${form.id_nouveau_ne}`)
      .then(res => setBebe(res.data))
      .catch(() => setBebe(null));
  }, [form.id_nouveau_ne, id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getBabyLabel = (b) => {
    const patiente = b.accouchement?.grossesse?.patiente;
    return patiente
      ? `Bébé de ${patiente.prenom} ${patiente.nom}`
      : `Nouveau-né #${b.id_nouveau_ne}`;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const idNouveauNe = id ?? Number(form.id_nouveau_ne);

      await api.post('/vaccins', {
        id_nouveau_ne:     idNouveauNe,
        nom_vaccin:        form.nom_vaccin,
        date_administration: form.date_administration || null,
        statut:            form.statut,
        lot:               form.lot               || null,
        site_injection:    form.site_injection    || null,
        observations:      form.observations      || null,
        id_personnel:      getIdPersonnel(),
      });

      setSuccess(true);
      setTimeout(() => onNavigate(id ? 'dossier-detail' : 'vaccins', idNouveauNe), 1500);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' — '));
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
      }
    } finally {
      setLoading(false);
    }
  };

  const patiente = bebe?.accouchement?.grossesse?.patiente;
  const nomBebe  = patiente
    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
    : bebe ? `Nouveau-né #${bebe.id_nouveau_ne}` : null;

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: '1.5px solid var(--sand)', fontSize: 14,
    fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff',
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

  return (
    <div className="page-anim">

      {/* ── En-tête ── */}
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn-primary btn-sm"
            style={{ background: 'var(--bg)', color: 'var(--dark)', border: '1.5px solid var(--sand)' }}
            onClick={() => onNavigate(id ? 'dossier-detail' : 'vaccins', id ?? null)}
          >
            ← Retour
          </button>
          <h2>Enregistrer un vaccin</h2>
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

      <div className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="card-head">
          <h3>💉 Informations du vaccin</h3>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sélection bébé */}
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
                    {getBabyLabel(b)} — NB{String(b.id_nouveau_ne).padStart(4, '0')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Vaccin + Statut ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>
                Vaccin <span style={{ color: 'red' }}>*</span>
              </label>
              <select name="nom_vaccin" value={form.nom_vaccin}
                onChange={handleChange} style={inputStyle}>
                <option value="">— Sélectionner —</option>
                {VACCINS_LISTE.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <select name="statut" value={form.statut}
                onChange={handleChange} style={inputStyle}>
                <option value="fait">✓ Fait</option>
                <option value="prevu">📅 Prévu</option>
                <option value="non_fait">✗ Non fait</option>
              </select>
            </div>
          </div>

          {/* ── Date + Site injection ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Date d&apos;administration</label>
              <input type="date" name="date_administration" value={form.date_administration}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Site d&apos;injection</label>
              <input type="text" name="site_injection" value={form.site_injection}
                onChange={handleChange} placeholder="ex : Bras gauche, Cuisse droite..."
                style={inputStyle} />
            </div>
          </div>

          {/* ── Numéro de lot ── */}
          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)' }}>
              📦 Traçabilité
            </div>
            <div>
              <label style={labelStyle}>Numéro de lot</label>
              <input type="text" name="lot" value={form.lot}
                onChange={handleChange} placeholder="ex : LOT-2024-BCG-001"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Observations</label>
              <textarea name="observations" value={form.observations}
                onChange={handleChange}
                placeholder="Réactions, remarques particulières..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: 8, padding: '12px 16px',
              color: '#dc2626', fontSize: 13,
            }}>
              ❌ {error}
            </div>
          )}

          {/* Succès */}
          {success && (
            <div style={{
              background: '#dcfce7', border: '1px solid #86efac',
              borderRadius: 8, padding: '12px 16px',
              color: '#16a34a', fontSize: 13,
            }}>
              ✅ Vaccin enregistré avec succès ! Redirection...
            </div>
          )}

          {/* Boutons */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'flex-end',
            paddingTop: 8, borderTop: '1px solid var(--sand)', marginTop: 4,
          }}>
            <button
              className="btn-secondary"
              onClick={() => onNavigate(id ? 'dossier-detail' : 'vaccins', id ?? null)}
              disabled={loading}
              style={{ minWidth: 100 }}
            >
              Annuler
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || !form.nom_vaccin || (!id && !form.id_nouveau_ne)}
              style={{ minWidth: 160 }}
            >
              {loading ? '⏳ Enregistrement...' : '💉 Enregistrer'}
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
};