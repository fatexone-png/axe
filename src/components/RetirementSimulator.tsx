"use client";

import { useState, useMemo } from "react";

const formatEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// Taux de cotisation retraite auto-entrepreneur services (~14% du CA)
const RETIREMENT_RATE = 0.14;
// Pension de base estimée : un auto-entrepreneur perçoit ~40% de la retraite
// d'un salarié équivalent. Formule simplifiée basée sur les données CNAV 2024.
const AUTO_ENTREPRENEUR_PENSION_RATIO = 0.40;
// Pension cible confortable (objectif de remplacement : 70% du revenu)
const REPLACEMENT_RATE = 0.70;
// Plafond déduction PER 2024 : 10% du revenu net imposable (min 4 399 €)
const PER_DEDUCTION_RATE = 0.10;
const PER_DEDUCTION_MIN = 4399;
// Taux marginal d'imposition moyen d'un indépendant ~30% (hypothèse)
const MARGINAL_TAX_RATE = 0.30;
// Rendement moyen d'un PER bien géré sur 20+ ans
const PER_YIELD = 0.05;

interface SimulationResult {
  monthlyRevenue: number;
  annualRevenue: number;
  urssafPension: number;
  targetPension: number;
  gap: number;
  yearsToRetirement: number;
  recommendedMonthlyPer: number;
  taxSaving: number;
  netMonthlyEffort: number;
  perDeductionLimit: number;
  capitalAtRetirement: number;
}

