import { Timestamp } from "firebase/firestore";

// ──────────────────────────────────────────────
// Shared
// ──────────────────────────────────────────────

export type RequestStatus = "new" | "contacted" | "matched" | "closed";

export type ProfessionalStatus = "pending" | "approved" | "rejected" | "suspended";

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
// elite      : top réseau GetAxe

export type Profession =
  | "coach"
  | "physical_trainer"
  | "mental_coach"
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

export interface ServiceItem {
  name: string;
  durationMinutes: number;
  priceEuros: number;
  description?: string;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeRange {
  start: string; // "09:00"
  end: string;   // "18:00"
}

export interface ScheduleSlot {
  day: DayOfWeek;
  location: string;  // ex: "Cabinet Paris 10e", "À domicile", "En ligne"
  timeRanges: TimeRange[]; // plages horaires du jour, ex: [{start:"09:00",end:"12:00"},{start:"14:00",end:"18:00"}]
}

export interface CancellationRule {
  hoursBeforeSession: number; // ex: 1, 3, 24
  refundPercent: number;      // 0 à 100
}

export interface CancellationPolicy {
  rules: CancellationRule[];
  proCanWaiveFees: boolean;
  proCompensationPercent?: number;
}

export interface AvailabilityPeriod {
  id: string;
  label?: string;      // ex: "Printemps 2026"
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  days: DayOfWeek[];   // ["monday", "wednesday"]
  startTime: string;   // "09:00"
  endTime: string;     // "18:00"
  location: string;    // "Cabinet Paris 15e"
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
  adminNote?: string;
  subscriptionStatus: SubscriptionStatus;
  trustLevel: TrustLevel;
  createdAt: Timestamp | Date;
  averageRating?: number;
  reviewCount?: number;
  lat?: number
  lng?: number
  // V2: calendarUrl?: string;
  // V2: stripeCustomerId?: string; stripePriceId?: string;

  // Stripe Connect
  stripeAccountId?: string;
  stripeAccountStatus?: "pending" | "active" | "restricted";

  // Tarifs, planning & annulation
  services?: ServiceItem[];
  schedule?: ScheduleSlot[];           // legacy weekly template
  availabilityPeriods?: AvailabilityPeriod[];
  cancellationPolicy?: CancellationPolicy;
}

// ──────────────────────────────────────────────
// Facturation électronique
// ──────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled"

export interface InvoiceLine {
  id: string
  type: string          // type de prestation (ex: "Séance individuelle")
  description: string   // description libre
  date?: string         // date de la séance ISO (optionnel)
  participants?: number // cours collectif uniquement
  quantity: number
  unitPrice: number
  totalLine: number     // quantity * unitPrice
}

export interface Invoice {
  id?: string
  invoiceNumber: string       // ex: GETAXE-2026-001
  requestId: string
  professionalId: string

  // Émetteur (professionnel)
  proFirstName: string
  proLastName: string
  proEmail: string
  proPhone: string
  proAddress?: string
  proCity: string
  proSiret?: string
  proLegalStatus?: string
  proVatNumber?: string
  proVatExempt?: boolean

  // Destinataire (client)
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientAddress?: string
  clientCity: string

  // Facturation B2B (optionnel — quand le client veut une facture au nom de son entreprise)
  invoiceType?: "B2C" | "B2B"
  clientCompanyName?: string
  clientSiret?: string
  clientVatNumber?: string
  // V2: pennylaneInvoiceId pour les factures B2B après 2028

  // Prestation
  lines: InvoiceLine[]        // lignes de facturation
  description: string         // résumé (première ligne ou titre)
  quantity: number            // conservé pour compat
  unitPrice: number           // conservé pour compat
  vatRate: number             // 0 si franchise TVA
  vatAmount: number
  totalHT: number
  totalTTC: number

  status: InvoiceStatus
  issuedAt: string            // ISO date
  dueAt: string               // ISO date (30 jours par défaut)
  createdAt: Timestamp | Date

  // Coordonnées bancaires (optionnel — virement)
  iban?: string
  bic?: string

  // Mentions légales — obligatoire B2B, optionnel B2C
  showLatePaymentClause?: boolean

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

// ──────────────────────────────────────────────
// Stripe Connect – Bookings
// ──────────────────────────────────────────────

export type BookingStatus = "pending_payment" | "paid" | "session_confirmed" | "released" | "cancelled" | "disputed"

export interface Booking {
  id?: string
  proId: string
  proEmail: string
  proStripeAccountId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  sessionType: string
  sessionDate: string
  slotTime?: string          // heure choisie ex: "10:00"
  sessionLocation?: string   // lieu de la séance
  amountEuros: number
  amountCents: number
  platformFeeCents: number
  proPayoutCents: number
  status: BookingStatus
  stripeSessionId?: string
  stripePaymentIntentId?: string
  createdAt: Date | import("firebase/firestore").Timestamp
  paidAt?: Date | import("firebase/firestore").Timestamp
  confirmedAt?: Date | import("firebase/firestore").Timestamp
  cancelledAt?: Date | import("firebase/firestore").Timestamp
  cancelledBy?: "client" | "pro"
  refundPercent?: number
  refundAmountCents?: number
  proWaivedFees?: boolean
  promoCodeForClient?: string

  // Facturation B2B
  invoiceTo?: "personal" | "company"
  companyName?: string
  companySiret?: string
  companyVatNumber?: string
  companyAddress?: string
}

// ──────────────────────────────────────────────
// Notifications in-app
// ──────────────────────────────────────────────

export type NotificationType = "new_booking" | "payment_released" | "cancellation" | "invoice_sent"

export interface AppNotification {
  id?: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: Date | Timestamp
}

// ──────────────────────────────────────────────
// Messagerie
// ──────────────────────────────────────────────

export interface Conversation {
  id?: string
  proId: string
  proEmail: string
  clientEmail: string
  clientName: string
  proName: string
  lastMessage?: string
  lastMessageAt?: Date | Timestamp
  unreadPro: number
  unreadClient: number
  createdAt: Date | Timestamp
}

export interface ChatMessage {
  id?: string
  conversationId: string
  from: string        // email of sender
  content: string
  createdAt: Date | Timestamp
  read: boolean
}
