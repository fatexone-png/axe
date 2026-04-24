import ProForm from "@/components/ProForm";

export const metadata = {
  title: "Rejoindre le réseau AXE — Professionnels",
  description: "Créez votre profil professionnel et rejoignez le réseau AXE de professionnels du corps.",
};

export default function ProPage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-10 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase mb-4">
            Réseau AXE · Professionnels
          </span>
          <h1 className="text-3xl font-bold text-axe-white mb-3">
            Rejoindre le réseau
          </h1>
          <p className="text-axe-muted text-sm max-w-sm mx-auto">
            Créez votre profil. Après vérification par nos équipes, vous rejoignez le réseau AXE et recevez des mises en relation qualifiées.
          </p>
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
