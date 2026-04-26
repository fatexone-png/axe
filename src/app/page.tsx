import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Link from "next/link";

const STATS = [
  { value: "6", label: "spécialités couvertes" },
  { value: "100%", label: "pros vérifiés manuellement" },
  { value: "48h", label: "délai de mise en relation" },
  { value: "2026", label: "facturation électronique ready" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Décrivez votre situation",
    desc: "Opération récente, douleur chronique, objectif de performance, reprise sportive — soyez précis. La qualité du professionnel trouvé dépend de la précision de votre demande.",
  },
  {
    step: "02",
    title: "On sélectionne, pas un algorithme",
    desc: "Notre équipe analyse votre demande et identifie les professionnels dont les diplômes, la spécialité et la localisation correspondent vraiment à votre cas. Pas le plus proche — le plus adapté.",
  },
  {
    step: "03",
    title: "Vous choisissez et vous commencez",
    desc: "Vous échangez directement avec le professionnel. Aucun intermédiaire entre vous et lui par la suite. Votre suivi peut durer une séance ou deux ans — c'est vous qui décidez.",
  },
];

const FOR_WHO = [
  { abbr: "RS", label: "Reprise sportive", desc: "6 mois sans courir, une épaule qui lâche en pleine saison. Reprendre seul, c'est reprendre trop vite — et se reblesser." },
  { abbr: "PF", label: "Performance", desc: "Plateau depuis 3 mois, mêmes séances, aucun résultat. Nos pros travaillent avec des objectifs chiffrés." },
  { abbr: "DR", label: "Douleur & récupération", desc: "Lombalgie chronique, tendinite persistante, épaule bloquée. Le bon kiné peut changer votre quotidien en quelques séances." },
  { abbr: "RO", label: "Rééducation post-op", desc: "Ligaments du genou, prothèse de hanche, reconstruction d'épaule. AXE identifie les kinés formés pour votre type d'opération." },
  { abbr: "PC", label: "Préparation combat", desc: "Boxe, MMA, judo, grappling. Nos préparateurs maîtrisent les cycles charge-récupération propres aux arts martiaux." },
  { abbr: "MB", label: "Mobilité & senior", desc: "Après 60 ans, perdre de la mobilité n'est pas une fatalité. Protocoles validés pour rester autonome et actif." },
];