export default function RetirementSimulator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(2500);
  const [currentAge, setCurrentAge] = useState(32);
  const [retirementAge, setRetirementAge] = useState(64);
  const [showDetails, setShowDetails] = useState(false);

  const result = useMemo<SimulationResult>(() => {
    const annual = monthlyRevenue * 12;
    const years = Math.max(retirementAge - currentAge, 1);
    const careerRatio = Math.min(years, 42) / 42;

    // Pension URSSAF estimée (régime général auto-entrepreneur)
    const fullPension = annual * AUTO_ENTREPRENEUR_PENSION_RATIO * careerRatio / 12;
    const urssafPension = Math.round(fullPension);

    // Objectif de pension confortable
    const targetPension = Math.round(monthlyRevenue * REPLACEMENT_RATE);
    const gap = Math.max(targetPension - urssafPension, 0);

    // Effort PER mensuel pour combler le gap (capitalisation + rente estimée sur 25 ans)
    // Formule : mensualité pour atteindre un capital qui génère `gap` €/mois sur 25 ans
    const monthsToRetirement = years * 12;
    const capitalNeeded = gap * 12 * 25; // capital brut pour 25 ans de rente
    // Mensualité pour atteindre ce capital avec rendement PER
    const r = PER_YIELD / 12;
    const recommendedMonthlyPer = monthsToRetirement > 0
      ? Math.round(capitalNeeded * r / (Math.pow(1 + r, monthsToRetirement) - 1))
      : 0;

    // Capital projeté avec ce versement
    const capitalAtRetirement = monthsToRetirement > 0
      ? Math.round(recommendedMonthlyPer * (Math.pow(1 + r, monthsToRetirement) - 1) / r)
      : 0;

    // Déduction fiscale PER
    const perDeductionLimit = Math.max(annual * PER_DEDUCTION_RATE, PER_DEDUCTION_MIN);
    const perAnnual = recommendedMonthlyPer * 12;
    const deductible = Math.min(perAnnual, perDeductionLimit);
    const taxSaving = Math.round(deductible * MARGINAL_TAX_RATE / 12);
    const netMonthlyEffort = Math.max(recommendedMonthlyPer - taxSaving, 0);

    return {
      monthlyRevenue,
      annualRevenue: annual,
      urssafPension,
      targetPension,
      gap,
      yearsToRetirement: years,
      recommendedMonthlyPer,
      taxSaving,
      netMonthlyEffort,
      perDeductionLimit: Math.round(perDeductionLimit),
      capitalAtRetirement,
    };
  }, [monthlyRevenue, currentAge, retirementAge]);

  const scoreColor = result.gap === 0
    ? "text-green-400"
    : result.urssafPension < result.targetPension * 0.4
    ? "text-red-400"
    : "text-yellow-400";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-5">
        <SliderField
          label="Revenu mensuel moyen"
          value={monthlyRevenue}
          onChange={setMonthlyRevenue}
          min={500}
          max={10000}
          step={100}
          format={formatEur}
        />
        <SliderField
          label="Âge actuel"
          value={currentAge}
          onChange={setCurrentAge}
          min={20}
          max={60}
          step={1}
          format={(v) => `${v} ans`}
        />
        <SliderField
          label="Âge de départ à la retraite"
          value={retirementAge}
          onChange={setRetirementAge}
          min={60}
          max={70}
          step={1}
          format={(v) => `${v} ans`}
        />
      </div>

      {/* Résultat principal */}
      <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-axe-muted uppercase tracking-wider font-semibold">
          Simulation · {result.yearsToRetirement} ans de cotisation
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-axe-dark rounded-xl p-4 text-center">
            <p className="text-xs text-axe-muted mb-2">Pension URSSAF estimée</p>
            <p className={`text-2xl font-bold ${scoreColor}`}>
              {formatEur(result.urssafPension)}
            </p>
            <p className="text-xs text-axe-muted mt-1">/ mois</p>
          </div>
          <div className="bg-axe-dark rounded-xl p-4 text-center">
            <p className="text-xs text-axe-muted mb-2">Pension cible (70%)</p>
            <p className="text-2xl font-bold text-axe-white">
              {formatEur(result.targetPension)}
            </p>
            <p className="text-xs text-axe-muted mt-1">/ mois</p>
          </div>
        </div>

        {/* Gap visuel */}
        {result.gap > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-axe-muted">
              <span>Couverture actuelle</span>
              <span className={scoreColor}>
                {Math.round((result.urssafPension / result.targetPension) * 100)}%
              </span>
            </div>
            <div className="w-full bg-axe-grey rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-red-400 transition-all"
                style={{ width: `${Math.min((result.urssafPension / result.targetPension) * 100, 100)}%` }}
              />
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-red-400 font-bold text-lg">{formatEur(result.gap)}/mois manquants</p>
              <p className="text-xs text-red-400/70 mt-0.5">
                à combler pour maintenir votre niveau de vie à la retraite
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Solution PER */}
      {result.gap > 0 && (
        <div className="bg-axe-accent/5 border border-axe-accent/20 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-axe-white">
            Solution : Plan Épargne Retraite (PER)
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-axe-charcoal rounded-xl p-3 text-center">
              <p className="text-xs text-axe-muted mb-1">Versement recommandé</p>
              <p className="text-lg font-bold text-axe-accent">
                {formatEur(result.recommendedMonthlyPer)}
              </p>
              <p className="text-xs text-axe-muted">/ mois brut</p>
            </div>
            <div className="bg-axe-charcoal rounded-xl p-3 text-center">
              <p className="text-xs text-axe-muted mb-1">Économie fiscale</p>
              <p className="text-lg font-bold text-green-400">
                −{formatEur(result.taxSaving)}
              </p>
              <p className="text-xs text-axe-muted">/ mois</p>
            </div>
            <div className="bg-axe-charcoal rounded-xl p-3 text-center">
              <p className="text-xs text-axe-muted mb-1">Effort réel net</p>
              <p className="text-lg font-bold text-axe-white">
                {formatEur(result.netMonthlyEffort)}
              </p>
              <p className="text-xs text-axe-muted">/ mois</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-axe-muted bg-axe-charcoal rounded-lg p-3">
            <span className="text-axe-accent mt-0.5">💡</span>
            <p>
              En versant {formatEur(result.recommendedMonthlyPer)}/mois sur un PER,
              vous constituez un capital estimé de{" "}
              <strong className="text-axe-white">{formatEur(result.capitalAtRetirement)}</strong>{" "}
              à {retirementAge} ans, soit une rente complémentaire d&apos;environ{" "}
              <strong className="text-axe-white">{formatEur(result.gap)}/mois</strong>{" "}
              pendant 25 ans. Le tout avec une déduction fiscale annuelle jusqu&apos;à{" "}
              <strong className="text-axe-white">{formatEur(result.perDeductionLimit)}</strong>.
            </p>
          </div>

          {/* Bouton détails */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-axe-muted hover:text-axe-white transition-colors"
          >
            {showDetails ? "Masquer les détails ↑" : "Comment fonctionne le PER ? ↓"}
          </button>

          {showDetails && (
            <div className="space-y-3 text-xs text-axe-muted leading-relaxed">
              <p>
                <strong className="text-axe-white">Étape 1 — URSSAF (automatique)</strong><br />
                Chaque mois, quand vous déclarez votre CA sur urssaf.fr, URSSAF prélève ~22% dont ~14% vont à vos caisses retraite. Vous n&apos;avez rien à faire de plus.
              </p>
              <p>
                <strong className="text-axe-white">Étape 2 — PER individuel (volontaire)</strong><br />
                Vous ouvrez un PER chez Linxea, AXA ou Placement-direct. Vous programmez un virement mensuel automatique. Chaque euro versé réduit votre revenu imposable — un auto-entrepreneur qui verse 200€/mois économise ~60€ d&apos;impôts.
              </p>
              <p>
                <strong className="text-axe-white">À la retraite</strong><br />
                Vous choisissez : sortie en capital (récupérez tout d&apos;un coup), sortie en rente (versement mensuel à vie) ou mix des deux.
              </p>
            </div>
          )}

          {/* CTA partenaires */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { name: "Linxea Spirit PER", badge: "Recommandé", url: "https://www.linxea.com" },
              { name: "Placement-direct PER", badge: "Sans frais d'entrée", url: "https://www.placement-direct.fr" },
            ].map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-axe-charcoal border border-white/5 hover:border-axe-accent/30 rounded-xl p-3 transition-colors"
              >
                <p className="text-xs font-semibold text-axe-white">{p.name}</p>
                <p className="text-xs text-axe-accent mt-0.5">{p.badge}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-axe-muted/50 text-center">
        Simulation indicative basée sur les règles SSI 2024. Ne constitue pas un conseil financier.
        Consultez un conseiller en gestion de patrimoine pour un bilan personnalisé.
      </p>
    </div>
  );
}

function SliderField({
  label, value, onChange, min, max, step, format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-axe-muted font-medium">{label}</label>
        <span className="text-sm font-bold text-axe-white">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-axe-grey rounded-full appearance-none cursor-pointer accent-axe-accent"
      />
      <div className="flex justify-between text-xs text-axe-muted/50">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
