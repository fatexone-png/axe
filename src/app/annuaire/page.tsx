"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getProfessionals } from "@/lib/firestore";
import { Professional, Profession } from "@/lib/types";
import ProDirectoryCard from "@/components/ProDirectoryCard";
import DirectoryFilters from "@/components/DirectoryFilters";

const ALL_KEY = "all";

// ── Spinner ─────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <span className="inline-block w-10 h-10 rounded-full border-4 border-axe-charcoal border-t-axe-accent animate-spin" />
    </div>
  );
}

// ── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-axe-grey/40 rounded w-3/4" />
          <div className="h-3 bg-axe-grey/30 rounded w-1/3" />
        </div>
        <div className="space-y-1.5">
          <div className="h-5 bg-axe-grey/40 rounded-lg w-24" />
          <div className="h-5 bg-axe-grey/30 rounded-lg w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-axe-grey/30 rounded-md w-16" />
        <div className="h-5 bg-axe-grey/30 rounded-md w-20" />
        <div className="h-5 bg-axe-grey/30 rounded-md w-14" />
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-axe-grey/30 rounded w-16" />
        <div className="h-3 bg-axe-grey/30 rounded w-28" />
      </div>
      <div className="h-10 bg-axe-grey/30 rounded-xl w-full" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnnuairePage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState<string>(ALL_KEY);
  const [cityQuery, setCityQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProfessionals()
      .then((data) => {
        if (!cancelled) {
          // Filtre côté client : seulement les professionnels approuvés
          setProfessionals(data.filter((p) => p.status === "approved"));
        }
      })
      .catch(() => {
        if (!cancelled) setProfessionals([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Liste unique des professions disponibles dans l'annuaire
  const availableProfessions = useMemo<Profession[]>(() => {
    const seen = new Set<Profession>();
    for (const p of professionals) {
      seen.add(p.profession);
    }
    return Array.from(seen);
  }, [professionals]);

  // Résultats filtrés
  const filtered = useMemo<Professional[]>(() => {
    const cityNorm = cityQuery.trim().toLowerCase();

    return professionals.filter((p) => {
      // Filtre profession
      if (selectedProfession !== ALL_KEY && p.profession !== selectedProfession) {
        return false;
      }

      // Filtre ville : cherche dans la ville principale + toutes les zones d'intervention
      if (cityNorm) {
        const cities = [
          p.city,
          ...(p.locations ?? []).map((l) => l.city),
        ].map((c) => c.toLowerCase());

        if (!cities.some((c) => c.includes(cityNorm))) {
          return false;
        }
      }

      return true;
    });
  }, [professionals, selectedProfession, cityQuery]);

  return (
    <main className="min-h-screen bg-axe-black">
      {/* Lien retour */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-axe-muted hover:text-axe-white transition-colors"
        >
          <span aria-hidden="true">←</span> Retour
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-axe-accent/10 border border-axe-accent/20 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-axe-accent" />
            <span className="text-xs font-medium text-axe-accent">Annuaire AXE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-axe-white leading-tight">
            Trouvez votre expert{" "}
            <span className="text-axe-accent">sport &amp; santé</span>
          </h1>

          <p className="text-axe-muted text-base sm:text-lg max-w-2xl">
            Professionnels vérifiés, assurés, disponibles près de chez vous.
          </p>

          {/* Compteur */}
          {!loading && (
            <p className="text-sm text-axe-muted pt-1">
              <strong className="text-axe-white">{filtered.length}</strong>{" "}
              {filtered.length > 1
                ? "professionnels disponibles"
                : filtered.length === 1
                ? "professionnel disponible"
                : "professionnel disponible"}
            </p>
          )}
        </div>
      </section>

      {/* Filtres */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 sm:p-5">
          <DirectoryFilters
            professions={availableProfessions}
            selected={selectedProfession}
            onSelect={setSelectedProfession}
            cityQuery={cityQuery}
            onCityChange={setCityQuery}
          />
        </div>
      </section>

      {/* Contenu */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* État vide */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-axe-charcoal border border-white/5 flex items-center justify-center text-3xl">
              🔍
            </div>
            <div className="space-y-2">
              <p className="text-axe-white font-semibold text-lg">
                Aucun professionnel trouvé
              </p>
              <p className="text-axe-muted text-sm max-w-sm">
                {cityQuery || selectedProfession !== ALL_KEY
                  ? "Essayez d'élargir vos critères de recherche ou réinitialisez les filtres."
                  : "Notre réseau de professionnels se développe. Revenez bientôt !"}
              </p>
            </div>
            {(cityQuery || selectedProfession !== ALL_KEY) && (
              <button
                onClick={() => {
                  setSelectedProfession(ALL_KEY);
                  setCityQuery("");
                }}
                className="bg-axe-accent text-axe-black font-bold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity text-sm"
              >
                Voir tous les professionnels
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pro) => (
              <ProDirectoryCard key={pro.id} pro={pro} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
