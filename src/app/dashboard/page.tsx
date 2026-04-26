"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getProfessionalByEmail,
  getBookingsByPro,
  updateProfessionalServices,
  updateProfessionalAvailability,
  updateProfessionalInsurance,
  updateCancellationPolicy,
} from "@/lib/firestore";
import {
  Professional, Booking, BookingStatus,
  ServiceItem, DayOfWeek, CancellationPolicy, CancellationRule,
  AvailabilityPeriod,
} from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import RequestCard from "@/components/RequestCard";
import ProtectionDashboard from "@/components/ProtectionDashboard";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

// ─── Booking status ──────────────────────────────────────────────────────────

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

// ─── Planning ────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSessionDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pro, setPro] = useState<Professional | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);

      try {
        const proProfile = await getProfessionalByEmail(u.email!);

        if (!proProfile) {
          router.push("/dashboard/client");
          return;
        }

        setPro(proProfile);

        if (proProfile) {
          setServices(proProfile.services ?? []);
          setAvailPeriods(proProfile.availabilityPeriods ?? []);
          setPolicy(proProfile.cancellationPolicy ?? DEFAULT_POLICY);
        }

        if (proProfile?.id) {
          try {
            const proBookings = await getBookingsByPro(proProfile.id);
            setBookings(proBookings);
          } catch {
            // Index en cours de construction — on affiche une liste vide
            setBookings([]);
          }
        }
      } catch {
        // Erreur Firestore non critique — on laisse le dashboard s'afficher
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  // ── Stripe ──────────────────────────────────────────────────────────────────

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

  // ── Tarifs ──────────────────────────────────────────────────────────────────

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

  // ── Disponibilités par période ───────────────────────────────────────────────

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

  // ── RC Pro ───────────────────────────────────────────────────────────────────

  async function handleDeclareInsurance(company: string) {
    if (!pro?.id) return;
    await updateProfessionalInsurance(pro.id, true, company);
    setPro((prev) => prev ? { ...prev, hasInsurance: true, insuranceCompany: company } : prev);
  }

  // ── Politique d'annulation ───────────────────────────────────────────────────

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

  // ── Annulation réservation (par le praticien) ────────────────────────────────

  async function handleCancelBooking(bookingId: string, proWaivedFees = false) {
    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, cancelledBy: "pro", proWaivedFees }),
      });
      const data = (await res.json()) as { refundAmountEuros?: number; promoCode?: string; error?: string };
      if (!res.ok) { alert(data.error ?? "Erreur lors de l'annulation."); return; }
      setCancelResults((prev) => ({
        ...prev,
        [bookingId]: { refundEuros: data.refundAmountEuros ?? 0, promoCode: data.promoCode },
      }));
      // Met à jour localement le statut de la réservation
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    } finally {
      setCancellingId(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted">Chargement…</p>
      </div>
    );
  }

  const stripeActive = pro?.stripeAccountId && pro?.stripeAccountStatus === "active";

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-axe-white mb-1">Mon espace</h1>
          <p className="text-axe-muted text-sm">{user?.email}</p>
        </div>

        {/* ── Profil ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mon profil professionnel</h2>
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-axe-white text-lg">{pro.firstName} {pro.lastName}</p>
                  <p className="text-axe-accent text-sm">{PROFESSION_LABELS[pro.profession] ?? pro.profession}</p>
                  <p className="text-axe-muted text-xs mt-1">{pro.city} · {pro.experienceYears} ans d&apos;expérience</p>
                </div>
                <StatusBadge status={pro.status} />
              </div>
              {pro.status === "pending" && <div className="bg-axe-amber/5 border border-axe-amber/20 rounded-xl p-4"><p className="text-axe-amber text-sm">Votre profil est en cours de validation. L&apos;équipe AXE reviendra vers vous sous 48h.</p></div>}
              {pro.status === "approved" && <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4"><p className="text-green-400 text-sm">Votre profil est approuvé. Vous faites partie du réseau AXE.</p></div>}
              {pro.status === "rejected" && <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"><p className="text-red-400 text-sm">Votre profil n&apos;a pas été validé. Contactez-nous à contact@axe.fr pour plus d&apos;informations.</p></div>}
              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3 text-xs text-axe-muted">
                <span>RC Pro : <strong className={pro.hasInsurance ? "text-green-400" : "text-red-400"}>{pro.hasInsurance ? "Oui" : "Non"}</strong></span>
                <span>Niveau : <StatusBadge status={pro.trustLevel} /></span>
                <span className="col-span-2">Spécialités : {pro.specialties.join(", ") || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tarifs ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mes tarifs</h2>
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-5">
              {services.length > 0 && (
                <div className="space-y-2">
                  {services.map((s, i) => (
                    <div key={i} className="bg-axe-black/40 rounded-xl px-4 py-3 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-axe-white text-sm font-semibold">{s.name}</p>
                          <p className="text-axe-muted text-xs">{s.durationMinutes} min</p>
                          {s.description && <p className="text-axe-muted text-xs mt-1 leading-relaxed">{s.description}</p>}
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-axe-accent font-bold text-sm whitespace-nowrap">{s.priceEuros}&nbsp;€&nbsp;<span className="text-axe-muted font-normal text-xs">/ séance</span></span>
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
                  <input type="number" className="input" placeholder="Prix / séance (€)" min={10} max={1000} value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} />
                </div>
                <textarea
                  rows={2}
                  className="input w-full text-sm resize-none"
                  placeholder="Description (optionnelle) — thématique, niveau requis, détails du tarif…"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <button
                  onClick={addService}
                  disabled={!newName.trim() || newPrice <= 0}
                  className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Ajouter la prestation
                </button>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button onClick={saveServices} disabled={savingServices || services.length === 0} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  {savingServices ? "Sauvegarde…" : "Sauvegarder les tarifs"}
                </button>
                {servicesSaved && <span className="text-green-400 text-xs">Tarifs sauvegardés ✓</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Disponibilités ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mes disponibilit&#233;s</h2>
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
              <p className="text-axe-muted text-sm">D&#233;finissez vos p&#233;riodes de disponibilit&#233; avec les mois, semaines et jours concern&#233;s. Chaque p&#233;riode a ses propres horaires et lieu.</p>

              {/* Liste des périodes */}
              {availPeriods.length > 0 && (
                <div className="space-y-3">
                  {availPeriods.map((p) => (
                    <div key={p.id} className="bg-axe-black/40 border border-white/5 rounded-xl px-4 py-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          {p.label && <p className="text-axe-white text-sm font-semibold">{p.label}</p>}
                          <p className="text-axe-accent text-xs font-medium">
                            {p.startDate.split("-").reverse().join("/")} &#8594; {p.endDate.split("-").reverse().join("/")}
                          </p>
                          <p className="text-axe-muted text-xs">{p.startTime} &#8211; {p.endTime} &middot; {p.location}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePeriod(p.id)}
                          className="shrink-0 text-axe-muted hover:text-red-400 text-xs transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {DAYS.map(({ key }) => (
                          <span
                            key={key}
                            className={`text-xs px-2 py-0.5 rounded-full ${p.days.includes(key) ? "bg-axe-accent/15 text-axe-accent" : "bg-white/5 text-axe-muted/40"}`}
                          >
                            {DAY_SHORT[key]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire d'ajout */}
              {showAddPeriod ? (
                <div className="border border-axe-accent/20 rounded-xl p-4 space-y-4 bg-axe-accent/5">
                  <p className="text-axe-white text-sm font-semibold">Nouvelle p&#233;riode</p>

                  <input
                    type="text"
                    placeholder="&#201;tiquette (optionnel) — ex&#160;: Printemps 2026"
                    value={newPLabel}
                    onChange={(e) => setNewPLabel(e.target.value)}
                    className="input w-full text-sm"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-axe-muted">Date de d&#233;but</label>
                      <input type="date" value={newPStart} onChange={(e) => setNewPStart(e.target.value)} className="input w-full text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-axe-muted">Date de fin</label>
                      <input type="date" value={newPEnd} onChange={(e) => setNewPEnd(e.target.value)} className="input w-full text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-axe-muted">Jours concern&#233;s</p>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(({ key }) => {
                        const selected = newPDays.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
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
                      <label className="text-xs text-axe-muted">Heure de d&#233;but</label>
                      <input type="time" value={newPStartTime} onChange={(e) => setNewPStartTime(e.target.value)} className="input w-full text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-axe-muted">Heure de fin</label>
                      <input type="time" value={newPEndTime} onChange={(e) => setNewPEndTime(e.target.value)} className="input w-full text-sm" />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Lieu — Cabinet Paris 11e, &#192; domicile, En ligne&#8230;"
                    value={newPLocation}
                    onChange={(e) => setNewPLocation(e.target.value)}
                    className="input w-full text-sm"
                  />

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={addPeriod}
                      disabled={!newPStart || !newPEnd || newPDays.length === 0 || !newPLocation.trim()}
                      className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPeriod(false)}
                      className="text-xs text-axe-muted hover:text-axe-white px-3 py-2"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddPeriod(true)}
                  className="w-full border border-dashed border-white/10 rounded-xl py-3 text-axe-muted text-sm hover:border-axe-accent/30 hover:text-axe-accent transition-colors"
                >
                  + Ajouter une p&#233;riode
                </button>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={saveAvailability} disabled={savingAvail} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  {savingAvail ? "Sauvegarde…" : "Sauvegarder les disponibilités"}
                </button>
                {availSaved && <span className="text-green-400 text-xs">Disponibilit&#233;s sauvegard&#233;es &#10003;</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Politique d'annulation ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Politique d&apos;annulation</h2>
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-5">
              <p className="text-axe-muted text-sm">Définissez le pourcentage remboursé au client selon le délai d&apos;annulation avant la séance.</p>

              <div className="space-y-3">
                {CANCEL_TIERS.map(({ hours, label }) => (
                  <div key={hours} className="flex items-center gap-4 bg-axe-black/40 rounded-xl px-4 py-3">
                    <span className="flex-1 text-axe-white text-sm">{label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={getRulePercent(hours)}
                        onChange={(e) => updateRulePercent(hours, Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="input w-20 text-center text-sm font-bold"
                      />
                      <span className="text-axe-muted text-sm">% remboursé</span>
                    </div>
                  </div>
                ))}

                {/* Moins d'1h : toujours 0, non modifiable */}
                <div className="flex items-center gap-4 bg-axe-black/20 rounded-xl px-4 py-3 opacity-60">
                  <span className="flex-1 text-axe-muted text-sm">Moins d&apos;1h avant</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-20 text-center text-sm font-bold text-axe-muted">0</span>
                    <span className="text-axe-muted text-sm">% remboursé</span>
                  </div>
                </div>
              </div>

              {/* Si c'est moi qui annule */}
              <div className="bg-axe-black/40 rounded-xl px-4 py-4 space-y-2 border border-orange-500/20">
                <p className="text-axe-white text-sm font-semibold">Si c&apos;est moi qui annule</p>
                <p className="text-axe-muted text-xs leading-relaxed">Le client est toujours remboursé à 100%. Vous pouvez lui offrir un code promo pour compenser.</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-axe-muted text-xs shrink-0">Offrir</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={5}
                    value={policy.proCompensationPercent ?? 0}
                    onChange={(e) => {
                      setPolicy((p) => ({ ...p, proCompensationPercent: Math.min(50, Math.max(0, Number(e.target.value))) }));
                      setPolicySaved(false);
                    }}
                    className="input w-20 text-center text-sm font-bold"
                  />
                  <span className="text-axe-muted text-xs">% de réduction sur la prochaine séance</span>
                </div>
                {(policy.proCompensationPercent ?? 0) === 0 && (
                  <p className="text-axe-muted text-xs italic">0% = remboursement seul, sans code promo.</p>
                )}
              </div>

              {/* Override praticien côté client */}
              <div
                onClick={() => { setPolicy((p) => ({ ...p, proCanWaiveFees: !p.proCanWaiveFees })); setPolicySaved(false); }}
                className="flex items-start gap-3 bg-axe-black/40 rounded-xl px-4 py-4 cursor-pointer hover:bg-axe-black/60 transition-colors"
              >
                <div className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${policy.proCanWaiveFees ? "bg-axe-accent border-axe-accent" : "border-white/20"}`}>
                  {policy.proCanWaiveFees && <span className="text-axe-black text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="text-axe-white text-sm font-semibold">Je peux exonérer mon client à ma discrétion</p>
                  <p className="text-axe-muted text-xs mt-0.5">Même si les règles ci-dessus s&apos;appliquent, vous pouvez toujours décider de rembourser intégralement un client depuis votre tableau de bord.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={savePolicy} disabled={savingPolicy} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  {savingPolicy ? "Sauvegarde…" : "Sauvegarder la politique"}
                </button>
                {policySaved && <span className="text-green-400 text-xs">Politique sauvegardée ✓</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Protection ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Ma protection</h2>
            <ProtectionDashboard pro={pro} onDeclareInsurance={handleDeclareInsurance} />
          </div>
        )}

        {/* ── Paiements ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mes paiements</h2>
            {stripeActive ? (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">Paiements actifs</span>
                <p className="text-axe-muted text-sm leading-relaxed">Votre compte Stripe est connecté. Vous recevez <span className="text-axe-white font-semibold">85%</span> de chaque séance directement sur votre compte bancaire.</p>
              </div>
            ) : (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-axe-white font-semibold mb-1">Configurez vos paiements</p>
                  <p className="text-axe-muted text-sm leading-relaxed">Pour recevoir des paiements via AXE, connectez votre compte bancaire. Stripe gère la sécurité et les virements. AXE prend 15% de commission, vous recevez 85%.</p>
                </div>
                {onboardError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">{onboardError}</p></div>}
                <button onClick={handleStripeOnboard} disabled={onboarding} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {onboarding ? "Redirection…" : "Connecter mon compte bancaire →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Réservations ── */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Mes réservations</h2>
            {bookings.length === 0 ? (
              <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-8 text-center">
                <p className="text-axe-muted text-sm">Aucune réservation pour l&apos;instant.</p>
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
                      {/* Ligne principale */}
                      <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-5 py-4 items-center">
                        <span className="text-axe-white text-sm">{formatSessionDate(b.sessionDate)}</span>
                        <span className="text-axe-white text-sm truncate">{b.clientName}</span>
                        <span className="text-axe-white text-sm font-semibold">{b.amountEuros}&nbsp;€</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                          {BOOKING_STATUS_LABELS[b.status]}
                        </span>
                        {cancellable && !result && (
                          <button
                            onClick={() => setCancellingId(isConfirming ? null : b.id!)}
                            className="text-xs text-axe-muted hover:text-red-400 transition-colors"
                          >
                            {isConfirming ? "Fermer" : "Annuler"}
                          </button>
                        )}
                        {!cancellable && <span />}
                      </div>

                      {/* Panneau de confirmation d'annulation */}
                      {isConfirming && !result && (
                        <div className="px-5 pb-4 space-y-3 bg-red-500/5 border-t border-red-500/10">
                          <p className="text-axe-white text-sm font-semibold pt-3">
                            Confirmer l&apos;annulation de cette séance ?
                          </p>
                          <p className="text-axe-muted text-xs leading-relaxed">
                            Le client sera remboursé <strong className="text-axe-white">intégralement ({b.amountEuros} €)</strong>.
                            {compPct > 0 && (
                              <> Un code promo de <strong className="text-axe-accent">{compPct}%</strong> sur sa prochaine séance sera généré automatiquement.</>
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
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Résultat après annulation */}
                      {result && (
                        <div className="px-5 pb-4 pt-3 bg-green-500/5 border-t border-green-500/10 space-y-1">
                          <p className="text-green-400 text-xs font-semibold">
                            Annulation effectuée — {result.refundEuros} € remboursés au client.
                          </p>
                          {result.promoCode && (
                            <p className="text-axe-muted text-xs">
                              Code promo généré&nbsp;:&nbsp;
                              <span className="font-mono font-bold text-axe-accent bg-axe-black/50 px-2 py-0.5 rounded">
                                {result.promoCode}
                              </span>
                              &nbsp;— transmettez-le à votre client.
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

      </div>
    </div>
  );
}
