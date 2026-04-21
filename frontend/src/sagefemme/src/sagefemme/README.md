# Interface Sage-Femme — Système de Gestion Maternité

## Installation

### 1. Copier dans src/
```
src/
└── sagefemme/
```

### 2. Modifier src/App.js
```jsx
import App from './sagefemme/App';
export default App;
```

### 3. Fichier .env à la racine
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Lancer
```bash
npm start
```

## Fonctionnalités complètes

| Onglet | Fonctionnalités |
|--------|----------------|
| 🏠 Accueil | Stats, RDV du jour, grossesses à risque |
| 👩 Patientes | Voir dossiers, créer grossesses + consultations (SF/Planning/Infectio/Transfert gynéco) |
| 📅 Rendez-vous | Vue liste + planning horaire, CONFIRMER les RDV planifiés |
| 🤰 Suivi Grossesse | Suivi SA, risque, enregistrer accouchement + nouveau-né (2 étapes) |
| 👶 Postnatal | Dossiers nouveau-nés + APGAR |
| 🔬 Examens | Prescrire examens, voir résultats |
| 💉 Vaccinations | Calendrier vaccinal + suivi par enfant |
| ⚙️ Paramètres | Changer mot de passe |

## Règles métier importantes

- ❌ La sage-femme NE crée PAS les patientes (secrétaire)
- ❌ La sage-femme NE crée PAS les RDV (secrétaire)
- ✅ La sage-femme CONFIRME les RDV créés par la secrétaire
- ✅ La sage-femme note le prochain_rdv recommandé dans la consultation
- ✅ La sage-femme peut TRANSFÉRER un dossier vers un gynécologue (complication)
- ✅ La sage-femme gère Planning + Infectiologie
