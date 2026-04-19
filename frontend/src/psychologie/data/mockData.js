export const patients = [
  { id: 1, nom: "Céline Lambert",    initiales: "CL", motif: "Suivi dépression",      statut: "rappeler",  heure: "15:00", date: "Aujourd'hui" },
  { id: 2, nom: "David Lefèvre",     initiales: "DL", motif: "Burn-out",              statut: "demain",    heure: "18:00", date: "Demain" },
  { id: 3, nom: "Lucie Lefèvre",     initiales: "LL", motif: "Séance couple",         statut: "libre",     heure: null,    date: null },
  { id: 4, nom: "Elise Bernard",     initiales: "EB", motif: "Séance damel",          statut: "urgent",    heure: null,    date: null },
  { id: 5, nom: "Pierre Lambert",    initiales: "PL", motif: "TCC (Trouble anxieux)", statut: "demain",    heure: "11:30", date: "Demain" },
  { id: 6, nom: "Mélanie Dubois",    initiales: "MD", motif: "Séance de couple",      statut: "normal",    heure: "09:00", date: "Ven. 26 Avr." },
  { id: 7, nom: "Rline Bernard",     initiales: "RB", motif: "Suivi burn-out",        statut: "normal",    heure: "09:00", date: "Mai 26" },
  { id: 8, nom: "Raphaël Martin",    initiales: "RM", motif: "TCC (trouble anxieux)", statut: "demain",    heure: null,    date: "23 Avr. 2024" },
  { id: 9, nom: "Nicolas Girard",    initiales: "NG", motif: "Suivi burn-out",        statut: "urgent",    heure: "09:00", date: "Ven. 26 Avr." },
  { id:10, nom: "Dr Pierre Lambert", initiales: "PL", motif: "Dossier IntdOut",       statut: "urgent",    heure: null,    date: null },
];

export const messages = [
  { id: 1, de: "Céline Lambert",    initiales: "CL", apercu: "Bonjour Antoine, je souhaiter...", heure: "15:30", statut: "heure",  urgence: false },
  { id: 2, de: "Dr Pierre Lambert", initiales: "PL", apercu: "Dossier IntdOut",                   heure: null,    statut: "urgent", urgence: true },
  { id: 3, de: "Mélanie Dubois",    initiales: "MD", apercu: "Reener 1H0235",                     heure: null,    statut: "urgent", urgence: true },
  { id: 4, de: "Nicolas Girard",    initiales: "NG", apercu: "Dossier shtoalae",                  heure: null,    statut: "urgent", urgence: true },
];

export const rdvAujourdhui = [
  { heure: "09:00", nom: "Pierre Lambert",    motif: "TCC séance 4", salle: "A1" },
  { heure: "10:30", nom: "Mélanie Dubois",    motif: "Couple – suivi", salle: "A2" },
  { heure: "12:00", nom: "Céline Lambert",    motif: "Dépression – bilan", salle: "A1" },
  { heure: "14:00", nom: "David Lefèvre",     motif: "Burn-out séance 2", salle: "A3" },
  { heure: "15:30", nom: "Nicolas Girard",    motif: "Anxiété", salle: "A1" },
  { heure: "17:00", nom: "Lucie Lefèvre",     motif: "Couple – séance 1", salle: "A2" },
  { heure: "18:00", nom: "Elise Bernard",     motif: "Séance enfant", salle: "A1" },
];

export const dossiers = [
  { id: 1, nom: "Céline Lambert",    initiales: "CL", diagnostic: "Dépression majeure",  seances: 12, prochaine: "Aujourd'hui", statut: "actif" },
  { id: 2, nom: "David Lefèvre",     initiales: "DL", diagnostic: "Burn-out",            seances: 5,  prochaine: "Demain",       statut: "actif" },
  { id: 3, nom: "Mélanie Dubois",    initiales: "MD", diagnostic: "Thérapie de couple",  seances: 8,  prochaine: "26 Avr.",      statut: "actif" },
  { id: 4, nom: "Raphaël Martin",    initiales: "RM", diagnostic: "TCC – Anxiété",       seances: 3,  prochaine: "23 Avr.",      statut: "urgent" },
  { id: 5, nom: "Elise Bernard",     initiales: "EB", diagnostic: "Thérapie enfant",     seances: 6,  prochaine: "20 Avr.",      statut: "urgent" },
  { id: 6, nom: "Nicolas Girard",    initiales: "NG", diagnostic: "Anxiété généralisée", seances: 4,  prochaine: "26 Avr.",      statut: "urgent" },
  { id: 7, nom: "Pierre Lambert",    initiales: "PL", diagnostic: "TCC – Phobie sociale",seances: 9,  prochaine: "Demain",       statut: "actif" },
  { id: 8, nom: "Lucie Lefèvre",     initiales: "LL", diagnostic: "Couple",              seances: 2,  prochaine: "Libre",        statut: "libre" },
];
