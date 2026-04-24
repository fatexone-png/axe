import Link from "next/link";
import { APP_TAGLINE } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="min-h-screen bg-axe-black flex flex-col items-center justify-center text-center px-4 pt-16">
      <div className="max-w-3xl mx-auto">
        <span className="inline-block text-xs font-semibold tracking-widest text-axe-accent uppercase mb-6 px-3 py-1 border border-axe-accent/30 rounded-full">
          Plateforme premium · Corps · Sport · Santé
        </span>

        <h1 className="text-4xl md:text-6xl font-bold text-axe-white leading-tight mb-6 whitespace-pre-line">
          {APP_TAGLINE}
        </h1>

        <p className="text-axe-muted text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Coachs, kinés, ostéopathes, médecins du sport — vérifiés, assurés,
          disponibles. La mise en relation en 48h, sans intermédiaire.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demande"
            className="bg-axe-accent text-axe-black font-bold px-8 py-4 rounded-xl hover:bg-axe-accentDark transition-colors text-base"
          >
            Trouver mon expert →
          </Link>
          <Link
            href="/annuaire"
            className="bg-axe-charcoal text-axe-white font-semibold px-8 py-4 rounded-xl hover:bg-axe-grey transition-colors text-base border border-white/10"
          >
            Parcourir l&apos;annuaire
          </Link>
        </div>

        <p className="mt-12 text-xs text-axe-muted/60 max-w-sm mx-auto">
          Professionnel du sport ?{" "}
          <Link href="/pro" className="text-axe-accent hover:underline">
            Rejoignez le réseau AXE →
          </Link>
        </p>
      </div>
    </section>
  );
}
