import { useState, useEffect } from "react";

// ── DONNÉES MOCK (à remplacer par appels API Laravel) ────────────────────────
const RDV_DATA = [
  { id:1, heure:"09:00", fin:"10:00", debut:"21 semaines", dpa:"200", type:"Normal", statut:"En cours",  nom:"Julie Dupont",    avatar:"JD", av:"#E91E8C", semaines:21 },
  { id:2, heure:"11:30", fin:"12:30", debut:"30 Oct 2024", dpa:"205", type:"Risque", statut:"Risquée",   nom:"Sophie Richard",  avatar:"SR", av:"#9C27B0", semaines:30 },
  { id:3, heure:"14:00", fin:"15:00", debut:"14 Fév 2024", dpa:"200", type:"Normal", statut:"En cours",  nom:"Laura Bernard",   avatar:"LB", av:"#00BCD4", semaines:28 },
  { id:4, heure:"16:00", fin:"17:00", debut:"01 Mar 2024", dpa:"223", type:"Normal", statut:"En cours",  nom:"Mélanie Leclerc", avatar:"ML", av:"#FF9800", semaines:14 },
  { id:5, heure:"17:00", fin:"18:00", debut:"19 Mar 2024", dpa:"16",  type:"Normal", statut:"En cours",  nom:"Elsa Girard",     avatar:"EG", av:"#4CAF50", semaines:16 },
];

const PATIENTES_DATA = [
  { id:1, nom:"Sophie Richard",  age:29, sa:"29.5", dpa:"06 Sep 2024", statut:"Risquée",    av:"#9C27B0", ini:"SR", phone:"06 12 34 56 78", email:"sophie@email.com",  poids:68, taille:165, groupeSanguin:"A+",  antecedents:"HTA légère", nbConsult:8 },
  { id:2, nom:"Julie Dupont",    age:26, sa:"21.0", dpa:"15 Nov 2024", statut:"Normal",     av:"#E91E8C", ini:"JD", phone:"06 98 76 54 32", email:"julie@email.com",   poids:62, taille:168, groupeSanguin:"O+",  antecedents:"Aucun",      nbConsult:5 },
  { id:3, nom:"Laura Bernard",   age:32, sa:"28.0", dpa:"02 Déc 2024", statut:"Normal",     av:"#00BCD4", ini:"LB", phone:"06 11 22 33 44", email:"laura@email.com",   poids:71, taille:162, groupeSanguin:"B+",  antecedents:"Diabète G.", nbConsult:6 },
  { id:4, nom:"Mélanie Leclerc", age:28, sa:"14.0", dpa:"10 Jan 2025", statut:"Normal",     av:"#FF9800", ini:"ML", phone:"06 55 66 77 88", email:"mela@email.com",    poids:58, taille:170, groupeSanguin:"AB-", antecedents:"Aucun",      nbConsult:3 },
  { id:5, nom:"Elsa Girard",     age:35, sa:"16.0", dpa:"22 Jan 2025", statut:"Surveiller", av:"#4CAF50", ini:"EG", phone:"06 44 55 66 77", email:"elsa@email.com",    poids:65, taille:166, groupeSanguin:"O-",  antecedents:"Thyroïde",   nbConsult:4 },
];

const GROSSESSES_DATA = [
  { id:1, patiente:"Sophie Richard",  av:"#9C27B0", ini:"SR", sa:29.5, dpa:"06 Sep 2024", joursRestants:78,  risque:"Élevé",   poids:68, tension:"13/8", fcb:148, prochain:"15 Mar 2024" },
  { id:2, patiente:"Julie Dupont",    av:"#E91E8C", ini:"JD", sa:21.0, dpa:"15 Nov 2024", joursRestants:142, risque:"Normal",  poids:62, tension:"12/7", fcb:142, prochain:"22 Mar 2024" },
  { id:3, patiente:"Laura Bernard",   av:"#00BCD4", ini:"LB", sa:28.0, dpa:"02 Déc 2024", joursRestants:159, risque:"Modéré", poids:71, tension:"12/8", fcb:155, prochain:"18 Mar 2024" },
  { id:4, patiente:"Mélanie Leclerc", av:"#FF9800", ini:"ML", sa:14.0, dpa:"10 Jan 2025", joursRestants:198, risque:"Normal",  poids:58, tension:"11/7", fcb:160, prochain:"28 Mar 2024" },
];

const POSTNATAL_DATA = [
  { id:1, mere:"Sophie Richard", bebe:"Léa Richard",  av:"#9C27B0", ini:"SR", dateNaiss:"02 Mar 2024", poids:"3.3kg", taille:"50cm", apgar:9, statut:"Suivi actif", prochain:"16 Mar 2024" },
  { id:2, mere:"Julie Dupont",   bebe:"Lucas Dupont", av:"#E91E8C", ini:"JD", dateNaiss:"18 Fév 2024", poids:"3.1kg", taille:"49cm", apgar:8, statut:"Suivi actif", prochain:"20 Mar 2024" },
  { id:3, mere:"Aïcha Bah",      bebe:"Mamadou Bah",  av:"#00BCD4", ini:"AB", dateNaiss:"10 Jan 2024", poids:"2.9kg", taille:"48cm", apgar:7, statut:"Terminé",    prochain:"—" },
];

