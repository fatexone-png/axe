"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getBookingsByClient } from "@/lib/firestore";
import { Booking, BookingStatus } from "@/lib/types";
import Link from "next/link";
import MessagingPanel from "@/components/MessagingPanel";

// ─── Labels & couleurs ────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée — à confirmer",
  session_confirmed: "En cours de confirmation",
  released: "Terminée",
  cancelled: "Annulée",
  disputed: "Litige",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending_payment: "bg-white/5 text-axe-muted",
  paid: "bg-axe-amber/10 text-axe-amber",
  session_confirmed: "bg-blue-500/10 text-blue-400",
  released: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  disputed: "bg-orange-500/10 text-orange-400",
};

function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const [cancelPanelId, setCancelPanelId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelResults, setCancelResults] = useState<Record<string, { refundEuros: number; promoCode?: string }>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      try {
        setBookings(await getBookingsByClient(u.email!));
      } catch {
        // index building ou erreur réseau — liste vide
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  // ── Confirmer la séance ────────────────────────────────────────────────────

  async function handleConfirm(bookingId: string) {
    setConfirmingId(bookingId);
    try {
      const res = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, clientEmail: user?.email }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        alert(d.error ?? "Erreur lors de la confirmation.");
        return;
      }
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "released" } : b));
      setConfirmed((prev) => ({ ...prev, [bookingId]: true }));
    } finally {
      setConfirmingId(null);
    }
  }

  // ── Annuler la réservation ─────────────────────────────────────────────────

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, cancelledBy: "client", callerEmail: user?.email }),
      });
      const d = await res.json() as { refundAmountEuros?: number; promoCode?: string; error?: string };
      if (!res.ok) { alert(d.error ?? "Erreur lors de l'annulation."); return; }
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
      setCancelResults((prev) => ({ ...prev, [bookingId]: { refundEuros: d.refundAmountEuros ?? 0, promoCode: d.promoCode } }));
      setCancelPanelId(null);
    } finally {
      setCancellingId(null);
    }
  }

  // ── Supprimer le compte ────────────────────────────────────────────────────

  async function handleDeleteAccount() {
    if (!user) return;
    setDeletingAccount(true);
    try {
      await deleteUser(user);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("requires-recent-login")) {
        alert("Pour supprimer votre compte, veuillez vous reconnecter puis réessayer.");
        router.push("/login");
      } else {
        alert("Erreur lors de la suppression du compte. Contactez contact@getaxe.fr");
      }
    } finally {
      setDeletingAccount(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted">Chargement…</p>
      </div>
    );
  }

  const upcoming = bookings.filter((b) =>
    b.status === "pending_payment" || b.status === "paid" || b.status === "session_confirmed"
  );
  const past = bookings.filter((b) =>
    b.status === "released" || b.status === "cancelled" || b.status === "disputed"
  );

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-axe-white mb-1">Mon espace</h1>
          <p className="text-axe-muted text-sm">{user?.email}</p>
        </div>

        {/* ── Séances à venir ── */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">
            Mes séances
          </h2>

          {upcoming.length === 0 ? (
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-10 text-center space-y-4">
              <p className="text-axe-muted text-sm">Aucune séance prévue pour l&apos;instant.</p>
              <Link href="/annuaire" className="btn-primary inline-block">
                Trouver un professionnel →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((b) => {
                const bid = b.id!;
                const isConfirming = confirmingId === bid;
                const isConfirmed = confirmed[bid];
                const cancelResult = cancelResults[bid];
                const showCancelPanel = cancelPanelId === bid;
                const isCancellingThis = cancellingId === bid;
                const cancellable = b.status === "paid";

                return (
                  <div key={bid} className="bg-axe-charcoal border border-white/5 rounded-2xl overflow-hidden">

                    {/* Résumé de la réservation */}
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-axe-white font-semibold text-sm">{b.sessionType}</p>
                        <p className="text-axe-muted text-xs mt-0.5">{b.proEmail}</p>
                        <p className="text-axe-muted text-xs mt-0.5">
                          {fmtDate(b.sessionDate)}
                          {b.slotTime && <> à {b.slotTime}</>}
                          {b.sessionLocation && <> · {b.sessionLocation}</>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-axe-white font-bold text-sm">{b.amountEuros}&nbsp;€</p>
                        <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </div>
                    </div>

                    {/* Zone d'actions — séance payée, pas encore confirmée */}
                    {b.status === "paid" && !isConfirmed && !cancelResult && (
                      <div className="border-t border-white/5 bg-axe-black/30 px-5 py-4 space-y-3">
                        <p className="text-axe-muted text-xs leading-relaxed">
                          La séance a eu lieu ? Confirmez-la pour libérer le paiement au professionnel.
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleConfirm(bid)}
                            disabled={isConfirming || isCancellingThis}
                            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isConfirming ? "Confirmation…" : "Confirmer la séance ✓"}
                          </button>
                          {cancellable && (
                            <button
                              onClick={() => setCancelPanelId(showCancelPanel ? null : bid)}
                              disabled={isConfirming}
                              className="text-xs text-axe-muted hover:text-red-400 transition-colors"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Panneau de confirmation d'annulation */}
                    {showCancelPanel && !cancelResult && (
                      <div className="border-t border-red-500/10 bg-red-500/5 px-5 py-4 space-y-3">
                        <p className="text-axe-white text-sm font-semibold">Confirmer l&apos;annulation ?</p>
                        <p className="text-axe-muted text-xs leading-relaxed">
                          Le remboursement dépend de la politique d&apos;annulation du professionnel et du délai restant avant la séance.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCancel(bid)}
                            disabled={isCancellingThis}
                            className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isCancellingThis ? "Annulation…" : "Confirmer l'annulation"}
                          </button>
                          <button
                            onClick={() => setCancelPanelId(null)}
                            className="px-4 py-2 rounded-xl bg-white/5 text-axe-muted text-xs hover:bg-white/10 transition-colors"
                          >
                            Retour
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Résultat après confirmation */}
                    {isConfirmed && (
                      <div className="border-t border-green-500/10 bg-green-500/5 px-5 py-3">
                        <p className="text-green-400 text-xs font-semibold">
                          Séance confirmée — paiement libéré au professionnel. Merci !
                        </p>
                      </div>
                    )}

                    {/* Résultat après annulation */}
                    {cancelResult && (
                      <div className="border-t border-white/5 bg-axe-black/30 px-5 py-3 space-y-1">
                        <p className="text-axe-white text-xs font-semibold">
                          Annulation effectuée — {cancelResult.refundEuros}&nbsp;€ remboursés.
                        </p>
                        {cancelResult.promoCode && (
                          <p className="text-axe-muted text-xs">
                            Code promo offert par le professionnel&nbsp;:&nbsp;
                            <span className="font-mono font-bold text-axe-accent bg-axe-black/50 px-2 py-0.5 rounded">
                              {cancelResult.promoCode}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Historique ── */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">
              Historique
            </h2>
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {past.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-axe-white text-sm font-semibold truncate">{b.sessionType}</p>
                    <p className="text-axe-muted text-xs">{b.proEmail} · {fmtDate(b.sessionDate)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-axe-white text-sm font-bold">{b.amountEuros}&nbsp;€</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {user && (
          <div>
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">Messages</h2>
            <MessagingPanel userEmail={user.email!} role="client" userName={user.displayName ?? user.email!} />
          </div>
        )}

        {/* ── RGPD : suppression du compte ── */}
        <div className="mt-16 pt-8 border-t border-white/5">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
            >
              Supprimer mon compte (RGPD)
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
              <p className="text-red-400 font-semibold text-sm">Supprimer définitivement mon compte</p>
              <p className="text-axe-muted text-xs leading-relaxed">
                Cette action est irréversible. Votre compte Firebase sera supprimé immédiatement.
                Vos données personnelles seront effacées dans un délai de 30 jours conformément au RGPD.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-axe-charcoal border border-white/10 text-axe-muted text-sm py-2.5 rounded-xl hover:text-axe-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 text-sm py-2.5 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {deletingAccount ? "Suppression…" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
