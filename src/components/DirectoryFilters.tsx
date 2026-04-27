"use client";

import { useState } from "react";
import { PROFESSION_LABELS } from "@/lib/constants";
import { Profession } from "@/lib/types";
import { geocodeCity } from "@/lib/geocode";

interface DirectoryFiltersProps {
  professions: Profession[];
  selected: string;
  onSelect: (p: string) => void;
  cityQuery: string;
  onCityChange: (c: string) => void;
  radiusKm: number;
  onRadiusChange: (r: number) => void;
  userCoords: { lat: number; lng: number } | null;
  onUserCoords: (c: { lat: number; lng: number } | null) => void;
}

const ALL_KEY = "all";
const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function DirectoryFilters({
  professions,
  selected,
  onSelect,
  cityQuery,
  onCityChange,
  radiusKm,
  onRadiusChange,
  userCoords,
  onUserCoords,
}: DirectoryFiltersProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const hasActiveFilters = selected !== ALL_KEY || cityQuery.trim() !== "" || userCoords !== null;

  const handleReset = () => {
    onSelect(ALL_KEY);
    onCityChange("");
    onUserCoords(null);
  };

  async function handleGeolocate() {
    setGeoLoading(true);
    try {
      if (cityQuery.trim()) {
        const coords = await geocodeCity(cityQuery.trim());
        if (coords) { onUserCoords(coords); setGeoLoading(false); return; }
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoLoading(false);
        },
        () => { alert("Géolocalisation refusée ou indisponible."); setGeoLoading(false); }
      );
      return;
    } catch {
      setGeoLoading(false);
    }
    setGeoLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Pills professions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onSelect(ALL_KEY)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selected === ALL_KEY
              ? "bg-axe-accent text-axe-black"
              : "bg-axe-charcoal border border-white/5 text-axe-muted hover:border-axe-accent/30 hover:text-axe-white"
          }`}
        >
          Tous
        </button>
        {professions.map((prof) => (
          <button
            key={prof}
            onClick={() => onSelect(prof)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selected === prof
                ? "bg-axe-accent text-axe-black"
                : "bg-axe-charcoal border border-white/5 text-axe-muted hover:border-axe-accent/30 hover:text-axe-white"
            }`}
          >
            {PROFESSION_LABELS[prof] ?? prof}
          </button>
        ))}
      </div>

      {/* Ville + géolocalisation */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-axe-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => { onCityChange(e.target.value); onUserCoords(null); }}
            placeholder="Filtrer par ville..."
            className="w-full bg-axe-charcoal border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-axe-white placeholder-axe-muted focus:outline-none focus:border-axe-accent/40 transition-colors"
          />
        </div>
        <button
          onClick={handleGeolocate}
          disabled={geoLoading}
          title={userCoords ? "Géolocalisation active" : "Me géolocaliser"}
          className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            userCoords
              ? "bg-axe-accent/10 border-axe-accent/30 text-axe-accent"
              : "bg-axe-charcoal border-white/5 text-axe-muted hover:text-axe-white hover:border-white/20"
          } disabled:opacity-50`}
        >
          {geoLoading ? "…" : "📍"}
        </button>
        {hasActiveFilters && (
          <button onClick={handleReset} className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium bg-axe-dark border border-white/5 text-axe-muted hover:text-axe-white hover:border-white/20 transition-all">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Rayon (visible seulement si géoloc active) */}
      {userCoords && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-axe-muted shrink-0">Rayon&nbsp;:</span>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  radiusKm === r
                    ? "bg-axe-accent text-axe-black"
                    : "bg-axe-charcoal border border-white/5 text-axe-muted hover:text-axe-white"
                }`}
              >
                {r}&nbsp;km
              </button>
            ))}
          </div>
          <span className="text-xs text-axe-accent font-medium">📍 Actif</span>
        </div>
      )}
    </div>
  );
}
