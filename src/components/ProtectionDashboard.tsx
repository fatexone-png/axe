"use client";

import { useState } from "react";
import { Professional } from "@/lib/types";
import MutuelleAdvisor from "./MutuelleAdvisor";
import RetirementSimulator from "./RetirementSimulator";

interface Protection {
  key: "insurance" | "mutuelle" | "retirement";
  label: string;
  description: string;
  hasIt: boolean;
  icon: string;
  urgency: "high" | "medium" | "low";
  detail: string;
}

interface Props {
  pro: Professional;
  onDeclareInsurance?: (company: string) => Promise<void>;
}

export default function ProtectionDashboard({ pro, onDeclareInsurance }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [declaringInsurance, setDeclaringInsurance] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState(pro.insuranceCompany ?? "");
  const [insuranceSaving, setInsuranceSaving] = useState(false);

  const protections: Protection[] = [
    {
      key: "insurance",
      label: "RC Pro",
      description: "Responsabilité Civile Professionnelle",
      hasIt: pro.hasInsurance ?? false,
      icon: "RC",
      urgency: "high",
      detail: "Obligatoire pour les professionnels de santé, fortement recommandée pour les coachs. Couvre les dommages causés à vos clients dans le cadre de votre activité.",
    },
    {
      key: "mutuelle",
      label: "Mutuelle santé",
      description: "Complémentaire santé indépendant",
      hasIt: pro.hasMutuelle ?? false,
      icon: "MUT",
      urgency: "high",
      detail: "En tant qu'indépendant, votre couverture Sécurité Sociale est moins complète qu'un salarié. Une mutuelle couvre hospitalisation, dentaire, optique et soins courants.",
    },
    {
      key: "retirement",
      label: "Retraite",
      description: "PER individuel ou contrat Madelin",
      hasIt: pro.hasRetirement ?? false,
      icon: "PER",
      urgency: "medium",
      detail: "Les indépendants cotisent moins pour la retraite que les salariés. Un PER (Plan Épargne Retraite) ou contrat Madelin permet de compenser avec un avantage fiscal.",
    },
  ];

  const missing = protections.filter((p) => !p.hasIt);
  const covered = protections.filter((p) => p.hasIt);
  const score = Math.round((covered.length / protections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Score de protection */}
      <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-axe-white font-semibold">Score de protection</p>
            <p className="text-xs text-axe-muted mt-0.5">Votre couverture en tant qu&apos;indépendant</p>
          </div>
          <div className={`text-2xl font-bold ${score === 100 ? "text-green-400" : score >= 66 ? "text-yellow-400" : "text-red-400"}`}>
            {score}%
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-axe-grey rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${score === 100 ? "bg-green-400" : score >= 66 ? "bg-yellow-400" : "bg-red-400"}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {protections.map((p) => (
            <div key={p.key} className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-2 ${p.hasIt ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              <span>{p.hasIt ? "✓" : "✗"}</span>
              <span className="font-medium">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Couvertures manquantes */}
      {missing.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-axe-white">
            {missing.length === 1 ? "1 protection manquante" : `${missing.length} protections manquantes`}
          </p>

          {missing.map((p) => (
            <div key={p.key} className="bg-axe-charcoal border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === p.key ? null : p.key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-block text-xs font-bold tracking-widest text-axe-accent bg-axe-accent/10 px-2 py-1 rounded-md w-10 text-center flex-shrink-0">{p.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-axe-white font-medium text-sm">{p.label}</p>
                      {p.urgency === "high" && (
                        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                          Prioritaire
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-axe-muted">{p.description}</p>
                  </div>
                </div>
                <span className="text-axe-muted text-lg">{open === p.key ? "−" : "+"}</span>
              </button>

              {open === p.key && (
                <div className="border-t border-white/5 p-4 space-y-4">
                  <p className="text-xs text-axe-muted leading-relaxed">{p.detail}</p>

                  {p.key === "mutuelle" && (
                    <MutuelleAdvisor pro={pro} />
                  )}

                  {p.key === "insurance" && (
                    <div className="space-y-4">
                      {/* Partenaires */}
                      <div className="space-y-2">
                        <p className="text-xs text-axe-muted font-medium">Partenaires RC Pro recommand&#233;s&nbsp;:</p>
                        {[
                          { name: "Hiscox", desc: "Sp&#233;cialiste professions lib&#233;rales et coachs", price: "15 &#8211; 40 &#8364;/mois", url: "https://www.hiscox.fr" },
                          { name: "Simplis", desc: "RC Pro en ligne pour auto-entrepreneurs", price: "10 &#8211; 30 &#8364;/mois", url: "https://www.simplis.fr" },
                          { name: "AXA Pro", desc: "Couverture compl&#232;te avec options pr&#233;voyance", price: "25 &#8211; 60 &#8364;/mois", url: "https://www.axa.fr" },
                        ].map((ins) => (
                          <a key={ins.name} href={ins.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between bg-axe-dark border border-white/5 rounded-lg px-4 py-3 hover:border-axe-accent/30 transition-colors group">
                            <div>
                              <p className="text-axe-white text-sm font-medium group-hover:text-axe-accent transition-colors" dangerouslySetInnerHTML={{ __html: ins.name }} />
                              <p className="text-xs text-axe-muted" dangerouslySetInnerHTML={{ __html: ins.desc }} />
                            </div>
                            <span className="text-xs text-axe-accent font-medium" dangerouslySetInnerHTML={{ __html: ins.price }} />
                          </a>
                        ))}
                      </div>

                      {/* D&#233;clarer une RC existante */}
                      <div className="border-t border-white/5 pt-4">
                        {!declaringInsurance ? (
                          <button
                            type="button"
                            onClick={() => setDeclaringInsurance(true)}
                            className="text-xs text-axe-accent hover:underline"
                          >
                            J&#39;ai d&#233;j&#224; une RC Pro &#8594; La d&#233;clarer
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-axe-white font-semibold">D&#233;clarer ma RC Pro</p>
                            <input
                              type="text"
                              placeholder="Compagnie d&#39;assurance (ex&nbsp;: Hiscox, AXA…)"
                              value={insuranceCompany}
                              onChange={(e) => setInsuranceCompany(e.target.value)}
                              className="w-full bg-axe-dark border border-white/10 rounded-lg px-3 py-2 text-axe-white text-sm placeholder-axe-muted focus:outline-none focus:border-axe-accent/50"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={insuranceSaving}
                                onClick={async () => {
                                  if (!onDeclareInsurance) return;
                                  setInsuranceSaving(true);
                                  await onDeclareInsurance(insuranceCompany);
                                  setInsuranceSaving(false);
                                  setDeclaringInsurance(false);
                                }}
                                className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                              >
                                {insuranceSaving ? "Enregistrement…" : "Enregistrer"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeclaringInsurance(false)}
                                className="text-xs text-axe-muted hover:text-axe-white px-3 py-2"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {p.key === "retirement" && (
                    <RetirementSimulator />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tout couvert */}
      {missing.length === 0 && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 text-center">
          <p className="text-green-400 font-semibold mb-1">Vous êtes bien protégé</p>
          <p className="text-xs text-green-400/70">RC Pro, mutuelle santé et retraite sont en place. Bravo.</p>
        </div>
      )}

      {/* Couvertures actives */}
      {covered.length > 0 && (
        <div>
          <p className="text-xs text-axe-muted uppercase tracking-wider font-semibold mb-3">Actif</p>
          <div className="space-y-2">
            {covered.map((p) => (
              <div key={p.key} className="flex items-center gap-3 bg-green-500/5 border border-green-500/10 rounded-lg px-4 py-2.5">
                <span className="text-green-400">✓</span>
                <div>
                  <p className="text-sm text-axe-white font-medium">{p.label}</p>
                  <p className="text-xs text-axe-muted">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
