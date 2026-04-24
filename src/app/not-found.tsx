import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-axe-black flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        <p className="text-8xl font-black text-axe-accent leading-none mb-6">404</p>
        <h1 className="text-2xl font-bold text-axe-white mb-3">Page introuvable</h1>
        <p className="text-axe-muted mb-10">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>

        <Link
          href="/"
          className="inline-block bg-axe-accent text-axe-black font-semibold px-6 py-3 rounded-lg hover:bg-axe-accentDark transition-colors mb-8"
        >
          ← Retour à l&apos;accueil
        </Link>

        <div className="flex items-center justify-center gap-6 text-sm">
          <Link href="/annuaire" className="text-axe-muted hover:text-axe-white transition-colors">
            Trouver un pro
          </Link>
          <span className="text-axe-grey">·</span>
          <Link href="/guide" className="text-axe-muted hover:text-axe-white transition-colors flex items-center gap-1">
            Guide IA
            <span className="text-[10px] font-bold bg-axe-accent text-axe-black px-1.5 py-0.5 rounded-md leading-none">
              IA
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
