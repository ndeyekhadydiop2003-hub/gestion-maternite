import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const parseError = (data) => {
  if (!data) return 'Une erreur est survenue.';
  if (data.errors) return Object.values(data.errors).flat().join('\n');
  if (data.message) {
    if (data.message.includes('SQLSTATE')) return 'Erreur serveur : champ requis manquant.';
    return data.message;
  }
  return 'Une erreur est survenue.';
};

const getEtatPoids = (poids) => {
  if (!poids) return { cls: 'b-gray', label: '—' };
  if (poids >= 2.5) return { cls: 'b-normal',     label: '✓ Normal' };
  if (poids >= 1.5) return { cls: 'b-surveiller', label: '⚠ Surveiller' };
  return               { cls: 'b-critique',   label: '⛔ Critique' };
};

const getIdPersonnel = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id_personnel ?? 1;
  } catch {
    return 1;
  }
};

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 9,
  border: '1.5px solid var(--sand)', fontSize: 13,
  fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff',
};

const labelStyle = {
  fontSize: 12, fontWeight: 700, display: 'block',
  marginBottom: 6, color: 'var(--gray)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const sectionStyle = {
  background: '#f9f9fc', borderRadius: 12,
  border: '1.5px solid var(--sand)', padding: '18px 20px',
  display: 'flex', flexDirection: 'column', gap: 16,
};

