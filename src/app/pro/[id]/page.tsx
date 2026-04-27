"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getProfessionalById, getOrCreateConversation } from "@/lib/firestore";
import { Professional, Profession, DayOfWeek } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import ReviewsSection from "@/components/ReviewsSection";

interface ProPageProps {
  params: Promise<{ id: string }>;
}

const PROFESSION_COLORS: Record<Profession, string> = {
  coach: "bg-green-500/10 text-green-400",
  physical_trainer: "bg-orange-500/10 text-orange-400",
  mental_coach: "bg-violet-500/10 text-violet-400",
  kine: "bg-blue-500/10 text-blue-400",
  osteo: "bg-purple-500/10 text-purple-400",
  sports_doctor: "bg-red-500/10 text-red-400",
  recovery: "bg-teal-500/10 text-teal-400",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  home: "À domicile",
  online: "En ligne",
  studio: "Studio",
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mer",
  thursday: "Jeu",
  friday: "Ven",
  saturday: "Sam",
  sunday: "Dim",
};

const DAY_ORDER: DayOfWeek[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export default function ProPublicPage({ params: paramsPromise }: ProPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    async function fetchPro() {
      try {
        const data = await getProfessionalById(params.id);
        if (!data || data.status !== "approved") {
          setNotFound(true);
        } else {
          setPro(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPro();
  }, [params.id]);

  async function handleContactPro() {
    if (!auth) return;
    if (!user) {
      router.push(`/login?redirect=/pro/${params.id}`);
      return;
    }
    if (!pro?.id) return;
    const proName = `${pro.firstName} ${pro.lastName}`;
    await getOrCreateConversation(
      pro.id,
      pro.email,
      proName,
      user.email!,
      user.displayName ?? user.email!
    );
    router.push("/dashboard/client?tab=messages");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted text-sm">Chargement du profil…</p>
      </div>
    );
  }

  if (notFound || !pro) {
    return (
      <div className="min-h-screen bg-axe-black flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-axe-white text-xl font-semibold">Professionnel non disponible</p>
        <p className="text-axe-muted text-sm text-center max-w-sm">
          Ce profil n&apos;existe pas ou n&apos;est pas encore accessible.
        </p>
        <Link
          href="/annuaire"
          className="text-axe-accent hover:underline text-sm"
        >
          ← Retour à l&apos;annuaire
        </Link>
      </div>
    );
  }

  const isTrusted =
    pro.trustLevel === "verified" ||
    pro.trustLevel === "certified" ||
    pro.trustLevel === "elite";

  const professionColor =
    PROFESSION_COLORS[pro.profession] ?? "bg-white/5 text-axe-white";

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Lien retour */}
        <Link
          href="/annuaire"
          className="inline-flex items-center gap-1 text-axe-muted hover:text-axe-white text-sm transition-colors"
        >
          ← Retour à l&apos;annuaire
        </Link>

        {/* Header */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-axe-white">
                {pro.firstName} {pro.lastName}
              </h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${professionColor}`}
              >
                {PROFESSION_LABELS[pro.profession] ?? pro.profession}
              </span>
              <p className="text-axe-muted text-sm pt-1">
                {pro.city} · {pro.experienceYears} ans d&apos;expérience
              </p>
            </div>

            {/* Badges trust + RC Pro */}
            <div className="flex flex-col gap-2 items-end">
              {isTrusted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
                  Profil vérifié ✓
                </span>
              )}
              {pro.hasInsurance ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
                  Assuré RC Pro ✓
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                  Non assuré ✗
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {pro.bio && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-2">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
              À propos
            </h2>
            <p className="text-axe-white text-sm leading-relaxed whitespace-pre-line">
              {pro.bio}
            </p>
          </div>
        )}

        {/* Liens sociaux */}
        {(pro.website || pro.instagram || pro.linkedin) && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Liens</h2>
            <div className="flex flex-wrap gap-3">
              {pro.website && (
                <a href={pro.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-axe-dark rounded-xl text-axe-muted hover:text-axe-white text-sm transition-colors border border-white/5">
                  🌐 Site web
                </a>
              )}
              {pro.instagram && (
                <a href={`https://instagram.com/${pro.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-axe-dark rounded-xl text-axe-muted hover:text-axe-white text-sm transition-colors border border-white/5">
                  📸 Instagram
                </a>
              )}
              {pro.linkedin && (
                <a href={pro.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-axe-dark rounded-xl text-axe-muted hover:text-axe-white text-sm transition-colors border border-white/5">
                  💼 LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        {/* Spécialités */}
        {pro.specialties.length > 0 && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
              Spécialités
            </h2>
            <div className="flex flex-wrap gap-2">
              {pro.specialties.map((s, i) => (
                <span
                  key={i}
                  className="bg-axe-accent/10 text-axe-accent rounded-full px-3 py-1 text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tarifs */}
        {pro.services && pro.services.length > 0 && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
              Tarifs
            </h2>
            <div className="space-y-2">
              {pro.services.map((s, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-axe-white text-sm font-semibold">{s.name}</p>
                    <p className="text-axe-muted text-xs">{s.durationMinutes} min</p>
                    {s.description && <p className="text-axe-muted text-xs mt-1 leading-relaxed">{s.description}</p>}
                  </div>
                  <span className="text-axe-accent font-bold text-sm whitespace-nowrap shrink-0">{s.priceEuros}&nbsp;€<span className="text-axe-muted font-normal text-xs">&nbsp;/ séance</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planning */}
        {pro.schedule && pro.schedule.length > 0 && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
              Planning
            </h2>
            <div className="space-y-2">
              {DAY_ORDER.map((day) => {
                const slot = pro.schedule!.find((s) => s.day === day);
                if (!slot) return null;
                const range = slot.timeRanges?.[0];
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-axe-accent text-xs font-semibold">
                      {DAY_LABELS[day]}
                    </span>
                    <span className="text-axe-white text-sm flex-1">
                      {slot.location || "Disponible"}
                    </span>
                    {range && (
                      <span className="text-axe-muted text-xs shrink-0">
                        {range.start} – {range.end}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disponibilités */}
        {pro.availabilityPeriods && pro.availabilityPeriods.length > 0 && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Disponibilités</h2>
            <div className="space-y-3">
              {pro.availabilityPeriods.map((period) => (
                <div key={period.id} className="bg-axe-dark rounded-xl p-3 space-y-1.5">
                  {period.label && <p className="text-axe-white text-sm font-semibold">{period.label}</p>}
                  <p className="text-axe-muted text-xs">
                    {period.startDate} → {period.endDate} · {period.startTime}–{period.endTime}
                  </p>
                  <p className="text-axe-muted text-xs">{period.location}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {period.days.map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-axe-accent/10 text-axe-accent text-xs rounded-md font-medium">
                        {DAY_LABELS[d]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zones d'intervention */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
          <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
            Zones d&apos;intervention
          </h2>
          <div className="space-y-2">
            {pro.locations.length > 0 ? (
              pro.locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-axe-white">
                  <span>📍</span>
                  <span>{loc.city}</span>
                  {loc.postalCode && (
                    <span className="text-axe-muted">({loc.postalCode})</span>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-sm text-axe-white">
                <span>📍</span>
                <span>{pro.city}</span>
                {pro.postalCode && (
                  <span className="text-axe-muted">({pro.postalCode})</span>
                )}
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-white/5 flex flex-wrap gap-3 text-xs text-axe-muted">
            {pro.homeVisit && (
              <span className="bg-axe-dark px-2 py-1 rounded-lg">
                {SERVICE_TYPE_LABELS["home"]}
              </span>
            )}
            {pro.radius && (
              <span className="bg-axe-dark px-2 py-1 rounded-lg">
                Rayon : {pro.radius} km
              </span>
            )}
          </div>
        </div>

        {/* Politique d'annulation */}
        {pro.cancellationPolicy && pro.cancellationPolicy.rules.length > 0 && (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Politique d&apos;annulation</h2>
            <div className="space-y-2">
              {pro.cancellationPolicy.rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-axe-muted">
                    {rule.hoursBeforeSession >= 24
                      ? `Plus de ${rule.hoursBeforeSession}h avant`
                      : `Moins de ${rule.hoursBeforeSession}h avant`}
                  </span>
                  <span className={`font-semibold ${rule.refundPercent === 100 ? "text-green-400" : rule.refundPercent === 0 ? "text-red-400" : "text-axe-amber"}`}>
                    {rule.refundPercent}% remboursé
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA principal */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/booking/${pro.id}`}
            className="inline-block w-full bg-axe-accent text-axe-black font-bold text-base rounded-2xl px-8 py-4 hover:bg-axe-accentDark transition-colors text-center"
          >
            Réserver une séance →
          </Link>
          <button
            onClick={handleContactPro}
            className="inline-block w-full bg-axe-charcoal text-axe-white font-semibold text-base rounded-2xl px-8 py-4 hover:bg-axe-grey transition-colors border border-white/10 text-center"
          >
            Envoyer un message →
          </button>
          <Link
            href="/demande"
            className="inline-block w-full bg-axe-charcoal text-axe-white font-semibold text-base rounded-2xl px-8 py-4 hover:bg-axe-grey transition-colors border border-white/10 text-center"
          >
            Faire une demande →
          </Link>
        </div>

        {/* Section avis */}
        <ReviewsSection proId={params.id} proName={`${pro.firstName} ${pro.lastName}`} />

      </div>
    </div>
  );
}
