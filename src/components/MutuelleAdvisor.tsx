"use client";

import { Professional } from "@/lib/types";

interface Partner {
  name: string;
  logo: string;
  tagline: string;
  strengths: string[];
  priceRange: string;
  bestFor: string[];
  url: string;
  highlight?: boolean;
}

const PARTNERS: Partner[] = [
  {
    name: "Alan",
    logo: "A",
    tagline: "La mutuelle 100% digitale pour indépendants",
    strengths: [
      "Gestion 100% mobile",
      "Remboursements en 24h",
      "Pas d'avance de frais",
      "Résiliation à tout moment",
    ],
    priceRange: "25 – 60 €/mois",
    bestFor: ["auto_entrepreneur", "ei", "sasu"],
    url: "https://alan.com",
    highlight: true,
  },
  {
    name: "Harmonie Mutuelle",
    logo: "H",
    tagline: "La référence des professionnels du sport",
    strengths: [
      "Partenaire de fédérations sportives",
      "Couverture spécifique sport",
      "Garanties renforcées kiné & ostéo",
      "Réseau de soins étendu",
    ],
    priceRange: "35 – 80 €/mois",
    bestFor: ["kine", "osteo", "sports_doctor", "coach", "physical_trainer"],
    url: "https://www.harmonie-mutuelle.fr",
    highlight: false,
  },
  {
    name: "Malakoff Humanis",
    logo: "M",
    tagline: "Spécialiste des travailleurs indépendants",
    strengths: [
      "Programme TNS dédié",
      "Prévoyance incluse en option",
      "Accompagnement en cas d'arrêt",
      "Couverture famille avantageuse",
    ],
    priceRange: "40 – 90 €/mois",
    bestFor: ["physical_trainer", "recovery", "sports_doctor"],
    url: "https://www.malakoffhumanis.com",
  },
  {
    name: "April",
    logo: "Ap",
    tagline: "Sur-mesure pour les indépendants",
    strengths: [
      "Devis en 2 minutes",
      "Garanties modulables",
      "Fort sur optique & dentaire",
      "Contrat individuel sans contrainte",
    ],
    priceRange: "30 – 75 €/mois",
    bestFor: ["auto_entrepreneur", "ei", "eurl"],
    url: "https://www.april.fr",
  },
];

const PROFESSION_ADVICE: Record<string, string> = {
  coach: "En tant que coach sportif indépendant, votre corps est votre outil de travail. Privilégiez une mutuelle avec une bonne couverture kiné et médecine du sport.",
  physical_trainer: "Votre activité physique intensive nécessite une couverture renforcée pour les soins musculo-squelettiques et la prévoyance en cas d'arrêt.",
  kine: "En tant que professionnel de santé libéral, votre mutuelle doit couvrir les actes non remboursés par la CPAM et inclure une prévoyance solide.",
  osteo: "L'ostéopathie est peu couverte par la Sécurité Sociale. Une bonne mutuelle complète votre protection personnelle en cas d'arrêt de travail.",
  sports_doctor: "Votre statut libéral nécessite une protection santé complète incluant prévoyance et garanties professionnelles renforcées.",
  recovery: "Votre activité manuelle justifie une couverture renforcée pour les soins du dos, des articulations et la médecine physique.",
};

interface Props {
  pro: Professional;
  compact?: boolean;
}

export default function MutuelleAdvisor({ pro, compact }: Props) {
  const advice = PROFESSION_ADVICE[pro.profession] ?? "Une mutuelle adaptée à votre statut d'indépendant est essentielle pour protéger votre activité.";

  const recommended = PARTNERS.filter(
    (p) => p.bestFor.includes(pro.profession) || p.bestFor.includes(pro.legalStatus ?? "")
  );
  const others = PARTNERS.filter((p) => !recommended.includes(p));
  const sorted = [...recommended, ...others];

  if (compact) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-axe-muted leading-relaxed">{advice}</p>
        <div className="grid grid-cols-2 gap-2">
          {sorted.slice(0, 2).map((p) => (
            <PartnerCardCompact key={p.name} partner={p} isRecommended={recommended.includes(p)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conseil personnalisé */}
      <div className="bg-axe-accent/5 border border-axe-accent/20 rounded-xl p-4">
        <p className="text-xs font-semibold text-axe-accent uppercase tracking-wider mb-2">
          Recommandation personnalisée
        </p>
        <p className="text-sm text-axe-muted leading-relaxed">{advice}</p>
      </div>

      {/* Partenaires recommandés */}
      {recommended.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider mb-3">
            Adaptés à votre profil
          </p>
          <div className="space-y-3">
            {recommended.map((p) => (
              <PartnerCard key={p.name} partner={p} isRecommended />
            ))}
          </div>
        </div>
      )}

      {/* Autres partenaires */}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider mb-3">
            Autres options
          </p>
          <div className="space-y-3">
            {others.map((p) => (
              <PartnerCard key={p.name} partner={p} isRecommended={false} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-axe-muted/60 text-center">
        GetAxe est partenaire de ces mutuelles. En souscrivant via GetAxe, vous bénéficiez d&apos;un accompagnement personnalisé.
      </p>
    </div>
  );
}

function PartnerCard({ partner, isRecommended }: { partner: Partner; isRecommended: boolean }) {
  return (
    <div className={`bg-axe-charcoal border rounded-xl p-4 space-y-3 ${isRecommended ? "border-axe-accent/20" : "border-white/5"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-axe-grey flex items-center justify-center text-axe-white font-bold text-sm flex-shrink-0">
            {partner.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-axe-white font-semibold text-sm">{partner.name}</p>
              {isRecommended && (
                <span className="text-xs bg-axe-accent/10 text-axe-accent border border-axe-accent/20 px-1.5 py-0.5 rounded-full">
                  Recommandé
                </span>
              )}
            </div>
            <p className="text-xs text-axe-muted">{partner.tagline}</p>
          </div>
        </div>
        <p className="text-xs text-axe-accent font-medium flex-shrink-0">{partner.priceRange}</p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {partner.strengths.map((s) => (
          <div key={s} className="flex items-start gap-1.5 text-xs text-axe-muted">
            <span className="text-axe-accent mt-0.5 flex-shrink-0">✓</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-axe-accent text-axe-black hover:bg-axe-accentDark transition-colors"
      >
        Découvrir {partner.name}
      </a>
    </div>
  );
}

function PartnerCardCompact({ partner, isRecommended }: { partner: Partner; isRecommended: boolean }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-axe-charcoal border rounded-xl p-3 hover:border-axe-accent/30 transition-colors ${isRecommended ? "border-axe-accent/20" : "border-white/5"}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded bg-axe-grey flex items-center justify-center text-axe-white font-bold text-xs">
          {partner.logo}
        </div>
        <p className="text-axe-white font-semibold text-xs">{partner.name}</p>
      </div>
      <p className="text-axe-accent text-xs font-medium">{partner.priceRange}</p>
    </a>
  );
}
