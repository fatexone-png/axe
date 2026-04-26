"use client";

import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-20 px-4">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Success badge */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="text-green-400 text-2xl font-bold leading-none">OK</span>
          </div>
          <h1 className="text-3xl font-bold text-axe-white">Paiement confirmé</h1>
        </div>

        {/* Message card */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-3">
          <p className="text-axe-white text-sm leading-relaxed">
            Votre séance est réservée. Le professionnel a été notifié.
          </p>
          <p className="text-axe-muted text-sm leading-relaxed">
            Une fois la séance effectuée, confirmez-la depuis votre espace pour
            libérer le paiement.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/client"
            className="btn-primary w-full text-center block"
          >
            Voir mes réservations →
          </Link>
          <Link
            href="/annuaire"
            className="btn-secondary w-full text-center block"
          >
            Explorer d&apos;autres professionnels
          </Link>
        </div>

      </div>
    </div>
  );
}
