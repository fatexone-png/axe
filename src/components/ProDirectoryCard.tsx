"use client";

import Link from "next/link";
import { Professional, Profession, TrustLevel } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";

interface ProDirectoryCardProps {
  pro: Professional;
  distanceKm?: number;
}

// ── Couleurs par profession ─────────────────────────────────────────────────

const PROFESSION_COLORS: Record<Profession, string> = {
  coach: "bg-green-500/15 text-green-400 border border-green-500/20",
  physical_trainer: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  mental_coach: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  kine: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  osteo: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  sports_doctor: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
  recovery: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
};

// ── Badge trustLevel ────────────────────────────────────────────────────────

interface TrustBadgeConfig {
  label: string;
  icon: string;
  className: string;
}

const TRUST_BADGES: Record<TrustLevel, TrustBadgeConfig> = {
  unverified: {
    label: "Non vérifié",
    icon: "",
    className: "bg-axe-grey/30 text-axe-muted border border-white/5",
  },
  verified: {
    label: "Vérifié",
    icon: "✓",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  },
  certified: {
    label: "Certifié",
    icon: "★",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  },
  elite: {
    label: "Elite GetAxe",
    icon: "👑",
    className: "bg-axe-amber/15 text-axe-amber border border-axe-amber/20",
  },
};

// ── Composant ───────────────────────────────────────────────────────────────

export default function ProDirectoryCard({ pro, distanceKm }: ProDirectoryCardProps) {
  const professionColor =
    PROFESSION_COLORS[pro.profession] ??
    "bg-axe-grey/30 text-axe-muted border border-white/5";

  const trustBadge = TRUST_BADGES[pro.trustLevel];

  const displayedSpecialties = pro.specialties.slice(0, 3);
  const extraCount = pro.specialties.length - 3;

  const displayCity =
    pro.locations?.length > 0 ? pro.locations[0].city : pro.city;

  return (
    <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 hover:border-axe-accent/20 transition-all flex flex-col gap-4">
      {/* Header : nom + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-axe-white truncate">
            {pro.firstName} {pro.lastName}
          </p>
          <p className="text-xs text-axe-muted mt-0.5">{displayCity}</p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {/* Badge profession */}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap ${professionColor}`}
          >
            {PROFESSION_LABELS[pro.profession] ?? pro.profession}
          </span>

          {/* Badge trustLevel */}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap ${trustBadge.className}`}
          >
            {trustBadge.icon && (
              <span className="mr-1">{trustBadge.icon}</span>
            )}
            {trustBadge.label}
          </span>
        </div>
      </div>

      {/* Spécialités */}
      {pro.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayedSpecialties.map((spec) => (
            <span
              key={spec}
              className="text-xs bg-axe-dark text-axe-muted px-2 py-0.5 rounded-md border border-white/5"
            >
              {spec}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-xs bg-axe-dark text-axe-muted px-2 py-0.5 rounded-md border border-white/5">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {/* Note + prix de départ */}
      <div className="flex items-center justify-between text-xs">
        {pro.averageRating && pro.reviewCount ? (
          <span className="flex items-center gap-1 text-axe-muted">
            <span className="text-axe-amber font-bold">★</span>
            <span className="text-axe-white font-semibold">{pro.averageRating.toFixed(1)}</span>
            <span className="text-axe-muted">({pro.reviewCount})</span>
          </span>
        ) : (
          <span className="text-axe-muted italic">Aucun avis</span>
        )}
        {pro.services && pro.services.length > 0 && (
          <span className="text-axe-accent font-semibold">
            À partir de {Math.min(...pro.services.map((s) => s.priceEuros))} €
          </span>
        )}
      </div>

      {/* Distance */}
      {distanceKm !== undefined && (
        <div className="text-xs text-axe-muted flex items-center gap-1">
          <span>📍</span>
          <span>~{Math.round(distanceKm)} km</span>
        </div>
      )}

      {/* Infos RC Pro + Expérience */}
      <div className="flex items-center justify-between text-xs text-axe-muted">
        <span className="flex items-center gap-1">
          {pro.hasInsurance ? (
            <span className="text-green-400 font-bold">✓</span>
          ) : (
            <span className="text-red-400 font-bold">✗</span>
          )}
          RC Pro
        </span>
        <span>
          <strong className="text-axe-white">{pro.experienceYears}</strong>{" "}
          {pro.experienceYears > 1 ? "ans" : "an"} d&apos;expérience
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/pro/${pro.id ?? ""}`}
        className="mt-auto block text-center bg-axe-accent text-axe-black font-bold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity text-sm"
      >
        Voir le profil →
      </Link>
    </div>
  );
}
