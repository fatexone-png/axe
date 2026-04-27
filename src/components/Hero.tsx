import Link from "next/link";
import { APP_TAGLINE } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="min-h-screen bg-axe-black flex flex-col items-center justify-center px-4 pt-20 pb-12">
      <div className="max-w-4xl mx-auto w-full text-center">

        {/* Badge */}
        <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase mb-6 px-3 py-1 border border-axe-accent/30 rounded-full">
          Plateforme premium · Corps · Sport · Santé
        </span>

        {/* Titre */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-axe-white leading-tight mb-4 whitespace-pre-line">
          {APP_TAGLINE}
        </h1>

        <p className="text-axe-muted text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Coachs, kinés, ostéopathes, médecins du sport — vérifiés, assurés, disponibles partout en France.
        </p>

        {/* Deux portes d'entrée */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">

          {/* Porte CLIENT */}
          <div className="bg-axe-accent/5 border border-axe-accent/30 rounded-2xl p-5 sm:p-6 text-left space-y-4 hover:border-axe-accent/60 transition-colors">
            <div>
              <p className="text-xs font-bold tracking-widest text-axe-accent uppercase mb-2">
                Je cherche un expert
              </p>
              <p className="text-axe-white font-semibold text-base sm:text-lg leading-snug">
                Coach, kiné, ostéo,<br className="hidden sm:block" /> médecin du sport
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-axe-muted">
              <li className="flex items-center gap-2">
                <span className="text-axe-accent text-xs flex-shrink-0">✓</span>
                Professionnels vérifiés et assurés
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-accent text-xs flex-shrink-0">✓</span>
                Mise en relation en 48h
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-accent text-xs flex-shrink-0">✓</span>
                Partout en France, à domicile ou en ligne
              </li>
            </ul>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/annuaire"
                className="block w-full text-center bg-axe-accent text-axe-black font-bold py-3 rounded-xl hover:bg-axe-accentDark transition-colors text-sm shadow-[0_0_20px_rgba(200,255,0,0.2)]"
              >
                Parcourir l&apos;annuaire →
              </Link>
              <Link
                href="/demande"
                className="block w-full text-center text-axe-accent/80 border border-axe-accent/30 py-2.5 rounded-xl hover:text-axe-accent hover:border-axe-accent/60 transition-colors text-sm"
              >
                Déposer ma demande
              </Link>
            </div>
          </div>

          {/* Porte PRO */}
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 sm:p-6 text-left space-y-4 hover:border-white/15 transition-colors">
            <div>
              <p className="text-xs font-bold tracking-widest text-axe-muted uppercase mb-2">
                Je suis professionnel
              </p>
              <p className="text-axe-white font-semibold text-base sm:text-lg leading-snug">
                Trouvez des clients,<br className="hidden sm:block" /> protégez votre activité
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-axe-muted">
              <li className="flex items-center gap-2">
                <span className="text-axe-muted text-xs flex-shrink-0">→</span>
                Profil vérifié visible par des milliers de clients
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-muted text-xs flex-shrink-0">→</span>
                Facturation, RC Pro, Guide IA — 100% gratuit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-muted text-xs flex-shrink-0">→</span>
                8% uniquement quand vous encaissez
              </li>
            </ul>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/pro"
                className="block w-full text-center bg-axe-dark border border-white/10 text-axe-white font-semibold py-3 rounded-xl hover:bg-axe-grey hover:border-white/20 transition-colors text-sm"
              >
                Créer mon profil pro →
              </Link>
              <Link
                href="/login"
                className="block w-full text-center text-axe-white border border-white/20 py-2.5 rounded-xl hover:border-white/40 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Déjà inscrit ? Se connecter
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-axe-muted/40 max-w-sm mx-auto leading-relaxed">
          GetAxe ne remplace pas une consultation médicale d&apos;urgence.
          En cas d&apos;urgence, appelez le 15 ou le 112.
        </p>

      </div>
    </section>
  );
}
