# AXE — Plateforme de mise en relation · Corps · Sport · Santé

> "Votre staff personnel pour reprendre, progresser, récupérer."

AXE connecte des clients avec des professionnels du corps (coachs, kinés, ostéos, médecins du sport, préparateurs physiques) via une plateforme web premium et sobre.

---

## Stack technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Firebase Auth** — authentification email/password + Google
- **Firestore** — base de données temps réel
- **Firebase Storage** — documents justificatifs des professionnels
- **Vercel** — déploiement

---

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd axe

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir les valeurs Firebase dans .env.local

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Configuration Firebase

### 1. Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquer **"Ajouter un projet"**
3. Nommer le projet `axe-prod` (ou `axe-dev` pour les tests)
4. Désactiver Google Analytics si non nécessaire

### 2. Activer Authentication

1. Aller dans **Authentication → Sign-in method**
2. Activer **Email/Password**
3. Activer **Google** (ajouter l'email support)

### 3. Créer la base Firestore

1. Aller dans **Firestore Database → Créer une base de données**
2. Choisir le mode **Production** (ou Test pour démarrer)
3. Choisir la région Europe (`eur3` ou `europe-west1`)

### 4. Activer Storage

1. Aller dans **Storage → Commencer**
2. Choisir les règles de sécurité par défaut

### 5. Récupérer les clés

1. Aller dans **Paramètres du projet → Vos applications → Web**
2. Créer une application Web
3. Copier l'objet `firebaseConfig`

### 6. Variables d'environnement

Remplir `.env.local` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=axe-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=axe-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=axe-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Règles Firestore recommandées (V1)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Demandes : lecture/écriture publique en création
    // (en production, restreindre la lecture aux admins)
    match /requests/{id} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }

    // Professionnels : création publique, lecture/modif auth
    match /professionals/{id} {
      allow create: if true;
      allow read: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

> **Note :** Pour la production, restreindre les `update` aux seuls admins via Custom Claims Firebase.

---

## Règles Firebase Storage

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{allPaths=**} {
      // Écriture autorisée (upload documents pro)
      allow write: if true;
      // Lecture réservée aux utilisateurs connectés
      allow read: if request.auth != null;
    }
  }
}
```

---

## Admins

Ajouter les emails admins dans `src/lib/constants.ts` :

```ts
export const ADMIN_EMAILS = [
  "votre@email.fr",
];
```

Les admins accèdent à `/admin` pour :
- Voir et filtrer les demandes clients
- Changer le statut des demandes (new → contacted → matched → closed)
- Voir et filtrer les professionnels
- Approuver / Refuser les professionnels
- Assigner un professionnel à une demande

---

## Lancement local

```bash
npm run dev       # Développement (hot-reload)
npm run build     # Build de production
npm run start     # Serveur de production local
npm run lint      # Vérification ESLint
```

---

## Déploiement Vercel

```bash
# Option 1 : via CLI Vercel
npm i -g vercel
vercel

# Option 2 : connecter le repo GitHub sur vercel.com
# → Import project → ajouter les variables d'environnement
```

Les variables `.env.local` doivent être ajoutées manuellement dans **Vercel → Settings → Environment Variables**.

---

## Architecture des collections Firestore

### `requests` — Demandes clients

| Champ | Type | Description |
|-------|------|-------------|
| firstName, lastName | string | Identité |
| email, phone | string | Contact |
| city, postalCode | string | Localisation |
| homeVisit | boolean | Déplacement à domicile |
| radius | string | Rayon de recherche |
| goal | string | Objectif principal |
| bodyArea | string | Zone du corps concernée |
| urgency | string | Niveau d'urgence |
| preferredProfession | string | Type de pro souhaité |
| budget | string | Budget indicatif |
| message | string | Message libre |
| status | enum | new / contacted / matched / closed |
| assignedProfessionalId | string? | ID du pro assigné |
| createdAt | timestamp | Date de création |

### `professionals` — Profils professionnels

| Champ | Type | Description |
|-------|------|-------------|
| firstName, lastName | string | Identité |
| email, phone | string | Contact |
| city, postalCode | string | Localisation |
| interventionArea | string | Zone d'intervention |
| homeVisit | boolean | Déplacement à domicile |
| radius | string | Rayon de déplacement |
| profession | enum | coach / physical_trainer / kine / osteo / sports_doctor / recovery |
| specialties | string[] | Liste de spécialités |
| experienceYears | number | Années d'expérience |
| diploma | string | Diplôme / Certification |
| rppsOrAdeli | string? | Numéro professionnel santé |
| hasInsurance | boolean | RC Pro |
| insuranceCompany | string? | Compagnie d'assurance |
| documentUrl | string? | URL document justificatif (Storage) |
| bio | string | Présentation |
| website, instagram, linkedin | string? | Liens |
| status | enum | pending / approved / rejected |
| subscriptionStatus | enum | free / premium / inactive |
| trustLevel | enum | unverified / verified / certified / elite |
| createdAt | timestamp | Date d'inscription |

---

## Limites de la V1

- Pas de paiement (Stripe prévu V2)
- Pas de géolocalisation (carte, rayon GPS) — uniquement ville + CP
- Pas de messagerie intégrée entre client et pro
- Pas d'agenda / calendrier
- Pas d'avis clients
- Matching 100% manuel par l'admin
- Pas de Custom Claims Firebase (admin identifié par email, à durcir en production)
- Pas d'emails transactionnels automatiques

---

## Roadmap V2

### Paiement
- Intégration **Stripe** : frais de service client (5–15 €/demande), abonnements professionnels (Free / 29 € / 79 € / 149 €)
- Commission sur mission (10–20%)
- Assurance partenaire pour les indépendants

### Géolocalisation
- Géocodage adresse → latitude/longitude (Google Maps API ou Mapbox)
- Recherche de pros par distance réelle
- Carte interactive
- Rayon de déplacement visualisé

### Fonctionnalités
- Messagerie in-app client ↔ pro
- Calendrier et disponibilités
- Avis clients vérifiés
- Notifications email (Firebase Extensions ou SendGrid)
- Custom Claims Firebase pour sécuriser l'admin
- Tableau de bord statistiques admin

### Label AXE
- Progression automatique du trustLevel selon : diplôme vérifié / assurance vérifiée / expérience / avis clients / validation humaine

---

## Mentions importantes

AXE est une plateforme de mise en relation. AXE ne fournit pas de diagnostic médical et ne remplace pas une consultation médicale d'urgence.

**En cas d'urgence : appelez le 15 ou le 112.**
