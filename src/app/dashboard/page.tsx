"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User, deleteUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  getProfessionalByEmail,
  getBookingsByPro,
  updateProfessionalServices,
  updateProfessionalAvailability,
  updateProfessionalInsurance,
  updateCancellationPolicy,
} from "@/lib/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import {
  Professional, Booking, BookingStatus,
  ServiceItem, DayOfWeek, CancellationPolicy, CancellationRule,
  AvailabilityPeriod,
} from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import { isAdmin } from "@/lib/auth";
import ProtectionDashboard from "@/components/ProtectionDashboard";
import StatusBadge from "@/components/StatusBadge";
import DashboardFacturation from "@/components/DashboardFacturation";
import MessagingPanel from "@/components/MessagingPanel";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "accueil" | "reservations" | "tarifs" | "protection" | "paiements" | "facturation" | "messages" | "analytics";

// ─── Booking status ───────────────────────────────────────────────────────────

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payé — séance à confirmer",
  session_confirmed: "Confirmation en cours",
  released: "Versé",
  cancelled: "Annulé",
  disputed: "Litige",
};

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending_payment: "bg-white/5 text-axe-muted",
  paid: "bg-axe-amber/10 text-axe-amber",
  session_confirmed: "bg-blue-500/10 text-blue-400",
  released: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  disputed: "bg-orange-500/10 text-orange-400",
};

// ─── Planning ─────────────────────────────────────────────────────────────────

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "monday",    label: "Lundi"    },
  { key: "tuesday",   label: "Mardi"    },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday",  label: "Jeudi"    },
  { key: "friday",    label: "Vendredi" },
  { key: "saturday",  label: "Samedi"   },
  { key: "sunday",    label: "Dimanche" },
];

const DURATIONS = [30, 45, 60, 75, 90, 120];

const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: "Lun", tuesday: "Mar", wednesday: "Mer",
  thursday: "Jeu", friday: "Ven", saturday: "Sam", sunday: "Dim",
};

// ─── Politique d'annulation ───────────────────────────────────────────────────

const CANCEL_TIERS: { hours: number; label: string }[] = [
  { hours: 24, label: "Plus de 24h avant" },
  { hours: 3,  label: "Entre 3h et 24h avant" },
  { hours: 1,  label: "Entre 1h et 3h avant" },
];

