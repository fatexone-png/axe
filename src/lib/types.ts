import { Timestamp } from "firebase/firestore";

// ──────────────────────────────────────────────
// Shared
// ──────────────────────────────────────────────

export type RequestStatus = "new" | "contacted" | "matched" | "closed";

export type ProfessionalStatus = "pending" | "approved" | "rejected";

export type SubscriptionStatus = "free" | "premium" | "inactive";

// V2: business model - abonnement pro
// free   : profil visible, fonctionnalités limitées
// premium: 29 €/mois — visibilité renforcée, leads prioritaires
// inactive: abonnement expiré ou suspendu
// Prévoir aussi: pro (79€), elite (149€)

export type TrustLevel = "unverified" | "verified" | "certified" | "elite";
// unverified : inscrit, non vérifié
// verified   : diplôme/assurance vérifiés par admin
// certified  : vérification + expérience + avis clients validés
// elite      : top réseau AXE

export type Profession =
  | "coach"
  | "physical_trainer"
  | "kine"
  | "osteo"
  | "sports_doctor"
  | "recovery";

// ──────────────────────────────────────────────
// Firestore: requests
// ──────────────────────────────────────────────

export interface ClientRequest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  address?: string;
  homeVisit: boolean;
  radius: string;
  goal: string;
  bodyArea: string;
  urgency: string;
  preferredProfession: string;
  budget: string;
  message: string;
  status: RequestStatus;
  assignedProfessionalId?: string;
  createdAt: Timestamp | Date;
  // V2: lat?: number; lng?: number;
}

// ──────────────────────────────────────────────
// Firestore: professionals
// ──────────────────────────────────────────────

export interface InterventionLocation {
  city: string;
  postalCode: string;
  // V2: lat?: number; lng?: number;
}

export interface Professional {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Ville principale (adresse de référence)
  city: string;
  postalCode: string;
  // Toutes les zones d'intervention (multi-villes)
  locations: InterventionLocation[];
  homeVisit: boolean;
  radius: string;
  profession: Profession;
  specialties: string[];
  experienceYears: number;
  diploma: string;
  rppsOrAdeli?: string;
  // ── RC Pro ──────────────────────────────────
  hasInsurance: boolean;
  insuranceCompany?: string;
  // V2: insurancePolicyUrl?: string;
  insuranceOfferSent?: boolean;

  // ── Mutuelle santé sport ─────────────────────
  // Complémentaire santé adaptée aux indépendants du sport
  // Partenaire cible : Alan, Malakoff Humanis, April…
  hasMutuelle?: boolean;
  mutuelleCompany?: string;
  mutuelleOfferSent?: boolean;

  // ── Retraite / Prévoyance ─────────────────────
  // PER individuel ou contrat Madelin pour auto-entrepreneurs
  // Partenaire cible : Linxea, Placement-direct, AXA Épargne…
  hasRetirement?: boolean;
  retirementCompany?: string;
  retirementOfferSent?: boolean;

  documentUrl?: string;
  bio: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  // ── Informations légales & facturation ───────
  siret?: string
  legalStatus?: "auto_entrepreneur" | "ei" | "eurl" | "sasu" | "sas" | "salarie" | "other"
  vatNumber?: string        // numéro TVA intracommunautaire
  vatExempt?: boolean       // franchise en base TVA (auto-entrepreneurs sous seuil)
  // V2: pennylaneAccountId?: string
  // V2: billingProvider?: "pennylane" | "sellsy" | "indy" | "other"

  status: ProfessionalStatus;
  subscriptionStatus: SubscriptionStatus;
  trustLevel: TrustLevel;
  createdAt: Timestamp | Date;
  // V2: lat?: number; lng?: number;
  // V2: averageRating?: number; reviewCount?: number;
  // V2: calendarUrl?: string;
  // V2: stripeCustomerId?: string; stripePriceId?: string;
}

// ──────────────────────────────────────────────
// Facturation électronique
// ──────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled"

export interface Invoice {
  id?: string
  invoiceNumber: string       // ex: AXE-2026-001
  requestId: string
  professionalId: string

  // Émetteur (professionnel)
  proFirstName: string
  proLastName: string
  proEmail: string
  proPhone: string
  proCity: string
  proSiret?: string
  proLegalStatus?: string
  proVatNumber?: string
  proVatExempt?: boolean

  // Destinataire (client)
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientCity: string

  // Prestation
  description: string
  quantity: number
  unitPrice: number           // HT
  vatRate: number             // 0 si franchise TVA
  vatAmount: number
  totalHT: number
  totalTTC: number

  status: InvoiceStatus
  issuedAt: string            // ISO date
  dueAt: string               // ISO date (30 jours par défaut)
  createdAt: Timestamp | Date

  // V2: pennylaneInvoiceId?: string
  // V2: signedDocumentUrl?: string
}

export const LEGAL_STATUS_LABELS: Record<string, string> = {
  auto_entrepreneur: "Auto-entrepreneur / Micro-entrepreneur",
  ei: "Entreprise Individuelle (EI)",
  eurl: "EURL",
  sasu: "SASU",
  sas: "SAS",
  salarie: "Salarié",
  other: "Autre",
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export type UserRole = "client" | "professional" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
}

export interface Review {
  id?: string;
  proId: string;
  authorName: string;
  authorEmail: string;
  rating: number; // 1 à 5
  comment: string;
  createdAt: Date | import("firebase/firestore").Timestamp;
  approved: boolean;
}
