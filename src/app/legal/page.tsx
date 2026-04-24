import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions importantes — AXE",
  description: "Informations légales et limites d'utilisation de la plateforme AXE.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-axe-white mb-3">Mentions importantes</h1>
          <p className="text-axe-muted text-sm">
            Lisez attentivement ces informations avant d&apos;utiliser la plateforme AXE.
          </p>
        </div>

        <div className="space-y-8">
          <Article title="1. Nature du service">
            <p>
              AXE est une plateforme de <strong>mise en relation</strong> entre des clients et des professionnels
              du corps, du sport et de la santé préventive. AXE n&apos;est pas un établissement de santé,
              ne délivre pas de diagnostics médicaux et ne fournit pas de prescriptions.
            </p>
          </Article>

          <Article title="2. Urgences médicales">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 font-semibold mb-2">⚠ En cas d&apos;urgence médicale</p>
              <p className="text-red-300 text-sm">
                AXE ne remplace en aucun cas une consultation médicale d&apos;urgence.
                Si vous êtes en situation d&apos;urgence, appelez immédiatement le <strong>15 (SAMU)</strong> ou le <strong>112 (numéro d&apos;urgence européen)</strong>.
              </p>
            </div>
          </Article>

          <Article title="3. Responsabilité des professionnels">
            <p>
              Chaque professionnel référencé sur AXE est entièrement responsable de ses actes,
              de ses recommandations et de l&apos;exercice de son activité. AXE ne peut être tenu responsable
              des préjudices résultant d&apos;une prestation réalisée par un professionnel du réseau.
            </p>
          </Article>

          <Article title="4. Déontologie et périmètre de compétence">
            <p>
              Les professionnels de santé inscrits sur AXE (kinésithérapeutes, ostéopathes, médecins du sport)
              sont tenus de respecter leur code de déontologie et les règles de leur ordre professionnel.
            </p>
            <p className="mt-3">
              Les coachs sportifs et préparateurs physiques doivent exercer dans les limites de leur périmètre
              de compétence et ne pas effectuer d&apos;actes médicaux ou paramédicaux réservés à d&apos;autres professions réglementées.
            </p>
          </Article>

          <Article title="5. Assurance RC Pro">
            <p>
              L&apos;assurance Responsabilité Civile Professionnelle (RC Pro) est <strong>fortement recommandée</strong> pour
              tous les professionnels du réseau AXE et peut être exigée pour l&apos;accès à certains niveaux
              de certification du label AXE.
            </p>
          </Article>

          <Article title="6. Vérification des profils">
            <p>
              AXE vérifie les informations transmises par les professionnels lors de leur inscription
              (diplômes, certifications, assurance) mais ne peut garantir l&apos;exactitude absolue
              de toutes les informations à tout moment. Signalez toute anomalie à l&apos;adresse contact@axe.fr.
            </p>
          </Article>

          <Article title="7. Données personnelles">
            <p>
              Les données collectées sont utilisées exclusivement dans le cadre de la mise en relation.
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
              de vos données. Contactez contact@axe.fr pour exercer ces droits.
            </p>
          </Article>

          <Article title="8. Éditeur de la plateforme">
            <p className="text-axe-muted text-sm">
              AXE est une plateforme en cours de développement. Pour toute question : contact@axe.fr
            </p>
          </Article>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-xs text-axe-muted text-center">
          Document mis à jour le {new Date().toLocaleDateString("fr-FR")}
        </div>
      </div>
    </div>
  );
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="space-y-3">
      <h2 className="text-axe-white font-semibold text-lg">{title}</h2>
      <div className="text-axe-muted text-sm leading-relaxed space-y-2">{children}</div>
    </article>
  );
}
