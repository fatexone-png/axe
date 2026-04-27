import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGV & Mentions légales — GetAxe",
  description: "Conditions générales de vente, politique d'annulation et mentions légales de la plateforme GetAxe.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-axe-white mb-3">CGV & Mentions légales</h1>
          <p className="text-axe-muted text-sm">
            Conditions générales de vente, politique d&apos;annulation et mentions légales de la plateforme GetAxe.
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
          </p>
        </div>

        {/* ── Conditions Générales de Vente ── */}
        <div className="mb-12">
          <h2 className="text-axe-accent text-xs font-semibold uppercase tracking-wider mb-6">
            Conditions générales de vente
          </h2>
          <div className="space-y-8">

            <Article title="CGV 1. Objet et champ d'application">
              <p>
                Les présentes conditions générales de vente (CGV) régissent toute réservation de prestation de service
                effectuée via la plateforme GetAxe (<strong className="text-axe-white">getaxe.fr</strong>).
                Elles s&apos;appliquent entre le client (personne physique ou morale) et le professionnel prestataire,
                GetAxe intervenant en qualité d&apos;intermédiaire de mise en relation et de traitement du paiement.
              </p>
            </Article>

            <Article title="CGV 2. Prix et paiement">
              <p>
                Les prix affichés sont indiqués en euros TTC. Le paiement est sécurisé et traité par{" "}
                <strong className="text-axe-white">Stripe</strong>. En validant sa réservation, le client accepte
                d&apos;être débité du montant total de la prestation sélectionnée.
              </p>
              <p className="mt-2">
                GetAxe prélève une commission de <strong className="text-axe-white">8 %</strong> sur chaque transaction
                à titre de frais de service. Le professionnel perçoit 92 % du montant réglé par le client.
              </p>
            </Article>

            <Article title="CGV 3. Confirmation et libération du paiement">
              <p>
                Le paiement est encaissé immédiatement lors de la réservation. Il est maintenu en escrow
                jusqu&apos;à la confirmation de la séance par le client depuis son espace personnel.
                Le client dispose de <strong className="text-axe-white">7 jours</strong> après la date de séance
                pour confirmer. Passé ce délai, le paiement est automatiquement libéré au professionnel.
              </p>
            </Article>

            <Article title="CGV 4. Droit de rétractation">
              <p>
                Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation de 14 jours
                ne s&apos;applique <strong className="text-axe-white">pas</strong> aux prestations de services
                pleinement exécutées avant la fin du délai de rétractation, dès lors que le consommateur a expressément
                renoncé à son droit de rétractation.
              </p>
              <p className="mt-2">
                En confirmant sa réservation, le client reconnaît que la prestation peut être exécutée avant
                l&apos;expiration du délai de 14 jours et renonce expressément à son droit de rétractation
                pour les séances réalisées dans ce délai.
              </p>
            </Article>

            <Article title="CGV 5. Politique d'annulation">
              <p>
                Les conditions d&apos;annulation sont définies par chaque professionnel et affichées sur sa page.
                En l&apos;absence de politique spécifique, le remboursement intégral est accordé quelle que soit
                la date d&apos;annulation.
              </p>
              <p className="mt-2">
                En cas d&apos;annulation par le professionnel, le client est remboursé à 100 % et peut se voir
                proposer un code promo de compensation.
              </p>
              <p className="mt-2">
                Les remboursements sont traités par Stripe et crédités sous{" "}
                <strong className="text-axe-white">5 à 10 jours ouvrés</strong>.
              </p>
            </Article>

            <Article title="CGV 6. Responsabilité de GetAxe">
              <p>
                GetAxe est un intermédiaire de mise en relation. Sa responsabilité est limitée au bon fonctionnement
                de la plateforme technique (réservation, paiement, facturation).
                GetAxe ne peut être tenu responsable de l&apos;inexécution ou de la mauvaise exécution d&apos;une prestation
                par un professionnel.
              </p>
            </Article>

            <Article title="CGV 7. Litiges">
              <p>
                En cas de litige, le client peut contacter GetAxe à{" "}
                <strong className="text-axe-white">contact@getaxe.fr</strong>.
                À défaut de résolution amiable, le litige relève de la compétence des tribunaux français.
              </p>
              <p className="mt-2">
                Conformément à l&apos;ordonnance n° 2015-1033 du 20 août 2015, le client peut recourir gratuitement
                à un médiateur de la consommation.
              </p>
            </Article>

          </div>
        </div>

        <hr className="border-white/5 mb-12" />

        {/* ── Mentions importantes ── */}
        <div className="mb-12">
          <h2 className="text-axe-accent text-xs font-semibold uppercase tracking-wider mb-6">
            Mentions importantes
          </h2>
          <div className="space-y-8">

            <Article title="1. Nature du service">
              <p>
                GetAxe est une plateforme de <strong>mise en relation</strong> entre des clients et des professionnels
                du corps, du sport et de la santé préventive. GetAxe n&apos;est pas un établissement de santé,
                ne délivre pas de diagnostics médicaux et ne fournit pas de prescriptions.
              </p>
            </Article>

            <Article title="2. Urgences médicales">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 font-semibold mb-2">⚠ En cas d&apos;urgence médicale</p>
                <p className="text-red-300 text-sm">
                  GetAxe ne remplace en aucun cas une consultation médicale d&apos;urgence.
                  Si vous êtes en situation d&apos;urgence, appelez immédiatement le{" "}
                  <strong>15 (SAMU)</strong> ou le <strong>112 (numéro d&apos;urgence européen)</strong>.
                </p>
              </div>
            </Article>

            <Article title="3. Responsabilité des professionnels">
              <p>
                Chaque professionnel référencé sur GetAxe est entièrement responsable de ses actes,
                de ses recommandations et de l&apos;exercice de son activité. GetAxe ne peut être tenu responsable
                des préjudices résultant d&apos;une prestation réalisée par un professionnel du réseau.
              </p>
            </Article>

            <Article title="4. Déontologie et périmètre de compétence">
              <p>
                Les professionnels de santé inscrits sur GetAxe (kinésithérapeutes, ostéopathes, médecins du sport)
                sont tenus de respecter leur code de déontologie et les règles de leur ordre professionnel.
              </p>
              <p className="mt-3">
                Les coachs sportifs et préparateurs physiques doivent exercer dans les limites de leur périmètre
                de compétence et ne pas effectuer d&apos;actes médicaux ou paramédicaux réservés à d&apos;autres
                professions réglementées.
              </p>
            </Article>

            <Article title="5. Assurance RC Pro">
              <p>
                L&apos;assurance Responsabilité Civile Professionnelle (RC Pro) est{" "}
                <strong>fortement recommandée</strong> pour tous les professionnels du réseau GetAxe et peut être
                exigée pour l&apos;accès à certains niveaux de certification du label GetAxe.
              </p>
            </Article>

            <Article title="6. Vérification des profils">
              <p>
                GetAxe vérifie les informations transmises par les professionnels lors de leur inscription
                (diplômes, certifications, assurance) mais ne peut garantir l&apos;exactitude absolue de toutes
                les informations à tout moment. Signalez toute anomalie à{" "}
                <strong className="text-axe-white">contact@getaxe.fr</strong>.
              </p>
            </Article>

            <Article title="7. Données personnelles">
              <p>
                Les données collectées sont utilisées exclusivement dans le cadre de la mise en relation.
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
                de vos données. Contactez <strong className="text-axe-white">contact@getaxe.fr</strong> pour
                exercer ces droits.
              </p>
            </Article>

            <Article title="8. Éditeur de la plateforme">
              <p>
                GetAxe est une plateforme en cours de développement.
                Pour toute question : <strong className="text-axe-white">contact@getaxe.fr</strong>
              </p>
            </Article>

          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-xs text-axe-muted text-center">
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
