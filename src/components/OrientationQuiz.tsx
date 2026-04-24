"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FormationProfession,
  EducationLevel,
  FORMATIONS,
  REGIONS,
  EDUCATION_LEVEL_LABELS,
  PROFESSION_ORIENTATION_LABELS,
} from "@/data/formations";

// ─── Types internes ───────────────────────────────────────────────────────────

type Step = "profession" | "level" | "region" | "results";

interface ProfessionCard {
  key: FormationProfession;
  title: string;
  description: string;
  meta: string;
}

interface LevelCard {
  key: EducationLevel;
  label: string;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const PROFESSION_CARDS: ProfessionCard[] = [
  {
    key: "coach",
    title: "Coach sportif / Personal trainer",
    description: "Accompagnez vos clients vers leurs objectifs physiques.",
    meta: "1–3 ans · BPJEPS (obligatoire)",
  },
  {
    key: "physical_trainer",
    title: "Préparateur physique",
    description: "Optimisez la performance de sportifs et compétiteurs.",
    meta: "2–5 ans · Licence/Master STAPS",
  },
  {
    key: "kine",
    title: "Kinésithérapeute",
    description: "Rééducation, douleur, mobilité — un métier de santé réglementé.",
    meta: "4 ans · Diplôme d'État (IFMK)",
  },
  {
    key: "osteo",
    title: "Ostéopathe",
    description: "Thérapie manuelle globale pour soulager tensions et douleurs.",
    meta: "5 ans · École agréée Ministère",
  },
  {
    key: "sports_doctor",
    title: "Médecin du sport",
    description: "Le plus haut niveau de suivi médical sportif.",
    meta: "9–11 ans · Médecine + DU",
  },
];

const LEVEL_CARDS: LevelCard[] = [
  { key: "bac", label: EDUCATION_LEVEL_LABELS["bac"] },
  { key: "bac2", label: EDUCATION_LEVEL_LABELS["bac2"] },
  { key: "bac3", label: EDUCATION_LEVEL_LABELS["bac3"] },
  { key: "bac5plus", label: EDUCATION_LEVEL_LABELS["bac5plus"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDiplomaTypeLabel(
  type: "state" | "private_accredited" | "university" | "cqp"
): { label: string; className: string; warning?: string } {
  switch (type) {
    case "state":
      return {
        label: "Diplôme d'État",
        className: "bg-green-500/10 text-green-400 border border-green-500/20",
      };
    case "private_accredited":
      return {
        label: "Agréé Ministère",
        className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      };
    case "university":
      return {
        label: "Diplôme Universitaire",
        className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      };
    case "cqp":
      return {
        label: "CQP — Qualification pro",
        className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
        warning: "Le CQP n'est pas un diplôme d'État. Il ne suffit pas seul pour exercer en indépendant rémunéré — il est recommandé de le compléter par un BPJEPS.",
      };
  }
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

interface ProgressBarProps {
  step: Step;
}

function ProgressBar({ step }: ProgressBarProps) {
  const steps: { key: Step; label: string; index: number }[] = [
    { key: "profession", label: "Métier", index: 0 },
    { key: "level", label: "Niveau", index: 1 },
    { key: "region", label: "Région", index: 2 },
  ];

  const currentIndex =
    step === "results"
      ? 3
      : steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => {
        const isPast = currentIndex > s.index;
        const isActive = currentIndex === s.index;

        return (
          <div key={s.key} className="flex items-center">
            {/* Indicateur */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  isPast
                    ? "bg-axe-accent/20 border-axe-accent/40 text-axe-accent"
                    : isActive
                    ? "bg-axe-accent border-axe-accent text-axe-black"
                    : "bg-axe-charcoal border-white/10 text-axe-muted/50"
                }`}
              >
                {isPast ? (
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{s.index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium tracking-wide transition-colors ${
                  isActive
                    ? "text-axe-accent"
                    : isPast
                    ? "text-axe-muted"
                    : "text-axe-muted/40"
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Connecteur */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-px mx-3 mb-5 transition-colors ${
                  currentIndex > s.index ? "bg-axe-accent/30" : "bg-white/8"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function OrientationQuiz() {
  const [step, setStep] = useState<Step>("profession");
  const [profession, setProfession] = useState<FormationProfession | null>(null);
  const [level, setLevel] = useState<EducationLevel | null>(null);
  const [region, setRegion] = useState<string>("");

  // Réinitialisation complète
  function handleReset() {
    setStep("profession");
    setProfession(null);
    setLevel(null);
    setRegion("");
  }

  // ── Calcul des résultats ─────────────────────────────────────────────────

  const filteredFormations = FORMATIONS.filter(
    (f) => f.profession === profession
  );

  // Pour chaque formation, récupérer les écoles dans la région sélectionnée
  function getSchoolsForRegion(formation: (typeof FORMATIONS)[0]) {
    const inRegion = formation.schools.filter((s) => s.region === region);
    const others = formation.schools.filter((s) => s.region !== region);
    return { inRegion, others };
  }

  // ── Rendu étape 1 ────────────────────────────────────────────────────────

  function renderStepProfession() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-axe-white mb-2">
          Quel métier vous attire ?
        </h2>
        <p className="text-axe-muted text-sm mb-8">
          Sélectionnez le domaine qui correspond à votre projet professionnel.
        </p>

        <div className="grid gap-3">
          {PROFESSION_CARDS.map((card) => {
            const isSelected = profession === card.key;
            return (
              <button
                key={card.key}
                onClick={() => setProfession(card.key)}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-150 ${
                  isSelected
                    ? "border-axe-accent/40 bg-axe-accent/5"
                    : "border-white/5 bg-axe-charcoal hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-axe-white text-base font-semibold mb-1">
                      {card.title}
                    </p>
                    <p className="text-axe-muted text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-axe-accent bg-axe-accent"
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 10 10"
                        fill="none"
                        className="w-3 h-3"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5l2.5 2.5 3.5-4"
                          stroke="#0A0A0A"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-axe-muted/60 text-xs mt-3 font-medium tracking-wide">
                  {card.meta}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => setStep("level")}
            disabled={!profession}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              profession
                ? "bg-axe-accent text-axe-black hover:opacity-90"
                : "bg-axe-charcoal text-axe-muted/40 cursor-not-allowed border border-white/5"
            }`}
          >
            Suivant →
          </button>
        </div>
      </div>
    );
  }

  // ── Rendu étape 2 ────────────────────────────────────────────────────────

  function renderStepLevel() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-axe-white mb-2">
          Quel est votre niveau d&apos;études actuel ?
        </h2>
        <p className="text-axe-muted text-sm mb-8">
          Votre niveau conditionne les formations accessibles immédiatement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEVEL_CARDS.map((card) => {
            const isSelected = level === card.key;
            return (
              <button
                key={card.key}
                onClick={() => setLevel(card.key)}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-150 ${
                  isSelected
                    ? "border-axe-accent/40 bg-axe-accent/5"
                    : "border-white/5 bg-axe-charcoal hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-axe-white text-sm font-semibold leading-snug">
                    {card.label}
                  </p>
                  <div
                    className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-axe-accent bg-axe-accent"
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 10 10"
                        fill="none"
                        className="w-3 h-3"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5l2.5 2.5 3.5-4"
                          stroke="#0A0A0A"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep("profession")}
            className="bg-axe-charcoal text-axe-white border border-white/10 rounded-xl px-6 py-3 hover:bg-axe-grey transition-colors text-sm font-medium"
          >
            ← Retour
          </button>
          <button
            onClick={() => setStep("region")}
            disabled={!level}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              level
                ? "bg-axe-accent text-axe-black hover:opacity-90"
                : "bg-axe-charcoal text-axe-muted/40 cursor-not-allowed border border-white/5"
            }`}
          >
            Suivant →
          </button>
        </div>
      </div>
    );
  }

  // ── Rendu étape 3 ────────────────────────────────────────────────────────

  function renderStepRegion() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-axe-white mb-2">
          Dans quelle région êtes-vous ?
        </h2>
        <p className="text-axe-muted text-sm mb-8">
          Nous identifierons les écoles disponibles près de chez vous.
        </p>

        <div className="relative">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-axe-dark border border-white/10 rounded-xl px-4 py-3 text-axe-white appearance-none cursor-pointer focus:outline-none focus:border-axe-accent/40 transition-colors"
          >
            <option value="" disabled className="text-axe-muted">
              Sélectionnez votre région
            </option>
            {REGIONS.map((r) => (
              <option key={r} value={r} className="bg-axe-dark text-axe-white">
                {r}
              </option>
            ))}
          </select>
          {/* Chevron custom */}
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg
              viewBox="0 0 12 8"
              fill="none"
              className="w-3 h-3 text-axe-muted"
              aria-hidden="true"
            >
              <path
                d="M1 1l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep("level")}
            className="bg-axe-charcoal text-axe-white border border-white/10 rounded-xl px-6 py-3 hover:bg-axe-grey transition-colors text-sm font-medium"
          >
            ← Retour
          </button>
          <button
            onClick={() => setStep("results")}
            disabled={!region}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              region
                ? "bg-axe-accent text-axe-black hover:opacity-90"
                : "bg-axe-charcoal text-axe-muted/40 cursor-not-allowed border border-white/5"
            }`}
          >
            Voir mes formations →
          </button>
        </div>
      </div>
    );
  }

  // ── Rendu résultats ───────────────────────────────────────────────────────

  function renderResults() {
    const professionLabel =
      profession ? PROFESSION_ORIENTATION_LABELS[profession] : "";

    return (
      <div>
        {/* En-tête résultats */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-axe-accent uppercase mb-3">
            Votre parcours recommandé
          </p>
          <h2 className="text-2xl font-bold text-axe-white mb-1">
            {professionLabel}
          </h2>
          <p className="text-axe-muted text-sm">
            {filteredFormations.length} formation
            {filteredFormations.length > 1 ? "s" : ""} identifiée
            {filteredFormations.length > 1 ? "s" : ""} · Région sélectionnée :{" "}
            <span className="text-axe-white">{region}</span>
          </p>
        </div>

        {/* Cartes formations */}
        <div className="grid gap-5">
          {filteredFormations.map((formation) => {
            const { inRegion, others } = getSchoolsForRegion(formation);
            const hasLocalSchools = inRegion.length > 0;
            const diplomaBadge = getDiplomaTypeLabel(formation.diplomaType);

            return (
              <div
                key={formation.id}
                className="bg-axe-charcoal border border-white/5 rounded-2xl overflow-hidden"
              >
                {/* Bandeau supérieur obligatoire */}
                {formation.isRequired && (
                  <div className="bg-red-500/8 border-b border-red-500/15 px-5 py-2.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs font-semibold tracking-wide">
                      Obligatoire pour exercer légalement
                    </p>
                  </div>
                )}

                <div className="p-6">
                  {/* Badges en-tête */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diplomaBadge.className}`}
                    >
                      {diplomaBadge.label}
                    </span>
                    {formation.alternance && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-axe-accent/10 text-axe-accent border border-axe-accent/20">
                        Alternance disponible
                      </span>
                    )}
                  </div>

                  {/* Avertissement CQP */}
                  {diplomaBadge.warning && (
                    <div className="mb-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-yellow-400/90 leading-relaxed">{diplomaBadge.warning}</p>
                    </div>
                  )}

                  {/* Titre et description */}
                  <h3 className="text-axe-white font-bold text-base mb-2 leading-snug">
                    {formation.diploma}
                  </h3>
                  <p className="text-axe-muted text-sm leading-relaxed mb-5">
                    {formation.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="border-t border-white/5 pt-4 mb-5">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div>
                        <p className="text-axe-muted/60 text-xs uppercase tracking-wider mb-0.5">
                          Durée
                        </p>
                        <p className="text-axe-white text-sm font-medium">
                          {formation.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-axe-muted/60 text-xs uppercase tracking-wider mb-0.5">
                          Coût
                        </p>
                        <p className="text-axe-white text-sm font-medium">
                          {formation.cost}
                        </p>
                      </div>
                      <div>
                        <p className="text-axe-muted/60 text-xs uppercase tracking-wider mb-0.5">
                          Niveau minimum
                        </p>
                        <p className="text-axe-white text-sm font-medium">
                          {EDUCATION_LEVEL_LABELS[formation.minLevel]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Écoles */}
                  <div className="border-t border-white/5 pt-4">
                    {hasLocalSchools ? (
                      <>
                        <p className="text-axe-muted/70 text-xs font-semibold uppercase tracking-wider mb-3">
                          Écoles dans ta région
                        </p>
                        <ul className="space-y-2">
                          {inRegion.map((school) => (
                            <li key={school.name}>
                              <a
                                href={school.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 group rounded-lg px-3 py-2 -mx-3 hover:bg-white/4 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-axe-accent flex-shrink-0" />
                                  <span className="text-axe-white text-sm font-medium truncate group-hover:text-axe-accent transition-colors">
                                    {school.name}
                                  </span>
                                  <span className="text-axe-muted text-sm flex-shrink-0">
                                    — {school.city}
                                  </span>
                                </div>
                                <svg
                                  viewBox="0 0 8 8"
                                  fill="none"
                                  className="w-3 h-3 text-axe-muted group-hover:text-axe-accent flex-shrink-0 transition-colors"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M1.5 6.5L6.5 1.5M6.5 1.5H3M6.5 1.5V5"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="text-axe-muted/70 text-xs font-semibold uppercase tracking-wider mb-1">
                          Pas d&apos;école dans ta région
                        </p>
                        <p className="text-axe-muted text-xs mb-3">
                          Voici les plus proches disponibles :
                        </p>
                        <ul className="space-y-2">
                          {others.slice(0, 4).map((school) => (
                            <li key={school.name}>
                              <a
                                href={school.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 group rounded-lg px-3 py-2 -mx-3 hover:bg-white/4 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
                                  <span className="text-axe-muted text-sm font-medium truncate group-hover:text-axe-white transition-colors">
                                    {school.name}
                                  </span>
                                  <span className="text-axe-muted/60 text-sm flex-shrink-0">
                                    — {school.city}
                                  </span>
                                </div>
                                <svg
                                  viewBox="0 0 8 8"
                                  fill="none"
                                  className="w-3 h-3 text-axe-muted/50 group-hover:text-axe-muted flex-shrink-0 transition-colors"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M1.5 6.5L6.5 1.5M6.5 1.5H3M6.5 1.5V5"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA bas */}
        <div className="mt-8 bg-axe-dark border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-axe-white font-semibold mb-1">
              Des questions sur votre parcours ?
            </p>
            <p className="text-axe-muted text-sm">
              Le Guide IA AXE répond à vos questions sur les formations, diplômes et débouchés.
            </p>
          </div>
          <Link
            href="/guide"
            className="flex-shrink-0 bg-axe-accent text-axe-black font-bold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
          >
            Poser une question au Guide IA →
          </Link>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleReset}
            className="bg-axe-charcoal text-axe-white border border-white/10 rounded-xl px-6 py-3 hover:bg-axe-grey transition-colors text-sm font-medium"
          >
            ← Recommencer
          </button>
        </div>
      </div>
    );
  }

  // ── Layout principal ──────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Barre de progression (masquée sur résultats) */}
      {step !== "results" && <ProgressBar step={step} />}

      {/* Contenu de l'étape */}
      <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 md:p-8">
        {step === "profession" && renderStepProfession()}
        {step === "level" && renderStepLevel()}
        {step === "region" && renderStepRegion()}
        {step === "results" && renderResults()}
      </div>
    </div>
  );
}
