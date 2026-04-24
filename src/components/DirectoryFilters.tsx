"use client";

import { PROFESSION_LABELS } from "@/lib/constants";
import { Profession } from "@/lib/types";

interface DirectoryFiltersProps {
  professions: Profession[];
  selected: string;
  onSelect: (p: string) => void;
  cityQuery: string;
  onCityChange: (c: string) => void;
}

const ALL_KEY = "all";

export default function DirectoryFilters({
  professions,
  selected,
  onSelect,
  cityQuery,
  onCityChange,
}: DirectoryFiltersProps) {
  const hasActiveFilters = selected !== ALL_KEY || cityQuery.trim() !== "";

  const handleReset = () => {
    onSelect(ALL_KEY);
    onCityChange("");
  };

  return (
    <div className="space-y-4">
      {/* Pills de professions scrollables */}
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

      {/* Input ville + bouton réinitialiser */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-axe-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Filtrer par ville..."
            className="w-full bg-axe-charcoal border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-axe-white placeholder-axe-muted focus:outline-none focus:border-axe-accent/40 transition-colors"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium bg-axe-dark border border-white/5 text-axe-muted hover:text-axe-white hover:border-white/20 transition-all"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
