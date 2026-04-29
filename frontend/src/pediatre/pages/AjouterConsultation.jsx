import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const DELAIS_RDV = [
  { value: '',           label: '— Aucun suivi prévu —' },
  { value: '1 semaine',  label: 'Dans 1 semaine' },
  { value: '2 semaines', label: 'Dans 2 semaines' },
  { value: '1 mois',     label: 'Dans 1 mois' },
  { value: '2 mois',     label: 'Dans 2 mois' },
  { value: '3 mois',     label: 'Dans 3 mois' },
  { value: '6 mois',     label: 'Dans 6 mois' },
  { value: 'urgent',     label: '🚨 Urgent — dès que possible' },
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

export default function AjouterConsultation({ onNavigate, id }) {
  const [bebe,    setBebe]    = useState(null);
  const [babies,  setBabies]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const [form,    setForm]    = useState({
    id_nouveau_ne:       id ? String(id) : '',
    date_consultation:   '',
    motif_consultation:  '',
    poids:               '',
    temperature:         '',
    tension_systolique:  '',
    tension_diastolique: '',
    observation:         '',
    taille:              '',
    perimetre_cranien:   '',
    allaitement:         '',
    vaccin_a_jour:       false,
    vaccins_notes:       '',
    developpement:       '',
    delai_rdv:           '',
    note_rdv:            '',
    priorite:            'normale',
  });

  // ── Si id passé → charge le bébé directement ──
  useEffect(() => {
    if (!id) return;
    api.get(`/nouveau-nes/${id}`)
      .then(res => setBebe(res.data))
      .catch(() => {});
  }, [id]);

  // ── Si pas d'id → charge la liste des bébés ──
  useEffect(() => {
    if (id) return;
    api.get('/nouveau-nes?per_page=100')
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        setBabies(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [id]);

  // ── Quand on change le bébé dans le select ──
  useEffect(() => {
    if (id || !form.id_nouveau_ne) return;
    api.get(`/nouveau-nes/${form.id_nouveau_ne}`)
      .then(res => setBebe(res.data))
      .catch(() => setBebe(null));
  }, [form.id_nouveau_ne, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // ── Label bébé dans le select ──
  const getBabyLabel = (b) => {
    const patiente = b.accouchement?.grossesse?.patiente ?? b.patiente;
    return patiente
      ? `Bébé de ${patiente.prenom} ${patiente.nom}`
      : `Nouveau-né #${b.id_nouveau_ne}`;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const idPersonnel = getIdPersonnel();

      // ── Récupérer patienteId — bébé né ici OU transféré ──
      const patienteId =
        bebe?.accouchement?.grossesse?.patiente?.id_patient
        ?? bebe?.patiente?.id_patient
        ?? bebe?.id_patient;

      const grossesseId = bebe?.accouchement?.grossesse?.id_grossesse ?? null;
      const idNouveauNe = id ?? Number(form.id_nouveau_ne);

      if (!patienteId) {
        setError('Impossible de trouver la patiente liée à ce bébé.');
        setLoading(false);
        return;
      }

      // ── Tension formatée ──
      const tension = form.tension_systolique && form.tension_diastolique
        ? `${form.tension_systolique}/${form.tension_diastolique}`
        : null;

      // ── Observation finale avec recommandation RDV ──
      let observationFinale = form.observation || '';
      if (form.delai_rdv) {
        observationFinale += `\n\n📅 Suivi recommandé : ${form.delai_rdv}`;
        if (form.note_rdv) observationFinale += ` — ${form.note_rdv}`;
      }

      // ── 1. Consultation générale ──
      const consRes = await api.post('/consultations', {
        id_patient:         patienteId,
        id_grossesse:       grossesseId,
        id_personnel:       idPersonnel,
        date_consultation:  form.date_consultation,
        motif_consultation: form.motif_consultation || null,
        poids:              form.poids       ? Number(form.poids)       : null,
        temperature:        form.temperature ? Number(form.temperature) : null,
        tension:            tension,
        observation:        observationFinale || null,
        prochain_rdv:       null,
      });

      const idConsultation = consRes.data?.id_consultation;

      // ── 2. Consultation pédiatrique ──
      if (idConsultation) {
        await api.post('/consultations-pediatrie', {
          id_consultation:   idConsultation,
          id_nouveau_ne:     idNouveauNe,
          taille:            form.taille            ? Number(form.taille)            : null,
          perimetre_cranien: form.perimetre_cranien ? Number(form.perimetre_cranien) : null,
          vaccin_a_jour:     form.vaccin_a_jour ? 1 : 0,
          vaccins_notes:     form.vaccins_notes  || null,
          developpement:     form.developpement  || null,
          allaitement:       form.allaitement    || null,
        });
      }

      // ── 3. Planification RDV ──
      if (form.delai_rdv) {
        try {
          await api.post('/planifier-rv', {
            id_patient:       patienteId,
            id_personnel:     idPersonnel,
            delai_recommande: form.delai_rdv,
            priorite:         form.delai_rdv === 'urgent' ? 'urgente' : form.priorite,
            motif:            form.note_rdv || form.motif_consultation || 'Suivi pédiatrique',
            statut:           'en_attente',
          });
        } catch (rvErr) {
          console.error('Erreur RDV:', rvErr);
          // On ne bloque pas si le RDV échoue
        }
      }

      setSuccess(true);
      setTimeout(() => onNavigate(id ? 'dossier-detail' : 'dossiers', idNouveauNe), 1500);

    } catch (err) {
      setError(parseError(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  // ── Nom du bébé — bébé né ici OU transféré ──
  const patiente = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
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
            onClick={() => onNavigate(id ? 'dossier-detail' : 'dossiers', id ?? null)}
          >
            ← Retour
          </button>
          <h2>Ajouter une consultation</h2>
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

      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card-head">
          <h3>🩺 Consultation pédiatrique</h3>
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
                    {getBabyLabel(b)} — NB{String(b.id_nouveau_ne).padStart(4, '0')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Date ── */}
          <div>
            <label style={labelStyle}>
              Date de consultation <span style={{ color: 'red' }}>*</span>
            </label>
            <input type="date" name="date_consultation" value={form.date_consultation}
              onChange={handleChange} style={inputStyle} />
          </div>

          {/* ── Motif ── */}
          <div>
            <label style={labelStyle}>Motif</label>
            <input type="text" name="motif_consultation" value={form.motif_consultation}
              onChange={handleChange} placeholder="ex : Visite post-natale J5"
              style={inputStyle} />
          </div>

          {/* ── Mesures générales ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>📊 Mesures générales</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Poids (kg)</label>
                <input type="number" name="poids" value={form.poids}
                  onChange={handleChange} placeholder="ex : 3.5"
                  step="0.1" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Température (°C)</label>
                <input type="number" name="temperature" value={form.temperature}
                  onChange={handleChange} placeholder="ex : 37.2"
                  step="0.1" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Tension artérielle</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="number" name="tension_systolique" value={form.tension_systolique}
                  onChange={handleChange} placeholder="Systolique (ex: 120)"
                  style={inputStyle} />
                <input type="number" name="tension_diastolique" value={form.tension_diastolique}
                  onChange={handleChange} placeholder="Diastolique (ex: 80)"
                  style={inputStyle} />
              </div>
            </div>
          </div>

          {/* ── Données pédiatriques ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>👶 Données pédiatriques</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Taille (cm)</label>
                <input type="number" name="taille" value={form.taille}
                  onChange={handleChange} placeholder="ex : 52"
                  step="0.1" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Périmètre crânien (cm)</label>
                <input type="number" name="perimetre_cranien" value={form.perimetre_cranien}
                  onChange={handleChange} placeholder="ex : 34"
                  step="0.1" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Allaitement</label>
              <select name="allaitement" value={form.allaitement}
                onChange={handleChange} style={inputStyle}>
                <option value="">— Sélectionner —</option>
                <option value="maternel">🤱 Maternel</option>
                <option value="artificiel">🍼 Artificiel</option>
                <option value="mixte">🔀 Mixte</option>
                <option value="sevrage">⛔ Sevrage</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Développement</label>
              <textarea name="developpement" value={form.developpement}
                onChange={handleChange}
                placeholder="ex : Motricité fine normale, réflexes présents..."
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Vaccins */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" name="vaccin_a_jour" id="vaccin_a_jour"
                checked={form.vaccin_a_jour} onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: 'var(--rose)' }} />
              <label htmlFor="vaccin_a_jour"
                style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                💉 Vaccins à jour
              </label>
            </div>

            <div>
              <label style={labelStyle}>Notes vaccins</label>
              <input type="text" name="vaccins_notes" value={form.vaccins_notes}
                onChange={handleChange}
                placeholder="ex : BCG administré, Polio J1..."
                style={inputStyle} />
            </div>
          </div>

          {/* ── Observation ── */}
          <div>
            <label style={labelStyle}>Observation clinique</label>
            <textarea name="observation" value={form.observation}
              onChange={handleChange}
              placeholder="Notes cliniques, observations, résultats..."
              rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* ── Recommandation RDV ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>📅 Recommandation de suivi</div>
            <div style={{ fontSize: 12, color: 'var(--gray)' }}>
              Indiquez un délai — la secrétaire fixera la date exacte du rendez-vous.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Délai recommandé</label>
                <select name="delai_rdv" value={form.delai_rdv}
                  onChange={handleChange} style={inputStyle}>
                  {DELAIS_RDV.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priorité</label>
                <select name="priorite" value={form.priorite}
                  onChange={handleChange} style={inputStyle}
                  disabled={form.delai_rdv === 'urgent'}>
                  <option value="normale">🟢 Normale</option>
                  <option value="urgente">🔴 Urgente</option>
                </select>
              </div>
            </div>

            {form.delai_rdv && (
              <div>
                <label style={labelStyle}>Motif du suivi</label>
                <input type="text" name="note_rdv" value={form.note_rdv}
                  onChange={handleChange}
                  placeholder="ex : Contrôle poids, Vaccin BCG..."
                  style={inputStyle} />
              </div>
            )}

            {form.delai_rdv && (
              <div style={{
                background: 'var(--rose-light)', borderRadius: 8,
                padding: '10px 14px', fontSize: 12,
                color: 'var(--rose-2)', fontStyle: 'italic',
                border: '1px solid var(--rose-border)',
              }}>
                💬 Message pour la secrétaire : <strong>
                  Prévoir un RDV {form.delai_rdv}
                  {form.note_rdv ? ` — ${form.note_rdv}` : ''}
                  {form.delai_rdv === 'urgent' || form.priorite === 'urgente' ? ' 🚨 URGENT' : ''}
                </strong>
              </div>
            )}
          </div>

          {/* ── Erreur ── */}
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

          {/* ── Succès ── */}
          {success && (
            <div style={{
              background: '#dcfce7', border: '1px solid #86efac',
              borderRadius: 8, padding: '12px 16px',
              color: '#16a34a', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✅</span>
              Consultation enregistrée
              {form.delai_rdv ? ' + suivi envoyé à la secrétaire' : ''} ! Redirection...
            </div>
          )}

          {/* ── Boutons ── */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'flex-end',
            paddingTop: 8, borderTop: '1px solid var(--sand)', marginTop: 4,
          }}>
            <button className="btn-secondary"
              onClick={() => onNavigate(id ? 'dossier-detail' : 'dossiers', id ?? null)}
              disabled={loading} style={{ minWidth: 100 }}>
              Annuler
            </button>
            <button className="btn-primary" onClick={handleSubmit}
              disabled={loading || !form.date_consultation || (!id && !form.id_nouveau_ne)}
              style={{ minWidth: 160 }}>
              {loading ? '⏳ Enregistrement...' : '✓ Enregistrer'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

AjouterConsultation.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  id:         PropTypes.number,
};