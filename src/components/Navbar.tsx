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
        <Link href="/" className="text-axe-white font-bold text-xl tracking-tight">
          {APP_NAME}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/annuaire" className="text-axe-muted hover:text-axe-white transition-colors">
            Annuaire
          </Link>
          <Link href="/guide" className="text-axe-muted hover:text-axe-white transition-colors flex items-center gap-1">
            Guide IA <span className="text-[10px] font-bold bg-axe-accent text-axe-black px-1.5 py-0.5 rounded-md leading-none">IA</span>
          </Link>
          <Link href="/devenir-pro" className="text-axe-muted hover:text-axe-white transition-colors">
            Devenir pro
          </Link>
          <Link href="/demande" className="text-axe-muted hover:text-axe-white transition-colors">
            Faire une demande
          </Link>
          <Link href="/pro" className="text-axe-muted hover:text-axe-white transition-colors">
            Rejoindre le réseau
          </Link>
          {user && isAdmin(user) && (
            <Link href="/admin" className="text-axe-accent hover:text-axe-accentDark transition-colors font-medium">
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-axe-muted hover:text-axe-white transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs bg-axe-charcoal text-axe-muted px-3 py-1.5 rounded-lg hover:bg-axe-grey transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-axe-accent text-axe-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-axe-accentDark transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-axe-muted p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-axe-dark border-t border-white/5 px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/annuaire" onClick={() => setMenuOpen(false)} className="text-axe-muted hover:text-axe-white">
            Annuaire
          </Link>
          <Link href="/guide" onClick={() => setMenuOpen(false)} className="text-axe-muted hover:text-axe-white flex items-center gap-1">
            Guide IA <span className="text-[10px] font-bold bg-axe-accent text-axe-black px-1.5 py-0.5 rounded-md leading-none">IA</span>
          </Link>
          <Link href="/devenir-pro" onClick={() => setMenuOpen(false)} className="text-axe-muted hover:text-axe-white">
            Devenir pro
          </Link>
          <Link href="/demande" onClick={() => setMenuOpen(false)} className="text-axe-muted hover:text-axe-white">
            Faire une demande
          </Link>
          <Link href="/pro" onClick={() => setMenuOpen(false)} className="text-axe-muted hover:text-axe-white">
            Rejoindre le réseau
          </Link>
          {user && isAdmin(user) && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-axe-accent font-medium">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-axe-muted hover:text-axe-white">
                Dashboard
              </Link>
              <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-left text-axe-muted hover:text-axe-white">
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-axe-accent font-semibold">
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