const PRO_TOOLS = [
  {
    tag: "Clients",
    title: "Trouvez vos premiers clients",
    desc: "Votre profil vérifié est visible par des milliers de personnes qui cherchent exactement votre expertise. AXE fait le matching, vous faites le métier.",
  },
  {
    tag: "Protection",
    title: "RC Pro, mutuelle, retraite",
    desc: "AXE vous accompagne pour couvrir les angles morts de l'indépendance : assurance RC Pro, complémentaire santé, et simulateur retraite PER.",
  },
  {
    tag: "Admin",
    title: "Facturation électronique 2026",
    desc: "Générez des factures conformes à la réforme obligatoire de septembre 2026. Numérotation automatique, mentions légales, TVA — prêt pour Pennylane.",
  },
  {
    tag: "Guide IA",
    title: "Votre conseiller 24h/24",
    desc: "URSSAF, cotisations SSI, franchise de TVA, arrêt maladie en indépendant — posez vos questions à l'assistant IA AXE, spécialisé pour les pros du sport.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Chiffres clés */}
      <div className="bg-axe-charcoal border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-axe-accent">{s.value}</p>
              <p className="text-xs text-axe-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION CLIENTS ──────────────────────────────── */}

      {/* Comment ça marche */}
      <Section id="comment" title="Comment ça marche ?" dark>
        <div className="grid sm:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="bg-axe-charcoal border border-white/5 rounded-2xl p-6">
              <span className="text-axe-accent text-xs font-bold tracking-widest">{s.step}</span>
              <h3 className="text-axe-white font-semibold mt-2 mb-2">{s.title}</h3>
              <p className="text-axe-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pour qui */}
      <Section
        id="pour-qui"
        title="Pour qui ?"
        subtitle="Chaque situation appelle un professionnel différent. AXE identifie celui dont la spécialité correspond exactement à votre cas."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FOR_WHO.map((f) => (
            <div key={f.label} className="bg-axe-dark border border-white/5 rounded-2xl p-5 space-y-2">
              <span className="inline-block text-xs font-bold tracking-widest text-axe-accent bg-axe-accent/10 px-2 py-1 rounded-md">
                {f.abbr}
              </span>
              <h3 className="text-axe-white font-semibold text-sm">{f.label}</h3>
              <p className="text-axe-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/demande" className="btn-primary inline-block">
            Trouver mon expert →
          </Link>
        </div>
      </Section>

      {/* ── SECTION PROS ─────────────────────────────────── */}

      {/* Outils professionnels */}
      <Section
        id="pour-les-pros"
        title="La plateforme complète pour les indépendants du sport"
        subtitle="AXE n'est pas un simple annuaire. C'est l'infrastructure dont les professionnels du corps ont besoin pour exercer sereinement."
        dark
      >
        <div className="grid sm:grid-cols-2 gap-5">
          {PRO_TOOLS.map((t) => (
            <div key={t.tag} className="bg-axe-black border border-white/5 rounded-2xl p-6 space-y-3 hover:border-axe-accent/20 transition-colors">
              <span className="inline-block text-xs font-bold tracking-widest text-axe-accent uppercase border border-axe-accent/30 px-2.5 py-1 rounded-full">
                {t.tag}
              </span>
              <h3 className="text-axe-white font-semibold">{t.title}</h3>
              <p className="text-axe-muted text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/pro" className="btn-primary inline-block">
            Rejoindre le réseau AXE →
          </Link>
        </div>
      </Section>

      {/* Orientation — devenir professionnel */}
      <Section id="orientation" title="Vous voulez devenir professionnel ?">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-axe-muted text-sm leading-relaxed">
            AXE accompagne aussi ceux qui veulent <strong className="text-axe-white">démarrer une carrière</strong> dans le sport et la santé.
            Coach sportif, kinésithérapeute, ostéopathe — trouvez la formation diplômante
            adaptée à votre profil et votre région.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs text-axe-muted">
            <div className="bg-axe-charcoal rounded-xl p-3 text-center">
              <p className="text-axe-white font-semibold mb-1">BPJEPS</p>
              <p>Coach sportif</p>
            </div>
            <div className="bg-axe-charcoal rounded-xl p-3 text-center">
              <p className="text-axe-white font-semibold mb-1">IFMK</p>
              <p>Kinésithérapeute</p>
            </div>
            <div className="bg-axe-charcoal rounded-xl p-3 text-center">
              <p className="text-axe-white font-semibold mb-1">D.O.</p>
              <p>Ostéopathe</p>
            </div>
          </div>
          <Link href="/devenir-pro" className="inline-block bg-axe-accent text-axe-black font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity">
            Découvrir les formations →
          </Link>
        </div>
      </Section>

      {/* ── CTA FINAL ────────────────────────────────────── */}

      <section className="py-20 px-4 bg-axe-dark border-t border-white/5 text-center">
        <p className="text-xs font-semibold tracking-widest text-axe-accent uppercase mb-4">
          Commencez maintenant
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-axe-white mb-4 leading-tight">
          Vous cherchez un expert ?<br />
          <span className="text-axe-accent">Ou vous en êtes un ?</span>
        </h2>
        <p className="text-axe-muted mb-10 max-w-md mx-auto text-sm leading-relaxed">
          AXE s&apos;adresse aux deux côtés du terrain. Clients, trouvez votre professionnel en 48h.
          Pros, rejoignez l&apos;unique plateforme qui vous protège autant qu&apos;elle vous apporte des clients.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/demande" className="btn-primary">
            Trouver un professionnel
          </Link>
          <Link
            href="/pro"
            className="bg-axe-charcoal text-axe-white font-semibold px-8 py-4 rounded-xl hover:bg-axe-grey transition-colors border border-white/10"
          >
            Rejoindre en tant que pro
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 bg-axe-black">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-axe-muted">
            © {new Date().getFullYear()} AXE · Plateforme de mise en relation · Tous droits réservés
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-axe-muted">
            <Link href="/annuaire" className="hover:text-axe-white transition-colors">Annuaire</Link>
            <Link href="/devenir-pro" className="hover:text-axe-white transition-colors">Devenir pro</Link>
            <Link href="/guide" className="hover:text-axe-white transition-colors">Guide IA</Link>
            <Link href="/legal" className="hover:text-axe-white transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
