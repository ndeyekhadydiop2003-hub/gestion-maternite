import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const getIdPersonnel = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id_personnel ?? 1;
  } catch {
    return 1;
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

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

// ── id            = id du bébé (nouveau-né)
// ── idPrescription = id de la prescription à modifier (mode édition)
export default function AjouterTraitement({ onNavigate, id, idPrescription }) {
  const [bebe,          setBebe]          = useState(null);
  const [babies,        setBabies]        = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [loadingInit,   setLoadingInit]   = useState(!!idPrescription);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(false);
  const [form,          setForm]          = useState({
    id_nouveau_ne:     id ? String(id) : '',
    id_consultation:   '',
    medicaments:       '',
    posologie:         '',
    date_prescription: '',
    date_fin:          '',
  });

  const isModification = !!idPrescription;

  // ── Mode édition : charger la prescription existante ──
  useEffect(() => {
    if (!idPrescription) return;
    api.get(`/prescriptions/${idPrescription}`)
      .then(res => {
        const p = res.data;
        setForm(f => ({
          ...f,
          id_consultation:   String(p.id_consultation ?? ''),
          medicaments:       p.medicaments       ?? '',
          posologie:         p.posologie         ?? '',
          date_prescription: p.date_prescription?.slice(0, 10) ?? '',
          date_fin:          p.date_fin?.slice(0, 10)          ?? '',
        }));
      })
      .catch(() => setError('Impossible de charger la prescription.'))
      .finally(() => setLoadingInit(false));
  }, [idPrescription]);

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

  // ── Charger les consultations du bébé ──
  useEffect(() => {
    if (!bebe) return;
    const patienteId =
      bebe?.accouchement?.grossesse?.patiente?.id_patient
      ?? bebe?.patiente?.id_patient
      ?? bebe?.id_patient;
    if (!patienteId) return;
    api.get('/consultations')
      .then(res => {
        const all      = res.data?.data ?? res.data ?? [];
        const filtered = Array.isArray(all)
          ? all.filter(c => c.id_patient === patienteId)
          : [];
        setConsultations(filtered);
        // En mode ajout seulement → pré-sélectionner la dernière consultation
        if (!isModification && filtered.length > 0) {
          setForm(f => ({
            ...f,
            id_consultation: String(filtered[filtered.length - 1].id_consultation),
          }));
        }
      })
      .catch(() => {});
  }, [bebe, isModification]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

      const patienteId =
        bebe?.accouchement?.grossesse?.patiente?.id_patient
        ?? bebe?.patiente?.id_patient
        ?? bebe?.id_patient;

      if (!patienteId && !isModification) {
        setError('Impossible de trouver la patiente liée à ce bébé.');
        setLoading(false);
        return;
      }

      if (!form.id_consultation) {
        setError('Veuillez sélectionner une consultation liée à cette prescription.');
        setLoading(false);
        return;
      }

      const payload = {
        id_personnel:      getIdPersonnel(),
        id_consultation:   Number(form.id_consultation),
        medicaments:       form.medicaments,
        posologie:         form.posologie,
        date_prescription: form.date_prescription,
        date_fin:          form.date_fin || null,
      };

      if (isModification) {
        await api.put(`/prescriptions/${idPrescription}`, payload);
      } else {
        await api.post('/prescriptions', {
          ...payload,
          id_patient: patienteId,
        });
      }

      setSuccess(true);
      const targetId = id ?? Number(form.id_nouveau_ne);
      onNavigate(id ? 'dossier-detail' : 'dossiers', payload.id_nouveau_ne ?? id);

    } catch (err) {
      setError(parseError(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const patiente = bebe?.accouchement?.grossesse?.patiente ?? bebe?.patiente;
  const nomBebe  = patiente
    ? `Bébé de ${patiente.prenom} ${patiente.nom}`
    : bebe ? `Nouveau-né #${bebe.id_nouveau_ne}` : null;

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--sand)', fontSize: 13,
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
          <h2>{isModification ? '✏️ Modifier le traitement' : '💊 Ajouter un traitement'}</h2>
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
          ✏️ Modification de la prescription n°{idPrescription}
        </div>
      )}

      <div className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="card-head">
          <h3>💊 Prescription médicale</h3>
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
                    {getBabyLabel(b)} — NB{String(b.id_nouveau_ne).padStart(4, '0')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Consultation liée ── */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>🩺 Consultation liée</div>
            {bebe && consultations.length === 0 ? (
              <div style={{
                background: '#fee2e2', border: '1px solid #fca5a5',
                borderRadius: 8, padding: '12px 16px',
                color: '#dc2626', fontSize: 13,
              }}>
                ⚠️ Aucune consultation trouvée pour ce bébé. Veuillez d&apos;abord{' '}
                <span
                  style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => onNavigate('ajouter-consultation', id)}
                >
                  ajouter une consultation
                </span>.
              </div>
            ) : (
              <div>
                <label style={labelStyle}>
                  Sélectionner la consultation <span style={{ color: 'red' }}>*</span>
                </label>
                <select name="id_consultation" value={form.id_consultation}
                  onChange={handleChange} style={inputStyle}>
                  <option value="">— Sélectionner —</option>
                  {consultations.map(c => (
                    <option key={c.id_consultation} value={c.id_consultation}>
                      {formatDate(c.date_consultation)}
                      {c.motif? ` — ${c.motif}` : ''}
                      c.personnel
                              ? `${c.personnel.prenom} ${c.personnel.nom}`
                              : '—'
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Médicaments ── */}
          <div>
            <label style={labelStyle}>
              Médicaments <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea name="medicaments" value={form.medicaments}
              onChange={handleChange}
              placeholder="ex: Vitamine D3, Amoxicilline 250mg..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* ── Posologie ── */}
          <div>
            <label style={labelStyle}>
              Posologie <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea name="posologie" value={form.posologie}
              onChange={handleChange}
              placeholder="ex: 1 dose/8h pendant 7 jours..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* ── Dates ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>
                Date de prescription <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="date" name="date_prescription" value={form.date_prescription}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date de fin</label>
              <input type="date" name="date_fin" value={form.date_fin}
                onChange={handleChange} style={inputStyle} />
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
              Traitement {isModification ? 'modifié' : 'enregistré'} avec succès ! Redirection...
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
            <button className="btn-primary"
              onClick={handleSubmit}
              disabled={
                loading ||
                !form.medicaments       ||
                !form.posologie         ||
                !form.date_prescription ||
                !form.id_consultation   ||
                (!id && !form.id_nouveau_ne)
              }
              style={{ minWidth: 140 }}>
              {loading
                ? '⏳ Enregistrement...'
                : isModification
                ? '✏️ Sauvegarder'
                : '✓ Enregistrer'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

AjouterTraitement.propTypes = {
  onNavigate:      PropTypes.func.isRequired,
  id:              PropTypes.number,
  idPrescription:  PropTypes.number,
};