const DEFAULT_POLICY: CancellationPolicy = {
  rules: [
    { hoursBeforeSession: 24, refundPercent: 100 },
    { hoursBeforeSession: 3,  refundPercent: 50  },
    { hoursBeforeSession: 1,  refundPercent: 0   },
  ],
  proCanWaiveFees: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pro, setPro] = useState<Professional | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("accueil");
  const [onboarding, setOnboarding] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  // Tarifs
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [savingServices, setSavingServices] = useState(false);
  const [servicesSaved, setServicesSaved] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState(60);
  const [newPrice, setNewPrice] = useState<number>(60);
  const [newDesc, setNewDesc] = useState("");

  // Disponibilités par période
  const [availPeriods, setAvailPeriods] = useState<AvailabilityPeriod[]>([]);
  const [savingAvail, setSavingAvail] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [newPLabel, setNewPLabel] = useState("");
  const [newPStart, setNewPStart] = useState("");
  const [newPEnd, setNewPEnd] = useState("");
  const [newPDays, setNewPDays] = useState<DayOfWeek[]>([]);
  const [newPStartTime, setNewPStartTime] = useState("09:00");
  const [newPEndTime, setNewPEndTime] = useState("18:00");
  const [newPLocation, setNewPLocation] = useState("");

  // Politique d'annulation
  const [policy, setPolicy] = useState<CancellationPolicy>(DEFAULT_POLICY);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);

  // Annulation réservations
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelResults, setCancelResults] = useState<Record<string, { promoCode?: string; refundEuros: number }>>({});

  // Suppression compte RGPD
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      try {
        const proProfile = await getProfessionalByEmail(u.email!);
        if (!proProfile) { router.push("/dashboard/client"); return; }
        setPro(proProfile);
        setServices(proProfile.services ?? []);
        setAvailPeriods(proProfile.availabilityPeriods ?? []);
        setPolicy(proProfile.cancellationPolicy ?? DEFAULT_POLICY);
        if (proProfile?.id) {
          try {
            const proBookings = await getBookingsByPro(proProfile.id);
            setBookings(proBookings);
          } catch {
            setBookings([]);
          }
        }
      } catch {
        // Erreur Firestore non critique
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  // ── Suppression compte RGPD ──────────────────────────────────────────────────

  async function handleDeleteAccount() {
    if (!user) return;
    setDeletingAccount(true);
    try {
      if (pro?.id && db) {
        await deleteDoc(doc(db, "professionals", pro.id));
      }
      await deleteUser(user);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("requires-recent-login")) {
        alert("Pour supprimer votre compte, veuillez vous reconnecter puis réessayer.");
        router.push("/login");
      } else {
        alert("Erreur lors de la suppression. Contactez contact@getaxe.fr");
      }
    } finally {
      setDeletingAccount(false);
    }
  }

  // ── Stripe ───────────────────────────────────────────────────────────────────

  async function handleStripeOnboard() {
    if (!pro?.id || !user?.email) return;
    setOnboarding(true);
    setOnboardError(null);
    try {
      const res = await fetch("/api/stripe/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proId: pro.id, email: user.email, name: `${pro.firstName} ${pro.lastName}` }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) { setOnboardError(data.error ?? "Une erreur est survenue."); return; }
      window.location.href = data.url;
    } catch {
      setOnboardError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setOnboarding(false);
    }
  }

  // ── Tarifs ───────────────────────────────────────────────────────────────────

  function addService() {
    if (!newName.trim() || newPrice <= 0) return;
    const desc = newDesc.trim();
    setServices((prev) => [...prev, { name: newName.trim(), durationMinutes: newDuration, priceEuros: newPrice, ...(desc ? { description: desc } : {}) }]);
    setNewName(""); setNewDuration(60); setNewPrice(60); setNewDesc("");
    setServicesSaved(false);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
    setServicesSaved(false);
  }

  async function saveServices() {
    if (!pro?.id) return;
    setSavingServices(true);
    try { await updateProfessionalServices(pro.id, services); setServicesSaved(true); }
    finally { setSavingServices(false); }
  }

  // ── Disponibilités ───────────────────────────────────────────────────────────

  function addPeriod() {
    if (!newPStart || !newPEnd || newPDays.length === 0 || !newPLocation.trim()) return;
    const label = newPLabel.trim();
    const period: AvailabilityPeriod = {
      id: Date.now().toString(),
      ...(label ? { label } : {}),
      startDate: newPStart,
      endDate: newPEnd,
      days: newPDays,
      startTime: newPStartTime,
      endTime: newPEndTime,
      location: newPLocation.trim(),
    };
    setAvailPeriods((prev) => [...prev, period]);
    setNewPLabel(""); setNewPStart(""); setNewPEnd("");
    setNewPDays([]); setNewPStartTime("09:00"); setNewPEndTime("18:00"); setNewPLocation("");
    setShowAddPeriod(false);
    setAvailSaved(false);
  }

  function removePeriod(id: string) {
    setAvailPeriods((prev) => prev.filter((p) => p.id !== id));
    setAvailSaved(false);
  }

  async function saveAvailability() {
    if (!pro?.id) return;
    setSavingAvail(true);
    try { await updateProfessionalAvailability(pro.id, availPeriods); setAvailSaved(true); }
    finally { setSavingAvail(false); }
  }

  // ── RC Pro ────────────────────────────────────────────────────────────────────

  async function handleDeclareInsurance(company: string) {
    if (!pro?.id) return;
    await updateProfessionalInsurance(pro.id, true, company);
    setPro((prev) => prev ? { ...prev, hasInsurance: true, insuranceCompany: company } : prev);
  }

  // ── Politique d'annulation ────────────────────────────────────────────────────

  function updateRulePercent(hours: number, refundPercent: number) {
    setPolicy((prev) => ({
      ...prev,
      rules: prev.rules.map((r) =>
        r.hoursBeforeSession === hours ? { ...r, refundPercent } : r
      ),
    }));
    setPolicySaved(false);
  }

  function getRulePercent(hours: number): number {
    return policy.rules.find((r: CancellationRule) => r.hoursBeforeSession === hours)?.refundPercent ?? 0;
  }

  async function savePolicy() {
    if (!pro?.id) return;
    setSavingPolicy(true);
    try { await updateCancellationPolicy(pro.id, policy); setPolicySaved(true); }
    finally { setSavingPolicy(false); }
  }

  // ── Annulation réservation ────────────────────────────────────────────────────

  async function handleCancelBooking(bookingId: string) {
    setCancellingId(bookingId);
    const compPct = policy.proCompensationPercent ?? 0;
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, cancelledBy: "pro", callerEmail: pro?.email ?? "", proWaivedFees: compPct > 0 }),
      });
      const data = (await res.json()) as { refundAmountEuros?: number; promoCode?: string; error?: string };
      if (!res.ok) { alert(data.error ?? "Erreur lors de l'annulation."); return; }
      setCancelResults((prev) => ({
        ...prev,
        [bookingId]: { refundEuros: data.refundAmountEuros ?? 0, promoCode: data.promoCode },
      }));
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    } finally {
      setCancellingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted">Chargement…</p>
      </div>
    );
  }

  const stripeActive = pro?.stripeAccountId && pro?.stripeAccountStatus === "active";
  const pendingBookings = bookings.filter((b) => b.status === "paid" || b.status === "session_confirmed");
  const totalEarned = bookings.filter((b) => b.status === "released").reduce((sum, b) => sum + Math.round(b.amountEuros * 0.92), 0);

  const TABS: { key: Tab; label: string }[] = [
    { key: "accueil",      label: "Accueil" },
    { key: "reservations", label: `Réservations${pendingBookings.length > 0 ? ` (${pendingBookings.length})` : ""}` },
    { key: "tarifs",       label: "Tarifs & dispo" },
    { key: "protection",   label: "Protection" },
    { key: "paiements",    label: "Paiements" },
    { key: "facturation",  label: "Facturation" },
    { key: "messages",     label: "Messages" },
    { key: "analytics",    label: "Analytiques" },
  ];

  return (
    <div className="min-h-screen bg-axe-black pt-20 pb-16">

      {/* ── Header ── */}
      <div className="border-b border-white/5 bg-axe-black">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-axe-white">
                {pro ? `${pro.firstName} ${pro.lastName}` : "Mon espace"}
              </h1>
              <p className="text-xs text-axe-muted mt-0.5">
                {pro ? (PROFESSION_LABELS[pro.profession] ?? pro.profession) : user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pro && <StatusBadge status={pro.status} />}
              {isAdmin(user) && (
                <a
                  href="/admin"
                  className="text-xs bg-axe-accent/10 text-axe-accent border border-axe-accent/20 px-3 py-1 rounded-full font-medium hover:bg-axe-accent/20 transition-colors"
                >
                  Panneau admin →
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors whitespace-nowrap
                  ${activeTab === t.key
                    ? "bg-axe-charcoal text-axe-white border-t border-x border-white/10"
                    : "text-axe-muted hover:text-axe-white"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* ══ ACCUEIL ══ */}
        {activeTab === "accueil" && (
          <div className="space-y-6">

            {/* Statut */}
            {pro?.status === "pending" && (
              <div className="bg-axe-amber/5 border border-axe-amber/20 rounded-2xl p-5">
                <p className="text-axe-amber text-sm font-semibold mb-1">Profil en cours de validation</p>
                <p className="text-axe-muted text-sm">L&apos;équipe GetAxe examine votre dossier et vous contactera sous 48h.</p>
              </div>
            )}
            {pro?.status === "approved" && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                <p className="text-green-400 text-sm font-semibold mb-1">Profil approuvé</p>
                <p className="text-axe-muted text-sm">Vous faites partie du réseau GetAxe. Votre profil est visible dans l&apos;annuaire.</p>
              </div>
            )}
            {pro?.status === "rejected" && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <p className="text-red-400 text-sm font-semibold mb-1">Profil non validé</p>
                <p className="text-axe-muted text-sm">Contactez-nous à contact@getaxe.fr pour plus d&apos;informations.</p>
              </div>
            )}

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-axe-accent">{bookings.length}</p>
                <p className="text-xs text-axe-muted mt-1">Réservations</p>
              </div>
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-axe-amber">{pendingBookings.length}</p>
                <p className="text-xs text-axe-muted mt-1">En attente</p>
              </div>
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{totalEarned} €</p>
                <p className="text-xs text-axe-muted mt-1">Encaissé</p>
              </div>
            </div>

            {/* Calendrier de disponibilités */}
            <AvailabilityCalendar
              availabilityPeriods={availPeriods}
              bookings={bookings}
            />

            {/* Fiche profil résumée */}
            {pro && (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Mon profil</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-axe-muted text-xs mb-1">Ville</p>
                    <p className="text-axe-white">{pro.city || "—"}</p>
                  </div>
                  <div>
                    <p className="text-axe-muted text-xs mb-1">Expérience</p>
                    <p className="text-axe-white">{pro.experienceYears} ans</p>
                  </div>
                  <div>
                    <p className="text-axe-muted text-xs mb-1">RC Pro</p>
                    <p className={pro.hasInsurance ? "text-green-400 font-semibold" : "text-red-400"}>
                      {pro.hasInsurance ? `Oui — ${pro.insuranceCompany ?? ""}` : "Non déclarée"}
                    </p>
                  </div>
                  <div>
                    <p className="text-axe-muted text-xs mb-1">Niveau</p>
                    <StatusBadge status={pro.trustLevel} />
                  </div>
                </div>
                {pro.specialties.length > 0 && (
                  <div>
                    <p className="text-axe-muted text-xs mb-2">Spécialités</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pro.specialties.map((s) => (
                        <span key={s} className="text-xs bg-axe-black/60 text-axe-muted border border-white/5 px-2 py-0.5 rounded-md">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raccourcis */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab("reservations")}
                className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 text-left hover:border-axe-accent/20 transition-colors"
              >
                <p className="text-axe-accent text-lg font-bold mb-1">{pendingBookings.length}</p>
                <p className="text-axe-white text-sm font-medium">Réservations en attente</p>
                <p className="text-axe-muted text-xs mt-1">Voir →</p>
              </button>
              <button
                onClick={() => setActiveTab("tarifs")}
                className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 text-left hover:border-axe-accent/20 transition-colors"
              >
                <p className="text-axe-accent text-lg font-bold mb-1">{services.length}</p>
                <p className="text-axe-white text-sm font-medium">Prestations configurées</p>
                <p className="text-axe-muted text-xs mt-1">Gérer →</p>
              </button>
            </div>
          </div>
        )}

        {/* ══ RÉSERVATIONS ══ */}
        {activeTab === "reservations" && (
          <div className="space-y-4">
            <p className="text-axe-muted text-sm">{bookings.length} réservation{bookings.length !== 1 ? "s" : ""} au total</p>

            {bookings.length === 0 ? (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-10 text-center">
                <p className="text-axe-muted text-sm">Aucune réservation pour l&apos;instant.</p>
                <p className="text-axe-muted text-xs mt-2">Complétez votre profil pour apparaître dans l&apos;annuaire.</p>
              </div>
            ) : (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {bookings.map((b) => {
                  const cancellable = b.status === "paid" || b.status === "session_confirmed";
                  const isConfirming = cancellingId === b.id;
                  const result = b.id ? cancelResults[b.id] : undefined;
                  const compPct = policy.proCompensationPercent ?? 0;

                  return (
                    <div key={b.id}>
                      <div className="px-5 py-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-axe-white text-sm font-semibold truncate">{b.clientName}</p>
                            <p className="text-axe-muted text-xs mt-0.5">{formatSessionDate(b.sessionDate)}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-axe-accent font-bold text-sm">{b.amountEuros} €</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                              {BOOKING_STATUS_LABELS[b.status]}
                            </span>
                          </div>
                        </div>
                        {cancellable && !result && (
                          <button
                            onClick={() => setCancellingId(isConfirming ? null : b.id!)}
                            className="text-xs text-axe-muted hover:text-red-400 transition-colors"
                          >
                            {isConfirming ? "Fermer ↑" : "Annuler cette séance"}
                          </button>
                        )}
                      </div>

                      {isConfirming && !result && (
                        <div className="px-5 pb-4 space-y-3 bg-red-500/5 border-t border-red-500/10">
                          <p className="text-axe-white text-sm font-semibold pt-3">Confirmer l&apos;annulation ?</p>
                          <p className="text-axe-muted text-xs leading-relaxed">
                            Le client sera remboursé <strong className="text-axe-white">intégralement ({b.amountEuros} €)</strong>.
                            {compPct > 0 && (
                              <> Un code promo de <strong className="text-axe-accent">{compPct}%</strong> sera généré automatiquement.</>
                            )}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleCancelBooking(b.id!)}
                              disabled={cancellingId !== null && !isConfirming}
                              className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Confirmer l&apos;annulation
                            </button>
                            <button
                              onClick={() => setCancellingId(null)}
                              className="px-4 py-2 rounded-xl bg-white/5 text-axe-muted text-xs hover:bg-white/10 transition-colors"
                            >
                              Retour
                            </button>
                          </div>
                        </div>
                      )}

                      {result && (
                        <div className="px-5 pb-4 pt-3 bg-green-500/5 border-t border-green-500/10 space-y-1">
                          <p className="text-green-400 text-xs font-semibold">
                            Annulation effectuée — {result.refundEuros} € remboursés au client.
                          </p>
                          {result.promoCode && (
                            <p className="text-axe-muted text-xs">
                              Code promo&nbsp;:&nbsp;
                              <span className="font-mono font-bold text-axe-accent bg-axe-black/50 px-2 py-0.5 rounded">
                                {result.promoCode}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ TARIFS & DISPO ══ */}
        {activeTab === "tarifs" && (
          <div className="space-y-8">

            {/* Tarifs */}
            <div>
              <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mes prestations</h2>
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-5">
                {services.length > 0 && (
                  <div className="space-y-2">
                    {services.map((s, i) => (
                      <div key={i} className="bg-axe-black/40 rounded-xl px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-axe-white text-sm font-semibold">{s.name}</p>
                            <p className="text-axe-muted text-xs">{s.durationMinutes} min</p>
                            {s.description && <p className="text-axe-muted text-xs mt-1 leading-relaxed">{s.description}</p>}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-axe-accent font-bold text-sm whitespace-nowrap">{s.priceEuros} €</span>
                            <button onClick={() => removeService(i)} className="text-axe-muted hover:text-red-400 text-xs transition-colors">Supprimer</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 border-t border-white/5 pt-4">
                  <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Ajouter une prestation</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" className="input sm:col-span-1" placeholder="Nom (ex : Bilan initial)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <select className="input" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))}>
                      {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                    </select>
                    <input type="number" className="input" placeholder="Prix (€)" min={10} max={1000} value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} />
                  </div>
                  <textarea rows={2} className="input w-full text-sm resize-none" placeholder="Description (optionnelle)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <div className="flex gap-3">
                    <button onClick={addService} disabled={!newName.trim() || newPrice <= 0} className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                      Ajouter
                    </button>
                    <button onClick={saveServices} disabled={savingServices || services.length === 0} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                      {savingServices ? "Sauvegarde…" : "Sauvegarder"}
                    </button>
                    {servicesSaved && <span className="text-green-400 text-xs self-center">Sauvegardé ✓</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Disponibilités */}
            <div>
              <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mes disponibilités</h2>
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
                <p className="text-axe-muted text-sm">Définissez vos périodes avec les mois, semaines et jours concernés.</p>

                {availPeriods.length > 0 && (
                  <div className="space-y-3">
                    {availPeriods.map((p) => (
                      <div key={p.id} className="bg-axe-black/40 border border-white/5 rounded-xl px-4 py-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            {p.label && <p className="text-axe-white text-sm font-semibold">{p.label}</p>}
                            <p className="text-axe-accent text-xs font-medium">
                              {p.startDate.split("-").reverse().join("/")} → {p.endDate.split("-").reverse().join("/")}
                            </p>
                            <p className="text-axe-muted text-xs">{p.startTime} – {p.endTime} · {p.location}</p>
                          </div>
                          <button type="button" onClick={() => removePeriod(p.id)} className="shrink-0 text-axe-muted hover:text-red-400 text-xs transition-colors">
                            Supprimer
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {DAYS.map(({ key }) => (
                            <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${p.days.includes(key) ? "bg-axe-accent/15 text-axe-accent" : "bg-white/5 text-axe-muted/40"}`}>
                              {DAY_SHORT[key]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAddPeriod ? (
                  <div className="border border-axe-accent/20 rounded-xl p-4 space-y-4 bg-axe-accent/5">
                    <p className="text-axe-white text-sm font-semibold">Nouvelle période</p>
                    <input type="text" placeholder="Étiquette (optionnel) — ex : Printemps 2026" value={newPLabel} onChange={(e) => setNewPLabel(e.target.value)} className="input w-full text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-axe-muted">Début</label>
                        <input type="date" value={newPStart} onChange={(e) => setNewPStart(e.target.value)} className="input w-full text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-axe-muted">Fin</label>
                        <input type="date" value={newPEnd} onChange={(e) => setNewPEnd(e.target.value)} className="input w-full text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-axe-muted">Jours</p>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(({ key }) => {
                          const selected = newPDays.includes(key);
                          return (
                            <button key={key} type="button"
                              onClick={() => setNewPDays((prev) => selected ? prev.filter((d) => d !== key) : [...prev, key])}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected ? "bg-axe-accent text-axe-black border-axe-accent font-semibold" : "bg-transparent text-axe-muted border-white/10 hover:border-axe-accent/40"}`}
                            >
                              {DAY_SHORT[key]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-axe-muted">Heure de début</label>
                        <input type="time" value={newPStartTime} onChange={(e) => setNewPStartTime(e.target.value)} className="input w-full text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-axe-muted">Heure de fin</label>
                        <input type="time" value={newPEndTime} onChange={(e) => setNewPEndTime(e.target.value)} className="input w-full text-sm" />
                      </div>
                    </div>
                    <input type="text" placeholder="Lieu — Cabinet Paris 11e, À domicile, En ligne…" value={newPLocation} onChange={(e) => setNewPLocation(e.target.value)} className="input w-full text-sm" />
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={addPeriod} disabled={!newPStart || !newPEnd || newPDays.length === 0 || !newPLocation.trim()} className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        Ajouter
                      </button>
                      <button type="button" onClick={() => setShowAddPeriod(false)} className="text-xs text-axe-muted hover:text-axe-white px-3 py-2">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowAddPeriod(true)} className="w-full border border-dashed border-white/10 rounded-xl py-3 text-axe-muted text-sm hover:border-axe-accent/30 hover:text-axe-accent transition-colors">
                    + Ajouter une période
                  </button>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={saveAvailability} disabled={savingAvail} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                    {savingAvail ? "Sauvegarde…" : "Sauvegarder les disponibilités"}
                  </button>
                  {availSaved && <span className="text-green-400 text-xs">Sauvegardé ✓</span>}
                </div>
              </div>
            </div>

            {/* Politique d'annulation */}
            <div>
              <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Politique d&apos;annulation</h2>
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-5">
                <p className="text-axe-muted text-sm">Pourcentage remboursé au client selon le délai avant la séance.</p>

                <div className="space-y-3">
                  {CANCEL_TIERS.map(({ hours, label }) => (
                    <div key={hours} className="flex items-center gap-4 bg-axe-black/40 rounded-xl px-4 py-3">
                      <span className="flex-1 text-axe-white text-sm">{label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min={0} max={100} step={5} value={getRulePercent(hours)} onChange={(e) => updateRulePercent(hours, Math.min(100, Math.max(0, Number(e.target.value))))} className="input w-20 text-center text-sm font-bold" />
                        <span className="text-axe-muted text-sm">%</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 bg-axe-black/20 rounded-xl px-4 py-3 opacity-60">
                    <span className="flex-1 text-axe-muted text-sm">Moins d&apos;1h avant</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-20 text-center text-sm font-bold text-axe-muted">0</span>
                      <span className="text-axe-muted text-sm">%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-axe-black/40 rounded-xl px-4 py-4 space-y-2 border border-orange-500/20">
                  <p className="text-axe-white text-sm font-semibold">Si c&apos;est moi qui annule</p>
                  <p className="text-axe-muted text-xs leading-relaxed">Le client est remboursé à 100%. Vous pouvez lui offrir un code promo.</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-axe-muted text-xs shrink-0">Code promo de</span>
                    <input type="number" min={0} max={50} step={5} value={policy.proCompensationPercent ?? 0} onChange={(e) => { setPolicy((p) => ({ ...p, proCompensationPercent: Math.min(50, Math.max(0, Number(e.target.value))) })); setPolicySaved(false); }} className="input w-20 text-center text-sm font-bold" />
                    <span className="text-axe-muted text-xs">% sur la prochaine séance</span>
                  </div>
                </div>

                <div onClick={() => { setPolicy((p) => ({ ...p, proCanWaiveFees: !p.proCanWaiveFees })); setPolicySaved(false); }} className="flex items-start gap-3 bg-axe-black/40 rounded-xl px-4 py-4 cursor-pointer hover:bg-axe-black/60 transition-colors">
                  <div className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${policy.proCanWaiveFees ? "bg-axe-accent border-axe-accent" : "border-white/20"}`}>
                    {policy.proCanWaiveFees && <span className="text-axe-black text-xs font-bold">✓</span>}
                  </div>
                  <div>
                    <p className="text-axe-white text-sm font-semibold">Je peux exonérer un client à ma discrétion</p>
                    <p className="text-axe-muted text-xs mt-0.5">Vous pouvez toujours rembourser intégralement un client depuis le tableau de bord.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={savePolicy} disabled={savingPolicy} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                    {savingPolicy ? "Sauvegarde…" : "Sauvegarder"}
                  </button>
                  {policySaved && <span className="text-green-400 text-xs">Sauvegardé ✓</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PROTECTION ══ */}
        {activeTab === "protection" && pro && (
          <ProtectionDashboard pro={pro} onDeclareInsurance={handleDeclareInsurance} />
        )}

        {/* ══ PAIEMENTS ══ */}
        {activeTab === "paiements" && pro && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider">Mes paiements</h2>

            {stripeActive ? (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">Compte actif</span>
                <p className="text-axe-muted text-sm leading-relaxed">
                  Votre compte Stripe est connecté. Vous recevez <span className="text-axe-white font-semibold">92%</span> de chaque séance directement sur votre compte bancaire.
                </p>
                <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-axe-muted text-xs mb-1">Total encaissé</p>
                    <p className="text-green-400 font-bold text-lg">{totalEarned} €</p>
                  </div>
                  <div>
                    <p className="text-axe-muted text-xs mb-1">Séances versées</p>
                    <p className="text-axe-white font-bold text-lg">{bookings.filter((b) => b.status === "released").length}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
                <p className="text-axe-white font-semibold">Configurez vos paiements</p>
                <p className="text-axe-muted text-sm leading-relaxed">
                  Pour recevoir des paiements via GetAxe, connectez votre compte bancaire. Stripe gère la sécurité et les virements.
                </p>
                <div className="bg-axe-black/40 rounded-xl p-4 flex items-center justify-between">
                  <p className="text-axe-muted text-sm">Commission GetAxe</p>
                  <p className="text-axe-white font-bold">8%</p>
                </div>
                <div className="bg-axe-black/40 rounded-xl p-4 flex items-center justify-between">
                  <p className="text-axe-muted text-sm">Votre part</p>
                  <p className="text-axe-accent font-bold">92%</p>
                </div>
                {onboardError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{onboardError}</p>
                  </div>
                )}
                <button onClick={handleStripeOnboard} disabled={onboarding} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  {onboarding ? "Redirection…" : "Connecter mon compte bancaire →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ FACTURATION ══ */}
        {activeTab === "facturation" && pro && (
          <DashboardFacturation pro={pro} />
        )}

        {/* ══ MESSAGES ══ */}
        {activeTab === "messages" && pro && user && (
          <MessagingPanel userEmail={user.email!} role="pro" userName={`${pro.firstName} ${pro.lastName}`} />
        )}

        {/* ══ ANALYTIQUES ══ */}
        {activeTab === "analytics" && (
          <DashboardAnalytics
            bookings={bookings}
            averageRating={pro?.averageRating}
            reviewCount={pro?.reviewCount}
          />
        )}

        {/* ── RGPD : suppression du compte ── */}
        <div className="mt-16 pt-8 border-t border-white/5">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
            >
              Supprimer mon compte (RGPD)
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
              <p className="text-red-400 font-semibold text-sm">Supprimer définitivement mon compte</p>
              <p className="text-axe-muted text-xs leading-relaxed">
                Cette action est irréversible. Votre profil professionnel et votre compte seront supprimés.
                Vos données seront effacées sous 30 jours conformément au RGPD.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-axe-charcoal border border-white/10 text-axe-muted text-sm py-2.5 rounded-xl hover:text-axe-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 text-sm py-2.5 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {deletingAccount ? "Suppression…" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
