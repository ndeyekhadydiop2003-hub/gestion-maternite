import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const TYPES_SOINS = [
  'Surveillance générale',
  'Bain thérapeutique',
  'Pesée',
  'Prise de température',
  'Administration médicament',
  'Soins du cordon',
  'Photothérapie',
  'Oxygénothérapie',
  'Autre',
];

const getIdPersonnel = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id_personnel ?? 1;
  } catch {
    return 1;
  }
};

const parseError = (data) => {
  if (!data) return 'Une erreur est survenue. Veuillez réessayer.';
  if (data.errors) return Object.values(data.errors).flat().join('\n');
  if (data.message) {
    if (data.message.includes('SQLSTATE') || data.message.includes('QueryException'))
      return 'Erreur serveur : un champ requis est manquant ou invalide.';
    return data.message;
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
};

export default function PlanifierSoin({ onNavigate, id }) {
  const [bebe,    setBebe]    = useState(null);
  const [babies,  setBabies]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm]       = useState({
    id_nouveau_ne: id ? String(id) : '',
    type_soin:     '',
    date_soin:     '',
    heure_soin:    '',
    note:          '',
    frequence:     'unique',
  });

  // Charger le bébé si id fourni
  useEffect(() => {
    if (!id) return;
    api.get(`/nouveau-nes/${id}`)
      .then(res => setBebe(res.data))
      .catch(() => {});
  }, [id]);

  // Charger la liste des bébés si pas d'id
  useEffect(() => {
    if (id) return;
    api.get('/nouveau-nes?per_page=100')
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        setBabies(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [id]);

  // Charger le bébé quand sélectionné dans la liste
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

      const bebeId = id ?? Number(form.id_nouveau_ne);
      if (!bebeId) {
        setError('Veuillez sélectionner un bébé.');
        setLoading(false);
        return;
      }

      await api.post('/soins', {
        id_nouveau_ne: bebeId,
        id_personnel:  getIdPersonnel(),
        type_soin:     form.type_soin,
        date_soin:     form.date_soin,
        heure_soin:    form.heure_soin || null,
        frequence:     form.frequence,
        note:          form.note || null,
        statut:        'planifie',
      });

      setSuccess(true);
      setTimeout(() => onNavigate(id ? 'dossier-detail' : 'soins', id ?? null), 1500);
    } catch (err) {
      setError(parseError(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const patiente = bebe?.accouchement?.grossesse?.patiente;
  const nomBebe  = patiente
    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
    : bebe
    ? `Nouveau-né #${bebe.id_nouveau_ne}`
    : null;

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

  const sectionTitle = {
    fontSize: 13, fontWeight: 700, color: 'var(--rose-2)', marginBottom: 4,
  };

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
          <h2>Planifier un soin</h2>
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

      {/* ── Formulaire ── */}
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card-head">
          <h3>🩺 Détails du soin</h3>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sélection bébé si pas d'id */}
          {!id && (
            <div>
              <label style={labelStyle}>
                Bébé concerné <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="id_nouveau_ne"
                value={form.id_nouveau_ne}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">— Sélectionner un bébé —</option>
                {babies.map(b => (
                  <option key={b.id_nouveau_ne} value={b.id_nouveau_ne}>
                    {getBabyLabel(b)} — NB{String(b.id_nouveau_ne).padStart(4, '0')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type de soin */}
          <div>
            <label style={labelStyle}>
              Type de soin <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="type_soin"
              value={form.type_soin}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">— Sélectionner —</option>
              {TYPES_SOINS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Date / Heure */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>
                Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="date"
                name="date_soin"
                value={form.date_soin}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Heure</label>
              <input
                type="time"
                name="heure_soin"
                value={form.heure_soin}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Fréquence */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>🔁 Fréquence du soin</div>
            <select
              name="frequence"
              value={form.frequence}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="unique">Une seule fois</option>
              <option value="quotidien">Quotidien</option>
              <option value="2x_jour">2x par jour</option>
              <option value="hebdomadaire">Hebdomadaire</option>
            </select>
            {form.frequence !== 'unique' && (
              <div style={{
                background: 'var(--rose-light)', borderRadius: 8,
                padding: '10px 14px', fontSize: 12,
                color: 'var(--rose-2)', fontStyle: 'italic',
                border: '1px solid var(--rose-border)',
              }}>
                💬 Ce soin sera planifié <strong>{
                  form.frequence === 'quotidien'    ? 'chaque jour' :
                  form.frequence === '2x_jour'      ? '2 fois par jour' :
                  form.frequence === 'hebdomadaire' ? 'chaque semaine' : ''
                }</strong> à partir du <strong>{form.date_soin || '...'}</strong>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes / Instructions</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Instructions particulières pour l'infirmier(e)..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: 8, padding: '12px 16px',
              color: '#dc2626', fontSize: 13,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span>❌</span>
              <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div style={{
              background: '#dcfce7', border: '1px solid #86efac',
              borderRadius: 8, padding: '12px 16px',
              color: '#16a34a', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✅</span> Soin planifié avec succès ! Redirection...
            </div>
          )}

          {/* Boutons */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'flex-end',
            paddingTop: 8, borderTop: '1px solid var(--sand)', marginTop: 4,
          }}>
            <button
              className="btn-secondary"
              onClick={() => onNavigate(id ? 'dossier-detail' : 'soins', id ?? null)}
              disabled={loading}
              style={{ minWidth: 100 }}
            >
              Annuler
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={
                loading ||
                !form.type_soin ||
                !form.date_soin ||
                (!id && !form.id_nouveau_ne)
              }
              style={{ minWidth: 160 }}
            >
              {loading ? '⏳ Planification...' : '🩺 Planifier le soin'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

PlanifierSoin.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  id:         PropTypes.number,
};