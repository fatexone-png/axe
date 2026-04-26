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
  const [clientOpen, setClientOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  function closeAll() {
    setMenuOpen(false);
    setClientOpen(false);
    setProOpen(false);
  }

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ top: 64 }}
          onClick={closeAll}
          aria-hidden="true"
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-axe-black/96 backdrop-blur-md border-b border-white/5">

        {/* Barre principale */}
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" onClick={closeAll} className="text-axe-white font-bold text-xl tracking-tight">
            {APP_NAME}
          </Link>

          {/* Burger — toutes tailles d'ecran */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="block w-5 h-0.5 bg-white rounded-sm" style={{ transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none", transition: "transform 0.2s" }} />
            <span className="block w-5 h-0.5 bg-white rounded-sm" style={{ opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span className="block w-5 h-0.5 bg-white rounded-sm" style={{ transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none", transition: "transform 0.2s" }} />
          </button>
        </div>

        {/* Menu deroulant */}
        {menuOpen && (
          <div className="bg-axe-dark border-t border-white/5">
            <div className="max-w-6xl mx-auto px-4 py-4 grid md:grid-cols-2 gap-3">

              {/* ── PARTICULIER ── */}
              <div>
                <button
                  type="button"
                  onClick={() => { setClientOpen(!clientOpen); setProOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-axe-accent/10 border border-axe-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-axe-accent font-bold text-xs">P</span>
                    </div>
                    <div className="text-left">
                      <p className="text-axe-white font-semibold text-sm">Je suis un particulier</p>
                      <p className="text-axe-muted text-xs">Je cherche un expert</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-axe-muted flex-shrink-0"
                    style={{ transform: clientOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {clientOpen && (
                  <div className="mt-1 ml-4 pl-7 border-l border-white/5 space-y-1 pb-2">
                    <Link href="/demande" onClick={closeAll}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-axe-accent/10 border border-axe-accent/20 hover:bg-axe-accent/20 transition-colors">
                      <span className="text-axe-white font-semibold text-sm">Trouver un expert</span>
                      <span className="text-axe-accent text-sm font-bold">&#8594;</span>
                    </Link>
                    <Link href="/annuaire" onClick={closeAll}
                      className="block px-3 py-2 rounded-lg text-axe-muted hover:text-axe-white hover:bg-white/5 transition-colors text-sm">
                      Annuaire des professionnels
                    </Link>
                    <Link href="/guide" onClick={closeAll}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-axe-muted hover:text-axe-white hover:bg-white/5 transition-colors text-sm">
                      <span>Guide IA</span>
                      <span className="text-xs font-bold bg-axe-accent text-axe-black px-1.5 py-0.5 rounded-md leading-none">IA</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ── PROFESSIONNEL ── */}
              <div>
                <button
                  type="button"
                  onClick={() => { setProOpen(!proOpen); setClientOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-axe-charcoal border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-axe-muted font-bold text-xs">&#9733;</span>
                    </div>
                    <div className="text-left">
                      <p className="text-axe-white font-semibold text-sm">Je suis un professionnel</p>
                      <p className="text-axe-muted text-xs">Rejoindre le r&#233;seau AXE</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-axe-muted flex-shrink-0"
                    style={{ transform: proOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {proOpen && (
                  <div className="mt-1 ml-4 pl-7 border-l border-white/5 space-y-1 pb-2">
                    <Link href="/pro" onClick={closeAll}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-colors">
                      <span className="text-axe-white font-semibold text-sm">S&#39;inscrire</span>
                      <span className="text-axe-muted text-sm font-bold">&#8594;</span>
                    </Link>
                    <Link href="/login" onClick={closeAll}
                      className="block px-3 py-2 rounded-lg text-axe-muted hover:text-axe-white hover:bg-white/5 transition-colors text-sm">
                      Se connecter
                    </Link>
                    <Link href="/devenir-pro" onClick={closeAll}
                      className="block px-3 py-2 rounded-lg text-axe-muted hover:text-axe-white hover:bg-white/5 transition-colors text-sm">
                      Pas encore&#160;&#100;&#105;&#112;&#108;&#244;&#109;&#233;&#160;? Trouver ma formation
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Auth si connecte */}
            {user && (
              <div className="border-t border-white/5 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {isAdmin(user) && (
                      <Link href="/admin" onClick={closeAll}
                        className="text-axe-accent text-sm font-medium">
                        Admin
                      </Link>
                    )}
                    <Link href="/dashboard" onClick={closeAll}
                      className="text-axe-muted hover:text-axe-white text-sm">
                      Mon espace
                    </Link>
                  </div>
                  <button type="button"
                    onClick={() => { signOut(); closeAll(); }}
                    className="text-xs bg-axe-charcoal text-axe-muted px-3 py-1.5 rounded-lg hover:bg-axe-grey border border-white/5">
                    D&#233;connexion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
