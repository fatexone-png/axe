import NeedForm from "@/components/NeedForm";

export const metadata = {
  title: "Déposer une demande — GetAxe",
  description: "Décrivez votre situation et votre objectif. GetAxe trouve le professionnel adapté.",
};

export default function DemandePage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-10 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase mb-4">
            Étape 1 sur 1
          </span>
          <h1 className="text-3xl font-bold text-axe-white mb-3">
            Déposez votre demande
          </h1>
          <p className="text-axe-muted text-sm max-w-sm mx-auto">
            Répondez à quelques questions. L&apos;équipe GetAxe vous contacte pour vous proposer le bon professionnel.
          </p>
        </div>
        <NeedForm />
      </div>
    </div>
  );
}
