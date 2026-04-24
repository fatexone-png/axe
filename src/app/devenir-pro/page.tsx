import OrientationQuiz from "@/components/OrientationQuiz";
import Link from "next/link";

export const metadata = {
  title: "Devenir professionnel du sport & de la santé",
  description:
    "Trouvez la formation diplômante adaptée à votre profil et votre région. BPJEPS, IFMK, ostéopathie, STAPS — AXE vous oriente.",
};

const INFO_CARDS = [
  {
    title: "Diplômes d'État uniquement",
    desc: "Nous référençons exclusivement des formations reconnues par l'État français ou agréées par les Ministères compétents. Aucune certification privée non reconnue.",
  },
  {
    title: "Formations vérifiées",
    desc: "Chaque école listée a été vérifiée : agrément, accréditation et légitimité pour délivrer le diplôme concerné.",
  },
  {
    title: "Un partenaire pour la suite",
    desc: "Une fois diplômé, AXE vous accompagne pour trouver vos clients, gérer votre admin et protéger votre activité.",
  },
];

export default function DevenirProPage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase border border-axe-accent/30 px-3 py-1 rounded-full mb-6">
            Orientation · Formations · Diplômes
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-axe-white mb-4 leading-tight">
            Devenez professionnel<br />du sport &amp; de la santé
          </h1>
          <p className="text-axe-muted text-lg max-w-xl mx-auto leading-relaxed">
            Coach sportif, kinésithérapeute, ostéopathe, préparateur physique, médecin du sport —
            trouvez la formation diplômante adaptée à votre profil et votre région.
          </p>
        </div>

        {/* Quiz */}
        <OrientationQuiz />

        {/* Section informative sous le quiz */}
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {INFO_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-axe-dark border border-white/5 rounded-xl p-5 flex gap-3"
            >
              <div className="w-1 bg-axe-accent rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-axe-white font-semibold mb-2">{card.title}</h3>
                <p className="text-axe-muted text-sm leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA si déjà diplômé */}
        <div className="mt-12 bg-axe-charcoal border border-axe-accent/20 rounded-2xl p-6 text-center space-y-3">
          <p className="text-axe-white font-semibold">Déjà diplômé ?</p>
          <p className="text-axe-muted text-sm">
            Rejoignez le réseau AXE et trouvez vos premiers clients dès aujourd&apos;hui.
          </p>
          <Link
            href="/pro"
            className="inline-block bg-axe-accent text-axe-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Créer mon profil professionnel →
          </Link>
        </div>

      </div>
    </div>
  );
}
