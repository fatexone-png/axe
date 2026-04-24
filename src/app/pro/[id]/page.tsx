"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfessionalById } from "@/lib/firestore";
import { Professional, Profession } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import ReviewsSection from "@/components/ReviewsSection";

interface ProPageProps {
  params: { id: string };
}

const PROFESSION_COLORS: Record<Profession, string> = {
  coach: "bg-green-500/10 text-green-400",
  kine: "bg-blue-500/10 text-blue-400",
  osteo: "bg-purple-500/10 text-purple-400",
  physical_trainer: "bg-orange-500/10 text-orange-400",
  sports_doctor: "bg-red-500/10 text-red-400",
  recovery: "bg-teal-500/10 text-teal-400",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  home: "À domicile",
  online: "En ligne",
  studio: "Studio",
};

export default function ProPublicPage({ params }: ProPageProps) {
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

        {/* CTA principal */}
        <div className="text-center">
          <Link
            href="/demande"
            className="inline-block w-full bg-axe-accent text-axe-black font-bold text-base rounded-2xl px-8 py-4 hover:bg-axe-accentDark transition-colors"
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
