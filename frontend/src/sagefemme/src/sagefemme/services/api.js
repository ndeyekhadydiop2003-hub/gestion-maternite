const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });
const request = async (method, endpoint, body = null) => {
  const options = { method, headers: headers() };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (res.status === 401) { localStorage.removeItem('token'); window.location.reload(); return; }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Erreur ' + res.status); }
  return res.json();
};
export const authAPI = { login:(d)=>request('POST','/login',d), logout:()=>request('POST','/logout'), me:()=>request('GET','/me'), updatePassword:(d)=>request('PUT','/me/password',d) };
export const patientesAPI = { list:()=>request('GET','/patientes'), get:(id)=>request('GET','/patientes/'+id), update:(id,d)=>request('PUT','/patientes/'+id,d), grossesses:(id)=>request('GET','/patientes/'+id+'/grossesses'), consultations:(id)=>request('GET','/patientes/'+id+'/consultations'), antecedents:(id)=>request('GET','/patientes/'+id+'/antecedents'), hospitalisations:(id)=>request('GET','/patientes/'+id+'/hospitalisations') };
export const personnelAPI = { list:()=>request('GET','/personnel-medical') };
export const grossessesAPI = { list:()=>request('GET','/grossesses'), get:(id)=>request('GET','/grossesses/'+id), create:(d)=>request('POST','/grossesses',d), update:(id,d)=>request('PUT','/grossesses/'+id,d), delete:(id)=>request('DELETE','/grossesses/'+id) };
export const consultationsAPI = { list:()=>request('GET','/consultations'), get:(id)=>request('GET','/consultations/'+id), create:(d)=>request('POST','/consultations',d), update:(id,d)=>request('PUT','/consultations/'+id,d), delete:(id)=>request('DELETE','/consultations/'+id), transfertGyneco:(id,d)=>request('POST','/consultations/'+id+'/transfert-gyneco',d) };
export const sageFemmeAPI = { create:(d)=>request('POST','/consultation-sage-femme',d) };
export const planningAPI = { create:(d)=>request('POST','/consultation-planning',d) };
export const infectiologieAPI = { create:(d)=>request('POST','/consultation-infectiologie',d) };
export const accouchementsAPI = { list:()=>request('GET','/accouchements'), create:(d)=>request('POST','/accouchements',d), update:(id,d)=>request('PUT','/accouchements/'+id,d) };
export const nouveauNesAPI = { list:()=>request('GET','/nouveau-nes'), create:(d)=>request('POST','/nouveau-nes',d), update:(id,d)=>request('PUT','/nouveau-nes/'+id,d) };
export const rendezVousAPI = { list:()=>request('GET','/rendez-vous'), updateStatut:(id,s)=>request('PATCH','/rendez-vous/'+id+'/statut',{statut:s}), confirmer:(id)=>request('PATCH','/rendez-vous/'+id+'/confirmer') };
export const examensAPI = { list:()=>request('GET','/examens'), create:(d)=>request('POST','/examens',d), ajouterResultat:(id,d)=>request('POST','/examens/'+id+'/resultat',d) };
export const prescriptionsAPI = { list:()=>request('GET','/prescriptions'), create:(d)=>request('POST','/prescriptions',d) };
export const antecedentsAPI = { list:()=>request('GET','/antecedents-medicaux'), create:(d)=>request('POST','/antecedents-medicaux',d) };
export const dashboardAPI = { stats:()=>request('GET','/dashboard/stats') };
export const pdfURL = (type) => BASE_URL+'/pdf/'+type+'?token='+getToken();
