"use client";

import { useState } from "react";
import { BookingStatus } from "@/lib/types";

interface SessionConfirmButtonProps {
  bookingId: string;
  status: BookingStatus;
}

export default function SessionConfirmButton({
  bookingId,
  status,
}: SessionConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
        return;
      }
      setConfirmed(true);
    } catch {
      setError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setConfirming(false);
    }
  }

  if (status === "released" || confirmed) {
    return (
      <p className="text-green-400 text-sm font-semibold">
        Séance confirmée — paiement versé
      </p>
    );
  }

  if (status === "session_confirmed") {
    return (
      <p className="text-axe-muted text-sm">Confirmation en cours…</p>
    );
  }

  if (status === "paid") {
    return (
      <div className="space-y-3">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming
            ? "Confirmation…"
            : "Confirmer que la séance a eu lieu →"}
        </button>
        {confirmed && (
          <p className="text-green-400 text-sm font-semibold">
            Séance confirmée. Le paiement a été libéré.
          </p>
        )}
      </div>
    );
  }

  return null;
}
