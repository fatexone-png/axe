"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut, isAdmin } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-axe-black/95 backdrop-blur border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-axe-white font-bold text-xl tracking-tight flex-shrink-0">
          {APP_NAME}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/annuaire" className="text-axe-muted hover:text-axe-white transition-colors">
            Annuaire
          </Link>

          {user && isAdmin(user) && (
            <Link href="/admin" className="text-axe-accent hover:text-axe-accentDark transition-colors font-medium">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link href="/dashboard" className="text-axe-muted hover:text-axe-white transition-colors">
                Mon espace
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs bg-axe-charcoal text-axe-muted px-3 py-1.5 rounded-lg hover:bg-axe-grey transition-colors border border-white/5"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* CTA Pro — discret */}
              <Link
                href="/pro"
                className="text-axe-muted hover:text-axe-white transition-colors text-sm border border-white/10 px-4 py-2 rounded-lg hover:border-white/20"
              >
                Je suis professionnel
              </Link>
              {/* CTA Client — accent */}
              <Link
                href="/demande"
                className="bg-axe-accent text-axe-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-axe-accentDark transition-colors"
              >
                Trouver un expert →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-axe-muted p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : "mb-1.5"}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : "mb-1.5"}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-axe-dark border-t border-white/5 px-4 py-5 flex flex-col gap-1 text-sm">

          {/* Séparateur client */}
          <p className="text-xs text-axe-muted/50 uppercase tracking-widest font-semibold mb-2">
            Je cherche un expert
          </p>
          <Link href="/demande" onClick={() => setMenuOpen(false)}
            className="bg-axe-accent text-axe-black font-bold px-4 py-3 rounded-xl text-center mb-3">
            Trouver un expert →
          </Link>
          <Link href="/annuaire" onClick={() => setMenuOpen(false)}
            className="text-axe-muted hover:text-axe-white py-2 px-1">
            Parcourir l&apos;annuaire
          </Link>

          {/* Séparateur pro */}
          <div className="border-t border-white/5 my-3" />
          <p className="text-xs text-axe-muted/50 uppercase tracking-widest font-semibold mb-2">
            Je suis professionnel
          </p>
          <Link href="/pro" onClick={() => setMenuOpen(false)}
            className="text-axe-muted hover:text-axe-white py-2 px-1">
            Rejoindre le réseau
          </Link>
          <Link href="/devenir-pro" onClick={() => setMenuOpen(false)}
            className="text-axe-muted hover:text-axe-white py-2 px-1">
            Devenir professionnel
          </Link>
          <Link href="/guide" onClick={() => setMenuOpen(false)}
            className="text-axe-muted hover:text-axe-white py-2 px-1 flex items-center gap-2">
            Guide IA
            <span className="text-[10px] font-bold bg-axe-accent text-axe-black px-1.5 py-0.5 rounded-md leading-none">IA</span>
          </Link>

          {/* Auth */}
          <div className="border-t border-white/5 my-3" />
          {user && isAdmin(user) && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
              className="text-axe-accent font-medium py-2 px-1">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="text-axe-muted hover:text-axe-white py-2 px-1">
                Mon espace
              </Link>
              <button onClick={() => { signOut(); setMenuOpen(false); }}
                className="text-left text-axe-muted hover:text-axe-white py-2 px-1">
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="text-axe-muted hover:text-axe-white py-2 px-1">
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
