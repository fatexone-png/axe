// Admin emails — accès réservé au tableau de bord /admin
export const ADMIN_EMAILS: string[] = [
  "brice.faradji@gmail.com",
  // ajouter d'autres admins ici
];

export const APP_NAME = "GetAxe";
export const APP_TAGLINE = "La référence des professionnels\ndu sport et de la santé.";

// ──────────────────────────────────────────────
// Business model V2 (préparation Stripe)
// ──────────────────────────────────────────────

// Commission sur mise en relation client (V2)
// CLIENT_SERVICE_FEE_MIN = 5   // €
// CLIENT_SERVICE_FEE_MAX = 15  // €

// Abonnements professionnels (V2)
// SUB_FREE_LABEL    = "Free"    — profil limité
// SUB_PREMIUM_PRICE = 29        // €/mois
// SUB_PRO_PRICE     = 79        // €/mois
// SUB_ELITE_PRICE   = 149       // €/mois

// Commission sur mission (V2)
// COMMISSION_MIN = 0.10  // 10%
// COMMISSION_MAX = 0.20  // 20%

export const URGENCY_LABELS: Record<string, string> = {
  info: "Simple renseignement",
  this_week: "Cette semaine",
  quick: "Rapidement",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  contacted: "Contactée",
  matched: "Matchée",
  closed: "Fermée",
};

export const PRO_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

export const TRUST_LEVEL_LABELS: Record<string, string> = {
  unverified: "Non vérifié",
  verified: "Vérifié",
  certified: "Certifié",
  elite: "Elite GetAxe",
};

export const PROFESSION_LABELS: Record<string, string> = {
  coach: "Coach sportif",
  physical_trainer: "Préparateur physique",
  mental_coach: "Préparateur mental",
  kine: "Kinésithérapeute",
  osteo: "Ostéopathe",
  sports_doctor: "Médecin du sport",
  recovery: "Récupération / Mobilité",
};