const EXAMENS_DATA = [
  { id:1, patiente:"Sophie Richard",  av:"#9C27B0", ini:"SR", type:"Échographie",   date:"15 Mar 2024", heure:"10:00", statut:"Planifié", resultat:null,     urgence:false },
  { id:2, patiente:"Julie Dupont",    av:"#E91E8C", ini:"JD", type:"Prise de sang", date:"12 Mar 2024", heure:"08:30", statut:"Terminé",  resultat:"Normal", urgence:false },
  { id:3, patiente:"Laura Bernard",   av:"#00BCD4", ini:"LB", type:"Glycémie",      date:"13 Mar 2024", heure:"09:00", statut:"Terminé",  resultat:"Élevée", urgence:true  },
  { id:4, patiente:"Mélanie Leclerc", av:"#FF9800", ini:"ML", type:"Urine",         date:"20 Mar 2024", heure:"11:00", statut:"Planifié", resultat:null,     urgence:false },
  { id:5, patiente:"Elsa Girard",     av:"#4CAF50", ini:"EG", type:"TSH",           date:"08 Mar 2024", heure:"07:45", statut:"Terminé",  resultat:"Normal", urgence:false },
];

const VACCINATIONS_DATA = [
  { id:1, patiente:"Sophie Richard",  av:"#9C27B0", ini:"SR", vaccin:"Tétanos-Diphtérie", date:"01 Mar 2024", dose:"Rappel", statut:"Fait",     prochain:"2029" },
  { id:2, patiente:"Julie Dupont",    av:"#E91E8C", ini:"JD", vaccin:"Coqueluche",         date:"20 Fév 2024", dose:"1ère",   statut:"Fait",     prochain:"—"    },
  { id:3, patiente:"Laura Bernard",   av:"#00BCD4", ini:"LB", vaccin:"Grippe",             date:"25 Mar 2024", dose:"Annual", statut:"Planifié", prochain:"—"    },
  { id:4, patiente:"Mélanie Leclerc", av:"#FF9800", ini:"ML", vaccin:"Hépatite B",         date:"10 Avr 2024", dose:"2ème",   statut:"Planifié", prochain:"—"    },
];

// ── ICÔNES ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=16, color="currentColor" }) => {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:"1.8", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    home:    <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    users:   <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    cal:     <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    heart:   <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    baby:    <svg {...p}><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>,
    file:    <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    shield:  <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    cog:     <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    bell:    <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    search:  <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus:    <svg {...p} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x:       <svg {...p} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    logout:  <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    pdf:     <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>,
    edit:    <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:   <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    eye:     <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    alert:   <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    check:   <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    wave:    <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    syringe: <svg {...p}><path d="M18 2l4 4"/><path d="M17.5 6.5L19 8"/><path d="m6 14-4 4 4 4"/><path d="M10 4 4 10"/><path d="m14 4 6 6"/><path d="M4.5 13.5 11 7"/><path d="M13 11l-8 8"/></svg>,
  };
  return icons[name] || null;
};

// ── COMPOSANTS COMMUNS ────────────────────────────────────────────────────────
const Av = ({ ini, color, size=36 }) => (
  <div style={{ width:size, height:size, borderRadius:size*0.28, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.32, fontWeight:700, color:"#fff", flexShrink:0, boxShadow:`0 3px 10px ${color}44`, letterSpacing:0.5 }}>{ini}</div>
);

const Bdg = ({ label }) => {
  const map = {
    normal:    { bg:"#F0FDF4", c:"#166534", d:"#22C55E" },
    risquée:   { bg:"#FEF2F2", c:"#991B1B", d:"#EF4444" },
    risque:    { bg:"#FEF2F2", c:"#991B1B", d:"#EF4444" },
    surveiller:{ bg:"#FFFBEB", c:"#92400E", d:"#F59E0B" },
    planifié:  { bg:"#EFF6FF", c:"#1E40AF", d:"#60A5FA" },
    terminé:   { bg:"#F0FDF4", c:"#166534", d:"#22C55E" },
    "en cours":{ bg:"#F5F3FF", c:"#5B21B6", d:"#8B5CF6" },
    élevé:     { bg:"#FEF2F2", c:"#991B1B", d:"#EF4444" },
    modéré:    { bg:"#FFFBEB", c:"#92400E", d:"#F59E0B" },
    fait:      { bg:"#F0FDF4", c:"#166534", d:"#22C55E" },
    "suivi actif":{ bg:"#EFF6FF", c:"#1E40AF", d:"#60A5FA" },
    normal2:   { bg:"#F9FAFB", c:"#6B7280", d:"#9CA3AF" },
  };
  const s = map[(label||"").toLowerCase()] || map.normal;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.c, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600 }}><span style={{ width:5, height:5, borderRadius:"50%", background:s.d }} />{label}</span>;
};

