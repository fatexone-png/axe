import ProForm from "@/components/ProForm";

export const metadata = {
  title: "Rejoindre le réseau GetAxe — Professionnels",
  description: "Créez votre profil professionnel et rejoignez le réseau GetAxe de professionnels du corps.",
};

export default function ProPage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-10 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase mb-4">
            Réseau GetAxe · Professionnels
          </span>
          <h1 className="text-3xl font-bold text-axe-white mb-3">
            Rejoindre le réseau
          </h1>
          <p className="text-axe-muted text-sm max-w-sm mx-auto">
            Créez votre profil gratuitement. Tous les outils inclus. Vous ne payez que 8% sur les réservations que GetAxe vous apporte — rien d&apos;autre.
          </p>
        </div>

        {/* Promesse économique */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-axe-charcoal border border-white/5 rounded-xl p-3">
            <p className="text-axe-accent font-bold text-lg">0 €</p>
            <p className="text-axe-muted text-xs mt-1">Abonnement mensuel</p>
          </div>
          <div className="bg-axe-charcoal border border-white/5 rounded-xl p-3">
            <p className="text-axe-accent font-bold text-lg">8%</p>
            <p className="text-axe-muted text-xs mt-1">Sur les réservations</p>
          </div>
          <div className="bg-axe-charcoal border border-white/5 rounded-xl p-3">
            <p className="text-axe-accent font-bold text-lg">92%</p>
            <p className="text-axe-muted text-xs mt-1">Vous revient</p>
          </div>
        </div>

        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 mb-8 text-sm text-axe-muted">
          <strong className="text-axe-white block mb-1">Critères d&apos;admission</strong>
          Diplôme ou certification valide · Assurance RC Pro recommandée · Exercice dans le périmètre de compétence · Respect de la déontologie professionnelle.
        </div>

        <ProForm />
      </div>
    </div>
  );
}
