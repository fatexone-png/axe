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
    title: "Déposez votre demande",
    desc: "Décrivez votre objectif, votre situation et vos préférences en moins de 3 minutes.",
  },
  {
    step: "02",
    title: "AXE sélectionne les bons profils",
    desc: "Nos équipes identifient les professionnels adaptés — diplômes, assurance RC Pro et spécialités vérifiés.",
  },
  {
    step: "03",
    title: "Vous êtes mis en relation",
    desc: "Vous échangez directement avec le professionnel pour organiser votre suivi, à votre rythme.",
  },
];

const FOR_WHO = [
  { abbr: "RS", label: "Reprise sportive", desc: "Après un arrêt, une blessure ou une longue pause." },
  { abbr: "PF", label: "Performance", desc: "Progresser, atteindre vos objectifs, vous dépasser." },
  { abbr: "DR", label: "Douleur & récupération", desc: "Dos, genou, épaule : trouver le bon spécialiste." },
  { abbr: "RO", label: "Rééducation post-op", desc: "Genou, hanche, épaule, main : retrouver fonction et mobilité après une opération." },
  { abbr: "PC", label: "Préparation combat", desc: "Boxe, MMA, sports de contact : des préparateurs spécialisés." },
  { abbr: "MB", label: "Mobilité & senior", desc: "Bouger mieux, vieillir en forme, rester autonome." },
];