const Modal = ({ open, onClose, title, children, width=520 }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(59,26,46,0.35)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:18, width:"100%", maxWidth:width, boxShadow:"0 24px 64px rgba(233,30,140,0.15)", animation:"modalIn 0.22s ease", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:"1px solid #FCE4F0", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
          <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#3B1A2E" }}>{title}</div>
          <button onClick={onClose} style={{ border:"none", background:"#FCE4F0", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#B0607A" }}><Icon name="x" size={14} /></button>
        </div>
        <div style={{ padding:"20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
};

const Inp = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div style={{ marginBottom:14 }}>
    {label && <div style={{ fontSize:11, fontWeight:600, color:"#B0607A", marginBottom:5, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</div>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #FCE4F0", borderRadius:9, fontSize:13, color:"#3B1A2E", outline:"none", fontFamily:"inherit", background:"#FFF7FB" }}
      onFocus={e => e.target.style.borderColor="#E91E8C"}
      onBlur={e => e.target.style.borderColor="#FCE4F0"} />
  </div>
);

const Sel = ({ label, value, onChange, opts }) => (
  <div style={{ marginBottom:14 }}>
    {label && <div style={{ fontSize:11, fontWeight:600, color:"#B0607A", marginBottom:5, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #FCE4F0", borderRadius:9, fontSize:13, color:"#3B1A2E", outline:"none", fontFamily:"inherit", background:"#FFF7FB", cursor:"pointer" }}>
      {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const Th = ({ cols }) => (
  <thead>
    <tr style={{ background:"#FFF7FB" }}>
      {cols.map(h => <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"#B0607A", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:"1px solid #FCE4F0" }}>{h}</th>)}
    </tr>
  </thead>
);

const Tr = ({ children }) => {
  const [hov, setHov] = useState(false);
  return <tr style={{ borderBottom:"1px solid #FFF0F7", background:hov?"#FFF7FB":"transparent", transition:"background 0.12s", cursor:"pointer" }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</tr>;
};

const Td = ({ children, style={} }) => <td style={{ padding:"12px 16px", fontSize:13, color:"#3B1A2E", ...style }}>{children}</td>;

const BtnPrimary = ({ onClick, children }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:7, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{children}</button>
);

const BtnSec = ({ onClick, children }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:7, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{children}</button>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:"#fff", borderRadius:16, border:"1px solid #FCE4F0", ...style }}>{children}</div>
);

const SectionTitle = ({ title, sub }) => (
  <div style={{ marginBottom:22 }}>
    <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:24, color:"#3B1A2E", fontWeight:400 }}>{title}</h2>
    {sub && <p style={{ fontSize:12, color:"#B0607A", marginTop:3 }}>{sub}</p>}
  </div>
);

// ── TOPBAR ────────────────────────────────────────────────────────────────────
function Topbar() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const pad = n => String(n).padStart(2,"0");
  const clk = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", height:56, background:"#fff", borderBottom:"1px solid #FCE4F0", flexShrink:0, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(233,30,140,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ fontSize:11, color:"#B0607A", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Maternité Ndieguene · Thiès</div>
        <div style={{ width:1, height:16, background:"#FCE4F0" }} />
        <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#3B1A2E", fontStyle:"italic" }}>Portail Sage-femme</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, background:"#FFF0F7", border:"1px solid #FCE4F0", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, color:"#C2185B", letterSpacing:"0.04em" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E", animation:"pulse 1.8s infinite" }} />{clk}
        </div>
        {["search","bell"].map((ic,i) => (
          <div key={i} style={{ width:34, height:34, borderRadius:8, border:"1px solid #FCE4F0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#B0607A", position:"relative" }}>
            <Icon name={ic} size={14} />
            {ic==="bell" && <span style={{ position:"absolute", top:7, right:7, width:6, height:6, borderRadius:"50%", background:"#EF4444", border:"1.5px solid #fff" }} />}
          </div>
        ))}
        <div style={{ width:34, height:34, borderRadius:8, background:"#E91E8C", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:700, cursor:"pointer", border:"2px solid #FCE4F0" }}>S</div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV = [
  { id:"accueil",      label:"Accueil",        icon:"home"   },
  { id:"patients",     label:"Patients",        icon:"users"  },
  { id:"rdv",          label:"Rendez-vous",     icon:"cal"    },
  { id:"grossesse",    label:"Suivi Grossesse", icon:"heart"  },
  { id:"postnatal",    label:"Suivi Postnatal", icon:"baby"   },
  { id:"examens",      label:"Examens",         icon:"file"   },
  { id:"vaccinations", label:"Vaccinations",    icon:"shield" },
];

function Sidebar({ tab, setTab }) {
  const [open, setOpen] = useState(false);
  const item = (n) => (
    <div key={n.id} onClick={() => setTab(n.id)} style={{ width:"calc(100% - 12px)", margin:"1px 6px", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:9, cursor:"pointer", background:tab===n.id?"#E91E8C":"transparent", color:tab===n.id?"#fff":"#B0607A", transition:"all 0.16s", whiteSpace:"nowrap", overflow:"hidden", minHeight:38 }}>
      <div style={{ flexShrink:0 }}><Icon name={n.icon} size={16} color={tab===n.id?"#fff":"#B0607A"} /></div>
      <span style={{ fontSize:13, fontWeight:tab===n.id?600:500, opacity:open?1:0, transition:"opacity 0.18s 0.06s" }}>{n.label}</span>
    </div>
  );
  return (
    <div style={{ width:open?220:62, minHeight:"100vh", height:"100vh", background:"#fff", borderRight:"1px solid #FCE4F0", display:"flex", flexDirection:"column", alignItems:"center", padding:"18px 0", position:"sticky", top:0, transition:"width 0.28s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden", zIndex:200, flexShrink:0, boxShadow:"2px 0 14px rgba(233,30,140,0.06)" }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div style={{ width:38, height:38, borderRadius:11, background:"#FCE4F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:26, border:"1.5px solid #F9B3D5" }}>
        <Icon name="heart" size={18} color="#E91E8C" />
      </div>
      {NAV.map(item)}
      <div style={{ width:open?190:32, height:1, background:"#FCE4F0", margin:"8px auto", transition:"width 0.28s" }} />
      <div style={{ marginTop:"auto", width:"100%" }}>
        {item({ id:"parametres", label:"Paramètres", icon:"cog" })}
        <div style={{ width:"calc(100% - 12px)", margin:"1px 6px", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:9, cursor:"pointer", color:"#F48FB1", transition:"all 0.16s", whiteSpace:"nowrap", overflow:"hidden", minHeight:38 }}>
          <div style={{ flexShrink:0 }}><Icon name="logout" size={16} color="#F48FB1" /></div>
          <span style={{ fontSize:13, fontWeight:500, opacity:open?1:0, transition:"opacity 0.18s 0.06s" }}>Déconnexion</span>
        </div>
      </div>
    </div>
  );
}

// ── PAGE ACCUEIL ──────────────────────────────────────────────────────────────
function PageAccueil({ setTab }) {
  const stats = [
    { label:"Total Patients",      value:196, ch:"+3",       color:"#E91E8C", bg:"#FCE4F0", tr:"#F9B3D5", icon:"users" },
    { label:"Grossesses en cours", value:11,  ch:"Urgence",  color:"#9C27B0", bg:"#F3E5F5", tr:"#E1BEE7", icon:"heart" },
    { label:"Suivi Grossesse",     value:36,  ch:"+3 cours", color:"#00BCD4", bg:"#E0F7FA", tr:"#B2EBF2", icon:"wave"  },
    { label:"Suivi Postnatal",     value:22,  ch:"+4 cours", color:"#FF9800", bg:"#FFF3E0", tr:"#FFE0B2", icon:"baby"  },
  ];
  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:28, color:"#3B1A2E", fontWeight:400, lineHeight:1.15 }}>Bienvenue, <em style={{ color:"#E91E8C" }}>Sophie !</em></h1>
          <p style={{ fontSize:12, color:"#B0607A", marginTop:4 }}>Voici un aperçu de votre journée</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"7px 14px", fontSize:12, color:"#991B1B", fontWeight:600 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#EF4444", animation:"pulse 1.4s infinite" }} /> 2 urgences actives
          </div>
          <BtnPrimary><Icon name="pdf" size={13} color="#fff" /> Générer PDF</BtnPrimary>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"18px 20px", border:"1px solid #FCE4F0", cursor:"default", transition:"transform 0.18s,box-shadow 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 10px 28px ${s.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name={s.icon} size={16} color={s.color} /></div>
              <div style={{ fontSize:10, color:"#B0607A", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", flex:1 }}>{s.label}</div>
              <div style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, background:s.bg, color:s.color }}>{s.ch}</div>
            </div>
            <div style={{ fontSize:36, fontWeight:300, color:s.color, lineHeight:1, letterSpacing:"-0.025em" }}>{s.value}</div>
            <div style={{ height:2, background:s.tr, borderRadius:99, marginTop:14 }}><div style={{ height:"100%", width:"65%", background:s.color, borderRadius:99 }} /></div>
          </div>
        ))}
      </div>

      {/* RDV + Suivi */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:14, marginBottom:18 }}>
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 14px", borderBottom:"1px solid #FCE4F0" }}>
            <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:16, color:"#3B1A2E" }}>Prochains Rendez-vous</div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <Th cols={["Heure","Patiente","Sem.","Type","Statut"]} />
            <tbody>
              {RDV_DATA.slice(0,4).map((r,i) => (
                <Tr key={i}>
                  <Td style={{ fontWeight:600 }}>{r.heure}</Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}><Av ini={r.avatar} color={r.av} size={30} /><span style={{ fontWeight:500 }}>{r.nom}</span></div></Td>
                  <Td style={{ color:"#6B4455" }}>{r.semaines} SA</Td>
                  <Td><Bdg label={r.type} /></Td>
                  <Td><Bdg label={r.statut} /></Td>
                </Tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding:"12px 20px", borderTop:"1px solid #FCE4F0", textAlign:"center" }}>
            <button onClick={() => setTab("rdv")} style={{ fontSize:12, color:"#E91E8C", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Voir tous les rendez-vous →</button>
          </div>
        </Card>

        {/* Suivi grossesse rapide */}
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 14px", borderBottom:"1px solid #FCE4F0" }}>
            <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:15, color:"#3B1A2E" }}>Suivi Grossesse</div>
          </div>
          <div style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <Av ini="SR" color="#9C27B0" size={46} />
              <div><div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:15, color:"#3B1A2E" }}>Sophie Richard</div><div style={{ fontSize:11, color:"#B0607A" }}>6 Mar 2024</div><div style={{ marginTop:4 }}><Bdg label="Risquée" /></div></div>
            </div>
            {[["DPA","06 septembre 2024","#E91E8C"],["SA","29.55A","#9C27B0"]].map(([l,v,c],i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ color:c, fontSize:8 }}>●</span>
                <span style={{ fontSize:12, color:"#B0607A" }}>{l}</span>
                <span style={{ fontSize:12, color:"#3B1A2E", fontWeight:500, marginLeft:"auto" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:14, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#B0607A", marginBottom:5 }}><span>78 j restants</span><span>7.10</span></div>
              <div style={{ height:6, background:"#FCE4F0", borderRadius:99 }}><div style={{ height:"100%", width:"72%", background:"linear-gradient(90deg,#E91E8C,#9C27B0)", borderRadius:99 }} /></div>
            </div>
            <BtnPrimary><Icon name="pdf" size={13} color="#fff" /> Générer PDF</BtnPrimary>
          </div>
        </Card>
      </div>

      {/* ECG */}
      <Card style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:18 }}>
        <div><div style={{ fontSize:12, fontWeight:600, color:"#3B1A2E" }}>Monitoring cardiaque</div><div style={{ fontSize:11, color:"#B0607A", marginTop:2 }}>Signal normal · Temps réel</div></div>
        <div style={{ flex:1 }}>
          <svg viewBox="0 0 400 32" fill="none" style={{ width:"100%", height:32 }}>
            <polyline points="0,16 40,16 50,4 60,28 70,16 110,16 120,6 132,26 140,16 180,16 190,2 205,30 212,16 250,16 260,10 270,22 278,16 310,16 320,5 335,27 343,16 400,16" stroke="#F9B3D5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E", animation:"pulse 1.8s infinite" }} />
          <span style={{ fontSize:12, color:"#B0607A", fontWeight:500 }}>En ligne</span>
        </div>
      </Card>
    </div>
  );
}

