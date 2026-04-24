"use client";

import { useState } from "react";
import { Professional } from "@/lib/types";
import { markOfferSent, CoverageType } from "@/lib/firestore";
import MutuelleAdvisor from "./MutuelleAdvisor";

interface Props {
  pro: Professional;
  onUpdate: (id: string, fields: Partial<Professional>) => void;
}

export default function CoveragePanel({ pro, onUpdate }: Props) {
  const [loading, setLoading] = useState<CoverageType | null>(null);
  const [expanded, setExpanded] = useState<CoverageType | null>(null);

  const coverages = [
    {
      type: "insurance" as CoverageType,
      label: "RC Pro",
      icon: "🛡",
      description: "Responsabilité Civile Professionnelle",
      hasIt: pro.hasInsurance,
      offerSent: pro.insuranceOfferSent,
    },
    {
      type: "mutuelle" as CoverageType,
      label: "Mutuelle santé",
      icon: "❤️",
      description: "Complémentaire santé pour indépendants",
      hasIt: pro.hasMutuelle,
      offerSent: pro.mutuelleOfferSent,
    },
    {
      type: "retirement" as CoverageType,
      label: "Retraite",
      icon: "📈",
      description: "PER individuel ou contrat Madelin",
      hasIt: pro.hasRetirement,
      offerSent: pro.retirementOfferSent,
    },
  ];

  const missing = coverages.filter((c) => !c.hasIt);
  if (missing.length === 0) return null;

  const handleOffer = async (type: CoverageType) => {
    if (!pro.id) return;
    setLoading(type);
    try {
      await markOfferSent(pro.id, type);
      const field =
        type === "insurance" ? "insuranceOfferSent"
        : type === "mutuelle" ? "mutuelleOfferSent"
        : "retirementOfferSent";
      onUpdate(pro.id, { [field]: true });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-axe-dark border border-white/5 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
          Couvertures manquantes · {missing.length} produit{missing.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {missing.map((c) => (
          <div key={c.type}>
            {/* Ligne principale */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-base">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-axe-white">{c.label}</p>
                <p className="text-xs text-axe-muted">{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {c.offerSent ? (
                  <span className="text-xs text-green-400 border border-green-500/20 px-2.5 py-1 rounded-lg">
                    Envoyée ✓
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      handleOffer(c.type);
                      setExpanded(expanded === c.type ? null : c.type);
                    }}
                    disabled={loading === c.type}
                    className="text-xs text-axe-accent border border-axe-accent/30 px-3 py-1.5 rounded-lg hover:bg-axe-accent/10 transition-colors disabled:opacity-50"
                  >
                    {loading === c.type ? "…" : "Proposer"}
                  </button>
                )}
                <button
                  onClick={() => setExpanded(expanded === c.type ? null : c.type)}
                  className="text-axe-muted hover:text-axe-white transition-colors text-lg w-6 text-center"
                >
                  {expanded === c.type ? "−" : "+"}
                </button>
              </div>
            </div>

            {/* Détail partenaires */}
            {expanded === c.type && (
              <div className="px-4 pb-4 pt-1 bg-axe-black/20">
                {c.type === "mutuelle" && (
                  <MutuelleAdvisor pro={pro} compact />
                )}
                {c.type === "insurance" && (
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Hiscox", desc: "Spécialiste professions libérales", price: "15–40 €/mois", url: "https://www.hiscox.fr" },
                      { name: "Simplis", desc: "RC Pro auto-entrepreneurs en ligne", price: "10–30 €/mois", url: "https://www.simplis.fr" },
                      { name: "AXA Pro", desc: "Couverture complète + options", price: "25–60 €/mois", url: "https://www.axa.fr" },
                    ].map((p) => (
                      <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-axe-charcoal rounded-lg px-3 py-2 hover:border-axe-accent/30 border border-white/5 transition-colors">
                        <div>
                          <p className="text-xs font-medium text-axe-white">{p.name}</p>
                          <p className="text-xs text-axe-muted">{p.desc}</p>
                        </div>
                        <span className="text-xs text-axe-accent">{p.price}</span>
                      </a>
                    ))}
                  </div>
                )}
                {c.type === "retirement" && (
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Linxea PER", desc: "Meilleur PER individuel, frais réduits", price: "Dès 50 €/mois", url: "https://www.linxea.com" },
                      { name: "Madelin AXA", desc: "Déduction fiscale pour TNS", price: "Dès 100 €/mois", url: "https://www.axa.fr" },
                      { name: "Placement-direct", desc: "Accompagnement personnalisé", price: "Libre", url: "https://www.placement-direct.fr" },
                    ].map((p) => (
                      <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-axe-charcoal rounded-lg px-3 py-2 hover:border-axe-accent/30 border border-white/5 transition-colors">
                        <div>
                          <p className="text-xs font-medium text-axe-white">{p.name}</p>
                          <p className="text-xs text-axe-muted">{p.desc}</p>
                        </div>
                        <span className="text-xs text-axe-accent">{p.price}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 border-t border-white/5">
        <p className="text-xs text-axe-muted/50">
          V2 : envoi email automatique au pro + tracking conversion partenaire.
        </p>
      </div>
    </div>
  );
}