function StepIndicator({ current }) {
  const steps = [
    { num: 1, label: 'Mère' },
    { num: 2, label: 'Bébé' },
    { num: 3, label: 'Confirmation' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 0, marginBottom: 24,
    }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: current >= s.num ? 'var(--rose)' : '#e5e7eb',
              color: current >= s.num ? '#fff' : 'var(--gray)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, transition: 'all 0.3s',
              boxShadow: current === s.num ? '0 0 0 4px rgba(212,96,122,0.2)' : 'none',
            }}>
              {current > s.num ? '✓' : s.num}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: current >= s.num ? 'var(--rose)' : 'var(--gray)',
            }}>
              {s.label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 8px', marginBottom: 20,
              background: current > s.num ? 'var(--rose)' : '#e5e7eb',
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

StepIndicator.propTypes = { current: PropTypes.number.isRequired };

export default function AjouterBebe({ onNavigate }) {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const [mere, setMere] = useState({
    nom:                    '',
    prenom:                 '',
    date_naissance:         '',
    situation_matrimoniale: '',
    telephone:              '',
    adresse:                '',
    groupe_sanguin:         '',
  });

  const [bebe, setBebe] = useState({
    sexe:              '',
    poids_naissance:   '',
    taille:            '',
    apgar_1min:        '',
    apgar_5min:        '',
    etat_sante:        'bon',
    maternite_origine: '',
  });

  const handleMere = (e) => setMere({ ...mere, [e.target.name]: e.target.value });
  const handleBebe = (e) => setBebe({ ...bebe, [e.target.name]: e.target.value });

  const etatPoids  = getEtatPoids(bebe.poids_naissance ? Number(bebe.poids_naissance) : null);
  const step1Valid = mere.nom && mere.prenom && mere.date_naissance && mere.situation_matrimoniale;
  const step2Valid = bebe.sexe;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Créer la mère dans patientes
      const mereRes = await api.post('/patientes', {
        nom:                    mere.nom,
        prenom:                 mere.prenom,
        date_naissance:         mere.date_naissance,
        situation_matrimoniale: mere.situation_matrimoniale,
        telephone:              mere.telephone     || null,
        adresse:                mere.adresse       || null,
        groupe_sanguin:         mere.groupe_sanguin || null,
        motif:                  bebe.maternite_origine
          ? `Transfert depuis ${bebe.maternite_origine}`
          : 'Admission pédiatrique sur transfert',
        statut:                 'active',
        id_personnel:           getIdPersonnel(),
      });

      const patienteId = mereRes.data?.id_patient;
      if (!patienteId) throw new Error('Impossible de créer la patiente.');

      // 2. Créer le bébé lié à la mère
      const bebeRes = await api.post('/nouveau-nes', {
        id_accouchement: null,
        id_patient:      patienteId,
        sexe:            bebe.sexe,
        poids_naissance: bebe.poids_naissance ? Number(bebe.poids_naissance) : null,
        taille:          bebe.taille          ? Number(bebe.taille)          : null,
        apgar_1min:      bebe.apgar_1min      ? Number(bebe.apgar_1min)      : null,
        apgar_5min:      bebe.apgar_5min      ? Number(bebe.apgar_5min)      : null,
        etat_sante:      bebe.etat_sante,
      });

      const nouveauNeId = bebeRes.data?.id_nouveau_ne;
      if (!nouveauNeId) throw new Error('Impossible de créer le dossier bébé.');

      setSuccess(true);
      setTimeout(() => onNavigate('ajouter-consultation', nouveauNeId), 1500);

    } catch (err) {
      setError(parseError(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-anim">
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn-primary btn-sm"
            style={{ background: 'var(--bg)', color: 'var(--dark)', border: '1.5px solid var(--sand)' }}
            onClick={() => step === 1 ? onNavigate('nouveau-nes') : setStep(step - 1)}
          >← Retour</button>
          <h2>Nouveau dossier pédiatrique — Transfert</h2>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray)' }}>Étape {step} sur 3</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <StepIndicator current={step} />

        {/* ════════ ÉTAPE 1 — Mère ════════ */}
        {step === 1 && (
          <div className="card">
            <div className="card-head">
              <h3>👩 Informations de la mère</h3>
              <span className="badge b-rose">Étape 1 / 3</span>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={sectionStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)' }}>
                  Identité
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>
                      Prénom <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input type="text" name="prenom" value={mere.prenom}
                      onChange={handleMere} placeholder="ex : Aminata" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Nom <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input type="text" name="nom" value={mere.nom}
                      onChange={handleMere} placeholder="ex : Ba" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>
                      Date de naissance <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input type="date" name="date_naissance" value={mere.date_naissance}
                      onChange={handleMere} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Situation matrimoniale <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select name="situation_matrimoniale" value={mere.situation_matrimoniale}
                      onChange={handleMere} style={inputStyle}>
                      <option value="">— Sélectionner —</option>
                      <option value="celibataire">Célibataire</option>
                      <option value="mariee">Mariée</option>
                      <option value="divorcee">Divorcée</option>
                      <option value="veuve">Veuve</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)' }}>
                  Coordonnées
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Téléphone</label>
                    <input type="tel" name="telephone" value={mere.telephone}
                      onChange={handleMere} placeholder="ex : 77 000 00 00" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Groupe sanguin</label>
                    <select name="groupe_sanguin" value={mere.groupe_sanguin}
                      onChange={handleMere} style={inputStyle}>
                      <option value="">— Non renseigné —</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Adresse</label>
                  <input type="text" name="adresse" value={mere.adresse}
                    onChange={handleMere} placeholder="ex : Dakar, Médina" style={inputStyle} />
                </div>
              </div>

              <div style={{
                display: 'flex', gap: 12, justifyContent: 'flex-end',
                paddingTop: 8, borderTop: '1px solid var(--sand)',
              }}>
                <button className="btn-secondary"
                  onClick={() => onNavigate('nouveau-nes')}
                  style={{ minWidth: 100 }}>
                  Annuler
                </button>
                <button className="btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  style={{ minWidth: 160 }}>
                  Suivant → Infos bébé
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ ÉTAPE 2 — Bébé ════════ */}
        {step === 2 && (
          <div className="card">
            <div className="card-head">
              <h3>👶 Informations du nouveau-né</h3>
              <span className="badge b-teal">Étape 2 / 3</span>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Badge mère */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'var(--rose-light)',
                borderRadius: 8, border: '1px solid var(--rose-border)',
                fontSize: 13, fontWeight: 600, color: 'var(--rose-2)',
              }}>
                <span>👩</span> Mère : {mere.prenom} {mere.nom}
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)' }}>
                  Identité du bébé
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>
                      Sexe <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select name="sexe" value={bebe.sexe}
                      onChange={handleBebe} style={inputStyle}>
                      <option value="">— Sélectionner —</option>
                      <option value="masculin">👦 Masculin</option>
                      <option value="feminin">👧 Féminin</option>
                      <option value="indetermine">❓ Indéterminé</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>État de santé</label>
                    <select name="etat_sante" value={bebe.etat_sante}
                      onChange={handleBebe} style={inputStyle}>
                      <option value="bon">✓ Bon</option>
                      <option value="moyen">⚠ Moyen</option>
                      <option value="critique">⛔ Critique</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Maternité d&apos;origine</label>
                  <input type="text" name="maternite_origine" value={bebe.maternite_origine}
                    onChange={handleBebe}
                    placeholder="ex : Hôpital Principal de Dakar"
                    style={inputStyle} />
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)' }}>
                  Données cliniques
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Poids (kg)</label>
                    <input type="number" name="poids_naissance" value={bebe.poids_naissance}
                      onChange={handleBebe} placeholder="ex : 3.2"
                      step="0.1" min="0.1" max="10" style={inputStyle} />
                    {bebe.poids_naissance && (
                      <span className={`badge ${etatPoids.cls}`}
                        style={{ fontSize: 10, marginTop: 6, display: 'inline-block' }}>
                        {etatPoids.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Taille (cm)</label>
                    <input type="number" name="taille" value={bebe.taille}
                      onChange={handleBebe} placeholder="ex : 50"
                      min="10" max="70" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Apgar 1min (0-10)</label>
                    <input type="number" name="apgar_1min" value={bebe.apgar_1min}
                      onChange={handleBebe} placeholder="ex : 8"
                      min="0" max="10" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Apgar 5min (0-10)</label>
                    <input type="number" name="apgar_5min" value={bebe.apgar_5min}
                      onChange={handleBebe} placeholder="ex : 9"
                      min="0" max="10" style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', gap: 12, justifyContent: 'flex-end',
                paddingTop: 8, borderTop: '1px solid var(--sand)',
              }}>
                <button className="btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ minWidth: 100 }}>
                  ← Retour
                </button>
                <button className="btn-primary"
                  onClick={() => setStep(3)}
                  disabled={!step2Valid}
                  style={{ minWidth: 160 }}>
                  Suivant → Confirmation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ ÉTAPE 3 — Confirmation ════════ */}
        {step === 3 && (
          <div className="card">
            <div className="card-head">
              <h3>✅ Confirmation</h3>
              <span className="badge b-amber">Étape 3 / 3</span>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Résumé mère */}
              <div style={sectionStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)', marginBottom: 4 }}>
                  👩 Mère
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  {[
                    ['Nom complet',    `${mere.prenom} ${mere.nom}`],
                    ['Date naissance', mere.date_naissance
                      ? new Date(mere.date_naissance).toLocaleDateString('fr-FR') : '—'],
                    ['Situation',      mere.situation_matrimoniale || '—'],
                    ['Téléphone',      mere.telephone    || '—'],
                    ['Groupe sanguin', mere.groupe_sanguin || '—'],
                    ['Adresse',        mere.adresse      || '—'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ color: 'var(--gray)', fontSize: 11, marginBottom: 2 }}>{l}</div>
                      <div style={{ fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé bébé */}
              <div style={sectionStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-2)', marginBottom: 4 }}>
                  👶 Nouveau-né — Bébé de {mere.prenom} {mere.nom}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  {[
                    ['Sexe',      bebe.sexe === 'masculin' ? '👦 Garçon'
                                : bebe.sexe === 'feminin'  ? '👧 Fille' : '❓'],
                    ['Poids',     bebe.poids_naissance ? `${bebe.poids_naissance} kg` : '—'],
                    ['Taille',    bebe.taille          ? `${bebe.taille} cm`          : '—'],
                    ['Apgar 1min',bebe.apgar_1min      || '—'],
                    ['Apgar 5min',bebe.apgar_5min      || '—'],
                    ['État santé',bebe.etat_sante],
                    ['Maternité', bebe.maternite_origine || '—'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ color: 'var(--gray)', fontSize: 11, marginBottom: 2 }}>{l}</div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {v}
                        {l === 'Poids' && bebe.poids_naissance && (
                          <span className={`badge ${etatPoids.cls}`} style={{ fontSize: 10 }}>
                            {etatPoids.label}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info redirection */}
              <div style={{
                background: '#f0fdf4', borderRadius: 10,
                border: '1px solid #bbf7d0', padding: '14px 16px',
                fontSize: 13, color: '#15803d',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>📋</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Prochaine étape</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    Après l&apos;enregistrement, vous serez redirigé vers la première
                    consultation pédiatrique pour compléter le dossier.
                  </div>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div style={{
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  borderRadius: 8, padding: '12px 16px',
                  color: '#dc2626', fontSize: 13,
                  display: 'flex', gap: 8,
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
                  <span>✅</span>
                  Dossier créé ! Ouverture de la consultation pédiatrique...
                </div>
              )}

              <div style={{
                display: 'flex', gap: 12, justifyContent: 'flex-end',
                paddingTop: 8, borderTop: '1px solid var(--sand)',
              }}>
                <button className="btn-secondary"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  style={{ minWidth: 100 }}>
                  ← Modifier
                </button>
                <button className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading || success}
                  style={{ minWidth: 200, background: 'var(--teal)' }}>
                  {loading
                    ? '⏳ Enregistrement...'
                    : '✓ Confirmer et ouvrir le dossier'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AjouterBebe.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};