// ── PAGE PATIENTS ─────────────────────────────────────────────────────────────
function PagePatients() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [sel, setSel] = useState(null);
  const [f, setF] = useState({ nom:"", prenom:"", age:"", phone:"", email:"", gs:"", ant:"" });
  const list = PATIENTES_DATA.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <SectionTitle title="Dossiers Patients" sub={`${list.length} patientes enregistrées`} />
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1.5px solid #FCE4F0", borderRadius:9, padding:"8px 14px" }}>
            <Icon name="search" size={13} color="#B0607A" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ border:"none", outline:"none", fontSize:13, background:"transparent", width:150 }} />
          </div>
          <BtnPrimary onClick={() => setModal(true)}><Icon name="plus" size={13} color="#fff" /> Nouveau patient</BtnPrimary>
        </div>
      </div>
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <Th cols={["Patiente","Âge","SA","DPA","Consultations","Statut","Actions"]} />
          <tbody>
            {list.map((p,i) => (
              <Tr key={i}>
                <Td><div style={{ display:"flex", alignItems:"center", gap:11 }}><Av ini={p.ini} color={p.av} size={36} /><div><div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:14 }}>{p.nom}</div><div style={{ fontSize:11, color:"#B0607A" }}>{p.email}</div></div></div></Td>
                <Td style={{ color:"#6B4455" }}>{p.age} ans</Td>
                <Td style={{ color:"#6B4455" }}>{p.sa}</Td>
                <Td style={{ color:"#6B4455" }}>{p.dpa}</Td>
                <Td style={{ color:"#6B4455" }}>{p.nbConsult}</Td>
                <Td><Bdg label={p.statut} /></Td>
                <Td>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => setSel(p)} style={{ border:"none", background:"#EFF6FF", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#1D4ED8" }}><Icon name="eye" size={12} /></button>
                    <button style={{ border:"none", background:"#F0FDF4", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#166534" }}><Icon name="edit" size={12} /></button>
                    <button style={{ border:"none", background:"#FEF2F2", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#991B1B" }}><Icon name="trash" size={12} /></button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.nom||""}>
        {sel && <>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, background:"#FFF7FB", padding:16, borderRadius:12 }}>
            <Av ini={sel.ini} color={sel.av} size={52} />
            <div><div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#3B1A2E" }}>{sel.nom}</div><div style={{ fontSize:12, color:"#B0607A" }}>{sel.phone} · {sel.email}</div><div style={{ marginTop:6 }}><Bdg label={sel.statut} /></div></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[["Âge",`${sel.age} ans`],["Groupe sanguin",sel.groupeSanguin],["Poids",`${sel.poids} kg`],["Taille",`${sel.taille} cm`],["SA",`${sel.sa} SA`],["DPA",sel.dpa],["Consultations",sel.nbConsult],["Antécédents",sel.antecedents]].map(([l,v],i) => (
              <div key={i} style={{ background:"#FFF7FB", borderRadius:9, padding:"10px 14px" }}>
                <div style={{ fontSize:10, color:"#B0607A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:14, color:"#3B1A2E", fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Générer PDF</button>
            <button onClick={() => setSel(null)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Fermer</button>
          </div>
        </>}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau dossier patient" width={500}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <Inp label="Nom" value={f.nom} onChange={v => setF({...f,nom:v})} placeholder="Dupont" />
          <Inp label="Prénom" value={f.prenom} onChange={v => setF({...f,prenom:v})} placeholder="Julie" />
          <Inp label="Âge" value={f.age} onChange={v => setF({...f,age:v})} type="number" placeholder="28" />
          <Inp label="Téléphone" value={f.phone} onChange={v => setF({...f,phone:v})} placeholder="06 00 00 00 00" />
        </div>
        <Inp label="Email" value={f.email} onChange={v => setF({...f,email:v})} placeholder="patient@email.com" />
        <Sel label="Groupe Sanguin" value={f.gs} onChange={v => setF({...f,gs:v})} opts={["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(x=>({v:x,l:x}))} />
        <Inp label="Antécédents" value={f.ant} onChange={v => setF({...f,ant:v})} placeholder="Aucun" />
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Enregistrer</button>
          <button onClick={() => setModal(false)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE RDV ──────────────────────────────────────────────────────────────────
function PageRDV() {
  const [modal, setModal] = useState(false);
  const [vue, setVue] = useState("liste");
  const [f, setF] = useState({ pat:"", date:"", heure:"", type:"Normal", notes:"" });
  const jours = ["Lun 6","Mar 7","Mer 8","Jeu 9","Ven 10","Sam 11"];
  const heures = ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"];

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <SectionTitle title="Gestion des Rendez-vous" sub="Semaine 19 · 06 – 11 Mar 2024" />
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", background:"#FCE4F0", borderRadius:9, padding:3 }}>
            {["liste","semaine"].map(v => (
              <button key={v} onClick={() => setVue(v)} style={{ background:vue===v?"#E91E8C":"transparent", color:vue===v?"#fff":"#B0607A", border:"none", borderRadius:7, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.14s" }}>{v==="liste"?"Liste":"Semaine"}</button>
            ))}
          </div>
          <BtnPrimary onClick={() => setModal(true)}><Icon name="plus" size={13} color="#fff" /> Ajouter RDV</BtnPrimary>
        </div>
      </div>

      {vue==="liste" ? (
        <Card style={{ overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <Th cols={["Heure","Fin","Patiente","SA","Type","Statut","Actions"]} />
            <tbody>
              {RDV_DATA.map((r,i) => (
                <Tr key={i}>
                  <Td style={{ fontWeight:600 }}>{r.heure}</Td>
                  <Td style={{ color:"#B0607A" }}>{r.fin}</Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}><Av ini={r.avatar} color={r.av} size={30} /><span style={{ fontWeight:500 }}>{r.nom}</span></div></Td>
                  <Td style={{ color:"#6B4455" }}>{r.semaines} SA</Td>
                  <Td><Bdg label={r.type} /></Td>
                  <Td><Bdg label={r.statut} /></Td>
                  <Td><div style={{ display:"flex", gap:5 }}>
                    <button style={{ border:"none", background:"#F0FDF4", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#166534" }}><Icon name="edit" size={12} /></button>
                    <button style={{ border:"none", background:"#FEF2F2", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#991B1B" }}><Icon name="trash" size={12} /></button>
                  </div></Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"72px repeat(6,1fr)", borderBottom:"1px solid #FCE4F0" }}>
            <div style={{ background:"#FFF7FB" }} />
            {jours.map(j => <div key={j} style={{ padding:"11px 0", textAlign:"center", background:"#FFF7FB", borderLeft:"1px solid #FCE4F0", fontSize:11, fontWeight:700, color:"#B0607A", textTransform:"uppercase", letterSpacing:"0.05em" }}>{j}</div>)}
          </div>
          {heures.map(h => (
            <div key={h} style={{ display:"grid", gridTemplateColumns:"72px repeat(6,1fr)", borderBottom:"1px solid #FFF0F7" }}>
              <div style={{ padding:"12px 10px", fontSize:11, color:"#B0607A", fontWeight:500 }}>{h}</div>
              {jours.map((_,ci) => (
                <div key={ci} style={{ borderLeft:"1px solid #FFF0F7", padding:4, minHeight:44 }}>
                  {RDV_DATA.filter(r => r.heure===h).slice(0,ci===1?1:0).map((r,i) => (
                    <div key={i} style={{ background:r.av+"22", borderLeft:`3px solid ${r.av}`, borderRadius:6, padding:"4px 8px", fontSize:11, color:r.av, fontWeight:600 }}>{r.nom.split(" ")[0]}</div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau Rendez-vous" width={440}>
        <Sel label="Patiente" value={f.pat} onChange={v => setF({...f,pat:v})} opts={[{v:"",l:"Sélectionner..."}, ...PATIENTES_DATA.map(p => ({v:p.id,l:p.nom}))]} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <Inp label="Date" value={f.date} onChange={v => setF({...f,date:v})} type="date" />
          <Inp label="Heure" value={f.heure} onChange={v => setF({...f,heure:v})} type="time" />
        </div>
        <Sel label="Type grossesse" value={f.type} onChange={v => setF({...f,type:v})} opts={["Normal","Risque","Surveiller"].map(x=>({v:x,l:x}))} />
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#B0607A", marginBottom:5, letterSpacing:"0.04em", textTransform:"uppercase" }}>Notes</div>
          <textarea value={f.notes} onChange={e => setF({...f,notes:e.target.value})} rows={3} placeholder="Observations..." style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #FCE4F0", borderRadius:9, fontSize:13, color:"#3B1A2E", outline:"none", fontFamily:"inherit", background:"#FFF7FB", resize:"vertical" }} />
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Enregistrer</button>
          <button onClick={() => setModal(false)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE GROSSESSE ────────────────────────────────────────────────────────────
function PageGrossesse() {
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(false);

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <SectionTitle title="Suivi Grossesse" sub={`${GROSSESSES_DATA.length} grossesses en cours`} />
        <BtnPrimary onClick={() => setModal(true)}><Icon name="plus" size={13} color="#fff" /> Nouveau suivi</BtnPrimary>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {GROSSESSES_DATA.map((g,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, border:"1px solid #FCE4F0", padding:20, cursor:"pointer", transition:"transform 0.18s,box-shadow 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(233,30,140,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            onClick={() => setSel(g)}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <Av ini={g.ini} color={g.av} size={44} />
              <div style={{ flex:1 }}><div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:16, color:"#3B1A2E" }}>{g.patiente}</div><div style={{ fontSize:11, color:"#B0607A", marginTop:2 }}>Prochain RDV : {g.prochain}</div></div>
              <Bdg label={g.risque} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
              {[["SA",g.sa],["FCB",`${g.fcb} bpm`],["Tension",g.tension]].map(([l,v],i) => (
                <div key={i} style={{ background:"#FFF7FB", borderRadius:9, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"#B0607A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"#3B1A2E", marginTop:3 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#B0607A", marginBottom:5 }}><span>DPA : {g.dpa}</span><span>{g.joursRestants} j restants</span></div>
            <div style={{ height:6, background:"#FCE4F0", borderRadius:99 }}><div style={{ height:"100%", width:`${((280-g.joursRestants)/280)*100}%`, background:g.av, borderRadius:99 }} /></div>
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              <button onClick={e => e.stopPropagation()} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:8, padding:"8px 0", fontSize:11, fontWeight:600, cursor:"pointer" }}>Voir dossier</button>
              <button onClick={e => e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:5, background:"#E91E8C", color:"#fff", border:"none", borderRadius:8, padding:"8px 14px", fontSize:11, fontWeight:600, cursor:"pointer" }}><Icon name="pdf" size={12} color="#fff" /> PDF</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title={`Dossier : ${sel?.patiente}`}>
        {sel && <>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, background:"#FFF7FB", padding:16, borderRadius:12 }}>
            <Av ini={sel.ini} color={sel.av} size={52} /><div><div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#3B1A2E" }}>{sel.patiente}</div><div style={{ marginTop:6 }}><Bdg label={sel.risque} /></div></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[["SA",`${sel.sa} SA`],["DPA",sel.dpa],["Jours restants",sel.joursRestants],["Poids",`${sel.poids} kg`],["Tension",sel.tension],["FCB",`${sel.fcb} bpm`]].map(([l,v],i) => (
              <div key={i} style={{ background:"#FFF7FB", borderRadius:9, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#B0607A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:15, fontWeight:600, color:"#3B1A2E" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Générer PDF</button>
            <button onClick={() => setSel(null)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Fermer</button>
          </div>
        </>}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau Suivi Grossesse" width={460}>
        <Sel label="Patiente" value="" onChange={() => {}} opts={[{v:"",l:"Sélectionner..."}, ...PATIENTES_DATA.map(p => ({v:p.id,l:p.nom}))]} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <Inp label="DPA" value="" onChange={() => {}} type="date" />
          <Inp label="Semaines (SA)" value="" onChange={() => {}} type="number" placeholder="28" />
          <Inp label="Poids (kg)" value="" onChange={() => {}} type="number" placeholder="65" />
          <Inp label="Tension" value="" onChange={() => {}} placeholder="12/8" />
        </div>
        <Sel label="Niveau de risque" value="" onChange={() => {}} opts={["Normal","Modéré","Élevé"].map(x=>({v:x,l:x}))} />
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Enregistrer</button>
          <button onClick={() => setModal(false)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE POSTNATAL ────────────────────────────────────────────────────────────
function PagePostnatal() {
  const [modal, setModal] = useState(false);

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <SectionTitle title="Suivi Postnatal" sub="Dossiers nouveau-nés et suivi mères" />
        <BtnPrimary onClick={() => setModal(true)}><Icon name="plus" size={13} color="#fff" /> Nouveau dossier</BtnPrimary>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {POSTNATAL_DATA.map((p,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, border:"1px solid #FCE4F0", overflow:"hidden", cursor:"pointer", transition:"transform 0.18s,box-shadow 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(233,30,140,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ background:`${p.av}18`, padding:"16px 18px 14px", borderBottom:"1px solid #FCE4F0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <Av ini={p.ini} color={p.av} size={36} />
                <div><div style={{ fontSize:13, fontWeight:600, color:"#3B1A2E" }}>{p.mere}</div><div style={{ fontSize:11, color:"#B0607A" }}>Mère</div></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}><Icon name="baby" size={14} color={p.av} /></div>
                <div><div style={{ fontSize:13, fontWeight:600, color:"#3B1A2E" }}>{p.bebe}</div><div style={{ fontSize:11, color:"#B0607A" }}>Nouveau-né</div></div>
              </div>
            </div>
            <div style={{ padding:"14px 18px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {[["Naissance",p.dateNaiss],["Poids",p.poids],["Taille",p.taille],["Apgar",p.apgar]].map(([l,v],i) => (
                  <div key={i} style={{ background:"#FFF7FB", borderRadius:7, padding:"7px 10px" }}>
                    <div style={{ fontSize:9, color:"#B0607A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#3B1A2E", marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <Bdg label={p.statut} />
              <div style={{ marginTop:10, fontSize:11, color:"#B0607A" }}>Prochain : <span style={{ color:"#E91E8C", fontWeight:600 }}>{p.prochain}</span></div>
              <button style={{ marginTop:12, width:"100%", background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:8, padding:"8px 0", fontSize:11, fontWeight:600, cursor:"pointer" }}>Voir dossier complet</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Création Dossier Nouveau-né" width={500}>
        <Sel label="Mère" value="" onChange={() => {}} opts={[{v:"",l:"Sélectionner..."}, ...PATIENTES_DATA.map(p => ({v:p.id,l:p.nom}))]} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <Inp label="Prénom bébé" value="" onChange={() => {}} placeholder="Léa" />
          <Inp label="Date de naissance" value="" onChange={() => {}} type="date" />
          <Inp label="Poids (kg)" value="" onChange={() => {}} placeholder="3.3" />
          <Inp label="Taille (cm)" value="" onChange={() => {}} placeholder="50" />
          <Inp label="Score Apgar" value="" onChange={() => {}} type="number" placeholder="9" />
          <Sel label="Statut suivi" value="" onChange={() => {}} opts={["Suivi actif","Terminé"].map(x=>({v:x,l:x}))} />
        </div>
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Créer dossier</button>
          <button onClick={() => setModal(false)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE EXAMENS ──────────────────────────────────────────────────────────────
function PageExamens() {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const list = EXAMENS_DATA.filter(e => e.patiente.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <SectionTitle title="Examens & Prescriptions" sub={`${list.length} examens`} />
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1.5px solid #FCE4F0", borderRadius:9, padding:"8px 14px" }}>
            <Icon name="search" size={13} color="#B0607A" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ border:"none", outline:"none", fontSize:13, background:"transparent", width:150 }} />
          </div>
          <BtnPrimary onClick={() => setModal(true)}><Icon name="plus" size={13} color="#fff" /> Prescrire examen</BtnPrimary>
        </div>
      </div>
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <Th cols={["Patiente","Type","Date","Heure","Résultat","Urgence","Statut","Actions"]} />
          <tbody>
            {list.map((e,i) => (
              <Tr key={i}>
                <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}><Av ini={e.ini} color={e.av} size={30} /><span style={{ fontWeight:500 }}>{e.patiente}</span></div></Td>
                <Td style={{ fontWeight:500 }}>{e.type}</Td>
                <Td style={{ color:"#6B4455" }}>{e.date}</Td>
                <Td style={{ color:"#6B4455" }}>{e.heure}</Td>
                <Td>{e.resultat ? <Bdg label={e.resultat} /> : <span style={{ color:"#B0607A" }}>—</span>}</Td>
                <Td>{e.urgence ? <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#FEF2F2", color:"#991B1B", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}><Icon name="alert" size={11} color="#991B1B" /> Urgent</span> : <span style={{ color:"#B0607A" }}>—</span>}</Td>
                <Td><Bdg label={e.statut} /></Td>
                <Td><div style={{ display:"flex", gap:5 }}>
                  <button style={{ border:"none", background:"#F0FDF4", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#166534" }}><Icon name="edit" size={12} /></button>
                  <button style={{ border:"none", background:"#EFF6FF", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#1D4ED8" }}><Icon name="pdf" size={12} /></button>
                </div></Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Prescrire un Examen" width={440}>
        <Sel label="Patiente" value="" onChange={() => {}} opts={[{v:"",l:"Sélectionner..."}, ...PATIENTES_DATA.map(p => ({v:p.id,l:p.nom}))]} />
        <Sel label="Type d'examen" value="" onChange={() => {}} opts={["Échographie","Prise de sang","Glycémie","Urine","TSH","Amniocentèse"].map(x=>({v:x,l:x}))} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <Inp label="Date" value="" onChange={() => {}} type="date" />
          <Inp label="Heure" value="" onChange={() => {}} type="time" />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <input type="checkbox" id="urg" style={{ width:16, height:16 }} />
          <label htmlFor="urg" style={{ fontSize:13, color:"#3B1A2E", fontWeight:500 }}>Marquer comme urgent</label>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Prescrire</button>
          <button onClick={() => setModal(false)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE VACCINATIONS ─────────────────────────────────────────────────────────
function PageVaccinations() {
  const [modal, setModal] = useState(false);

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <SectionTitle title="Vaccinations" sub="Suivi du carnet de vaccination" />
        <BtnPrimary onClick={() => setModal(true)}><Icon name="plus" size={13} color="#fff" /> Ajouter vaccination</BtnPrimary>
      </div>
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <Th cols={["Patiente","Vaccin","Date","Dose","Prochain rappel","Statut","Actions"]} />
          <tbody>
            {VACCINATIONS_DATA.map((v,i) => (
              <Tr key={i}>
                <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av ini={v.ini} color={v.av} size={30} /><span style={{ fontWeight:500 }}>{v.patiente}</span></div></Td>
                <Td><div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:26, height:26, borderRadius:7, background:"#F5F3FF", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="syringe" size={12} color="#7C3AED" /></div><span style={{ fontWeight:500 }}>{v.vaccin}</span></div></Td>
                <Td style={{ color:"#6B4455" }}>{v.date}</Td>
                <Td style={{ color:"#6B4455" }}>{v.dose}</Td>
                <Td style={{ color:"#6B4455" }}>{v.prochain}</Td>
                <Td><Bdg label={v.statut} /></Td>
                <Td><div style={{ display:"flex", gap:5 }}>
                  <button style={{ border:"none", background:"#F0FDF4", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#166534" }}><Icon name="check" size={12} /></button>
                  <button style={{ border:"none", background:"#F0F9FF", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#0369A1" }}><Icon name="edit" size={12} /></button>
                </div></Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Enregistrer une Vaccination" width={440}>
        <Sel label="Patiente" value="" onChange={() => {}} opts={[{v:"",l:"Sélectionner..."}, ...PATIENTES_DATA.map(p => ({v:p.id,l:p.nom}))]} />
        <Sel label="Vaccin" value="" onChange={() => {}} opts={["Tétanos-Diphtérie","Coqueluche","Grippe","Hépatite B","ROR","Polio"].map(x=>({v:x,l:x}))} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <Inp label="Date" value="" onChange={() => {}} type="date" />
          <Sel label="Dose" value="" onChange={() => {}} opts={["1ère","2ème","3ème","Rappel","Annual"].map(x=>({v:x,l:x}))} />
        </div>
        <Inp label="Prochain rappel" value="" onChange={() => {}} placeholder="2025 ou —" />
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button style={{ flex:1, background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Enregistrer</button>
          <button onClick={() => setModal(false)} style={{ flex:1, background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE PARAMÈTRES ───────────────────────────────────────────────────────────
function PageParametres() {
  const [f, setF] = useState({ nom:"Sophie Martin", email:"sophie@maternite.sn", tel:"77 000 00 00", maternite:"Maternité Ndieguene", notif:true, dark:false });

  return (
    <div style={{ animation:"fadeUp 0.4s ease", maxWidth:700 }}>
      <SectionTitle title="Paramètres" sub="Gérez votre profil et vos préférences" />
      <Card style={{ padding:"22px 24px", marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#3B1A2E", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}><Icon name="users" size={14} color="#E91E8C" /> Profil utilisateur</div>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20, background:"#FFF7FB", padding:16, borderRadius:12 }}>
          <div style={{ width:58, height:58, borderRadius:16, background:"#E91E8C", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#fff", fontWeight:700 }}>S</div>
          <div><div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#3B1A2E" }}>Sophie Martin</div><div style={{ fontSize:12, color:"#B0607A" }}>Sage-femme · {f.maternite}</div></div>
          <button style={{ marginLeft:"auto", background:"#FCE4F0", color:"#E91E8C", border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>Changer photo</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
          <Inp label="Nom complet" value={f.nom} onChange={v => setF({...f,nom:v})} />
          <Inp label="Email" value={f.email} onChange={v => setF({...f,email:v})} />
          <Inp label="Téléphone" value={f.tel} onChange={v => setF({...f,tel:v})} />
          <Inp label="Maternité" value={f.maternite} onChange={v => setF({...f,maternite:v})} />
        </div>
      </Card>

      <Card style={{ padding:"22px 24px", marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#3B1A2E", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}><Icon name="cog" size={14} color="#E91E8C" /> Préférences</div>
        {[["Notifications activées","notif"],["Mode sombre","dark"]].map(([l,k]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #FFF0F7" }}>
            <span style={{ fontSize:13, color:"#3B1A2E", fontWeight:500 }}>{l}</span>
            <div onClick={() => setF({...f,[k]:!f[k]})} style={{ width:44, height:24, borderRadius:12, background:f[k]?"#E91E8C":"#FCE4F0", position:"relative", cursor:"pointer", transition:"background 0.2s" }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:f[k]?23:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }} />
            </div>
          </div>
        ))}
      </Card>

      <button style={{ background:"#E91E8C", color:"#fff", border:"none", borderRadius:9, padding:"11px 24px", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
        <Icon name="check" size={14} color="#fff" /> Sauvegarder
      </button>
    </div>
  );
}