const PROFESSIONALS_NETWORK = [
  { label: "Coachs sportifs", desc: "Remise en forme, performance, discipline sportive." },
  { label: "Préparateurs physiques", desc: "Programmes sur-mesure pour sportifs et compétiteurs." },
  { label: "Kinésithérapeutes", desc: "Rééducation, douleur, mobilité articulaire." },
  { label: "Ostéopathes", desc: "Tensions, blocages, récupération globale." },
  { label: "Médecins du sport", desc: "Suivi médical, aptitude, prévention." },
  { label: "Récupération & mobilité", desc: "Étirements, fascias, préparation mentale." },
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
    desc: "AXE vous accompagne pour couvrir les angles morts de l'indépendance : assurance responsabilité civile, complémentaire santé adaptée à votre activité, et simulateur retraite PER.",
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

const WHY_AXE = [
  {
    title: "Vérification manuelle systématique",
    desc: "Chaque dossier est examiné par notre équipe : diplômes d'État, certifications, assurance RC Pro en cours de validité. Aucun profil non vérifié n'est visible.",
  },
  {
    title: "Le seul écosystème complet pour les indépendants du sport",
    desc: "Mise en relation + protection sociale + facturation électronique + guide IA. Aucune autre plateforme ne rassemble ces outils pour cette profession.",
  },
  {
    title: "Tous les profils, toutes les villes",
    desc: "Du coach indépendant de quartier au médecin du sport en cabinet libéral. Intervention à domicile, en ligne ou en studio, partout en France.",
  },
  {
    title: "Construit pour le long terme",
    desc: "AXE n'est pas un annuaire. C'est une infrastructure pour que les professionnels du corps exercent mieux, soient mieux protégés et génèrent plus.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Bande de chiffres */}
      <div className="bg-axe-charcoal border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-axe-accent">{s.value}</p>
              <p className="text-xs text-axe-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comment ça marche */}
      <Section id="comment" title="Comment ça marche ?" dark>
        <div className="grid md:grid-cols-3 gap-6">
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
        subtitle="AXE accompagne toutes les personnes qui veulent prendre soin de leur corps, quel que soit l'objectif."
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FOR_WHO.map((f) => (
            <div key={f.label} className="bg-axe-dark border border-white/5 rounded-2xl p-5 space-y-3">
              <span className="inline-block text-xs font-bold tracking-widest text-axe-accent bg-axe-accent/10 px-2 py-1 rounded-md">
                {f.abbr}
              </span>
              <h3 className="text-axe-white font-semibold text-sm">{f.label}</h3>
              <p className="text-axe-muted text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/demande" className="btn-primary inline-block">
            Trouver mon expert →
          </Link>
        </div>
      </Section>

      {/* Le réseau */}
      <Section id="reseau" title="Les professionnels du réseau" dark>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROFESSIONALS_NETWORK.map((p) => (
            <div key={p.label} className="flex items-start gap-4 bg-axe-charcoal border border-white/5 rounded-2xl p-5">
              <div className="w-2 h-2 rounded-full bg-axe-accent mt-1.5 flex-shrink-0" />
              <div>
                <h3 className="text-axe-white font-semibold text-sm mb-1">{p.label}</h3>
                <p className="text-axe-muted text-xs">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/annuaire" className="btn-primary inline-block">
            Parcourir l&apos;annuaire →
          </Link>
        </div>
      </Section>

      {/* Outils professionnels — section clé */}
      <Section
        id="pour-les-pros"
        title="La plateforme complète pour les indépendants du sport"
        subtitle="AXE n'est pas un simple annuaire. C'est l'infrastructure dont les professionnels du corps ont besoin pour exercer sereinement."
      >
        <div className="grid md:grid-cols-2 gap-5">
          {PRO_TOOLS.map((t) => (
            <div key={t.tag} className="bg-axe-dark border border-white/5 rounded-2xl p-6 space-y-3 hover:border-axe-accent/20 transition-colors">
              <span className="inline-block text-xs font-bold tracking-widest text-axe-accent uppercase border border-axe-accent/30 px-2.5 py-1 rounded-full">
                {t.tag}
              </span>
              <h3 className="text-axe-white font-semibold">{t.title}</h3>
              <p className="text-axe-muted text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/pro" className="btn-primary inline-block">
            Rejoindre le réseau AXE →
          </Link>
        </div>
      </Section>

      {/* Pourquoi AXE */}
      <Section id="pourquoi" title="Pourquoi AXE ?" dark>
        <div className="grid md:grid-cols-2 gap-6">
          {WHY_AXE.map((w) => (
            <div key={w.title} className="flex gap-4">
              <div className="w-1 rounded-full bg-axe-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-axe-white font-semibold mb-1">{w.title}</h3>
                <p className="text-axe-muted text-sm leading-relaxed">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sécurité & confiance */}
      <Section id="confiance" title="Sécurité et confiance">
        <div className="max-w-2xl mx-auto bg-axe-dark border border-white/5 rounded-2xl p-8 text-center space-y-4">
          <p className="text-axe-muted text-sm leading-relaxed">
            Chaque professionnel du réseau AXE est vérifié manuellement avant toute mise en relation :
            diplômes d&apos;État, certifications professionnelles, assurance RC Pro en cours de validité.
            Notre label de confiance vous indique le niveau de vérification de chaque profil.
          </p>
          <p className="text-xs text-axe-muted/70 border-t border-white/5 pt-4">
            <strong className="text-axe-muted">Important :</strong> AXE ne remplace pas une consultation médicale d&apos;urgence.
            En cas d&apos;urgence, appelez le <strong className="text-axe-white">15</strong> ou le <strong className="text-axe-white">112</strong>.
          </p>
        </div>
      </Section>

      {/* Orientation — devenir professionnel */}
      <Section id="orientation" title="Vous voulez devenir professionnel ?" dark>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-axe-muted text-sm leading-relaxed">
            AXE accompagne aussi ceux qui veulent <strong className="text-axe-white">démarrer une carrière</strong> dans le sport et la santé.
            Coach sportif, kinésithérapeute, ostéopathe — trouvez la formation diplômante
            adaptée à votre profil et votre région, avec nos conseils d&apos;orientation personnalisés.
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

      {/* CTA final double */}
      <section className="py-24 px-4 bg-axe-black text-center">
        <p className="text-xs font-semibold tracking-widest text-axe-accent uppercase mb-4">
          Commencez maintenant
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-axe-white mb-4 leading-tight">
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
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-axe-muted">
            © {new Date().getFullYear()} AXE · Plateforme de mise en relation · Tous droits réservés
          </p>
          <div className="flex gap-6 text-xs text-axe-muted">
            <Link href="/annuaire" className="hover:text-axe-white transition-colors">Annuaire</Link>
            <Link href="/guide" className="hover:text-axe-white transition-colors">Guide IA</Link>
            <Link href="/legal" className="hover:text-axe-white transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
