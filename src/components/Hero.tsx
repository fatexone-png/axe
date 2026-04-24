import Link from "next/link";
import { APP_TAGLINE } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="min-h-screen bg-axe-black flex flex-col items-center justify-center px-4 pt-16">
      <div className="max-w-4xl mx-auto w-full text-center">

        {/* Badge */}
        <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase mb-6 px-3 py-1 border border-axe-accent/30 rounded-full">
          Plateforme premium · Corps · Sport · Santé
        </span>

        {/* Titre */}
        <h1 className="text-4xl md:text-6xl font-bold text-axe-white leading-tight mb-5 whitespace-pre-line">
          {APP_TAGLINE}
        </h1>

        <p className="text-axe-muted text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Coachs, kinés, ostéopathes, médecins du sport — vérifiés, assurés, disponibles partout en France.
        </p>

        {/* Deux portes d'entrée */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">

          {/* Porte CLIENT */}
          <div className="bg-axe-accent/5 border border-axe-accent/30 rounded-2xl p-6 text-left space-y-4 hover:border-axe-accent/60 transition-colors group">
            <div>
              <p className="text-xs font-bold tracking-widest text-axe-accent uppercase mb-2">
                Je cherche un expert
              </p>
              <p className="text-axe-white font-semibold text-lg leading-snug">
                Coach, kiné, ostéo, médecin du sport
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-axe-muted">
              <li className="flex items-center gap-2">
                <span className="text-axe-accent text-xs">✓</span> Professionnels vérifiés et assurés
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-accent text-xs">✓</span> Mise en relation en 48h
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-accent text-xs">✓</span> Partout en France, à domicile ou en ligne
              </li>
            </ul>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/demande"
                className="block w-full text-center bg-axe-accent text-axe-black font-bold py-3 rounded-xl hover:bg-axe-accentDark transition-colors text-sm"
              >
                Déposer ma demande →
              </Link>
              <Link
                href="/annuaire"
                className="block w-full text-center bg-transparent text-axe-muted border border-white/10 py-2.5 rounded-xl hover:text-axe-white hover:border-white/20 transition-colors text-sm"
              >
                Parcourir l&apos;annuaire
              </Link>
            </div>
          </div>

          {/* Porte PRO */}
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 text-left space-y-4 hover:border-white/15 transition-colors group">
            <div>
              <p className="text-xs font-bold tracking-widest text-axe-muted uppercase mb-2">
                Je suis professionnel
              </p>
              <p className="text-axe-white font-semibold text-lg leading-snug">
                Trouvez des clients, protégez votre activité
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-axe-muted">
              <li className="flex items-center gap-2">
                <span className="text-axe-muted text-xs">→</span> Profil vérifié visible par des milliers de clients
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-muted text-xs">→</span> RC Pro, mutuelle, retraite — tout en un
              </li>
              <li className="flex items-center gap-2">
                <span className="text-axe-muted text-xs">→</span> Facturation électronique 2026 ready
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
                href="/devenir-pro"
                className="block w-full text-center text-axe-muted text-sm py-2.5 hover:text-axe-white transition-colors"
              >
                Pas encore diplômé ? Trouver ma formation
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-xs text-axe-muted/50 max-w-sm mx-auto">
          AXE ne remplace pas une consultation médicale d&apos;urgence.
          En cas d&apos;urgence, appelez le 15 ou le 112.
        </p>

      </div>
    </section>
  );
}
