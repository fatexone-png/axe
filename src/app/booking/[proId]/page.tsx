"use client";

import { useEffect, useState, FormEvent } from "react";
import { getProfessionalById } from "@/lib/firestore";
import { Professional } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";

interface BookingPageProps {
  params: { proId: string };
}

const FALLBACK_SESSION_TYPES = [
  { name: "Séance individuelle", durationMinutes: 60, priceEuros: 60 },
  { name: "Bilan initial",       durationMinutes: 90, priceEuros: 90 },
  { name: "Suivi régulier",      durationMinutes: 60, priceEuros: 60 },
  { name: "Séance à domicile",   durationMinutes: 60, priceEuros: 80 },
];

export default function BookingPage({ params }: BookingPageProps) {
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coordonnées personnelles
  const [clientName, setClientName]   = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Séance
  const [sessionDate, setSessionDate]     = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Facturation entreprise
  const [invoiceTo, setInvoiceTo]             = useState<"personal" | "company">("personal");
  const [companyName, setCompanyName]         = useState("");
  const [companySiret, setCompanySiret]       = useState("");
  const [companyVatNumber, setCompanyVatNumber] = useState("");
  const [companyAddress, setCompanyAddress]   = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function fetchPro() {
      try {
        const data = await getProfessionalById(params.proId);
        setPro(data);
      } catch {
        setPro(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPro();
  }, [params.proId]);

  const services =
    pro?.services && pro.services.length > 0 ? pro.services : FALLBACK_SESSION_TYPES;

  const selected   = services[selectedIndex] ?? services[0];
  const amount     = selected.priceEuros;
  const proAmount  = Math.round(amount * 0.85);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pro?.id) return;

    if (invoiceTo === "company" && !companyName.trim()) {
      setError("Veuillez renseigner le nom de l'entreprise.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proId: pro.id,
          proStripeAccountId: pro.stripeAccountId,
          clientName,
          clientEmail,
          clientPhone,
          sessionType: selected.name,
          sessionDate,
          amountCents: Math.round(amount * 100),
          // B2B
          invoiceTo,
          ...(invoiceTo === "company" && {
            companyName:      companyName.trim(),
            companySiret:     companySiret.trim(),
            companyVatNumber: companyVatNumber.trim(),
            companyAddress:   companyAddress.trim(),
          }),
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted text-sm">Chargement…</p>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-axe-black flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-axe-white text-xl font-semibold">Professionnel introuvable</p>
        <p className="text-axe-muted text-sm text-center max-w-sm">
          Ce profil n&apos;existe pas ou n&apos;est plus disponible.
        </p>
      </div>
    );
  }

  const stripeReady = pro.stripeAccountId && pro.stripeAccountStatus === "active";

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-20 px-4">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Titre */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-axe-white">Réserver une séance</h1>
          <p className="text-axe-muted text-sm">
            avec <span className="text-axe-white font-semibold">{pro.firstName} {pro.lastName}</span>
            {" "}—{" "}{PROFESSION_LABELS[pro.profession] ?? pro.profession}{" "}·{" "}{pro.city}
          </p>
        </div>

        {!stripeReady && (
          <div className="bg-axe-charcoal border border-white/10 rounded-2xl p-6 space-y-2">
            <p className="text-axe-white font-semibold">Paiement en ligne non disponible</p>
            <p className="text-axe-muted text-sm leading-relaxed">
              Ce professionnel n&apos;a pas encore configuré ses paiements. Contactez-le directement.
            </p>
          </div>
        )}

        {stripeReady && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Résumé pro */}
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-1">
              <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider mb-3">Professionnel</p>
              <p className="text-axe-white font-bold">{pro.firstName} {pro.lastName}</p>
              <p className="text-axe-accent text-sm">{PROFESSION_LABELS[pro.profession] ?? pro.profession}</p>
              <p className="text-axe-muted text-xs">{pro.city}</p>
            </div>

            {/* Coordonnées personnelles */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Vos coordonnées</p>

              <div className="space-y-1">
                <label className="text-axe-muted text-xs" htmlFor="clientName">Nom complet *</label>
                <input id="clientName" type="text" className="input" placeholder="Jean Dupont"
                  value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-axe-muted text-xs" htmlFor="clientEmail">Adresse e-mail *</label>
                <input id="clientEmail" type="email" className="input" placeholder="jean@exemple.fr"
                  value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-axe-muted text-xs" htmlFor="clientPhone">Téléphone *</label>
                <input id="clientPhone" type="tel" className="input" placeholder="06 12 34 56 78"
                  value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
              </div>
            </div>

            {/* Toggle facturation */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Facturation</p>

              <div className="flex gap-2">
                {(["personal", "company"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInvoiceTo(type)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      invoiceTo === type
                        ? "bg-axe-accent text-axe-black border-axe-accent"
                        : "bg-axe-black/40 text-axe-muted border-white/10 hover:border-white/20"
                    }`}
                  >
                    {type === "personal" ? "Particulier" : "Entreprise"}
                  </button>
                ))}
              </div>

              {/* Champs entreprise */}
              {invoiceTo === "company" && (
                <div className="space-y-3 bg-axe-charcoal border border-axe-accent/20 rounded-2xl p-4">
                  <p className="text-axe-accent text-xs font-semibold uppercase tracking-wider">
                    Informations entreprise
                  </p>
                  <p className="text-axe-muted text-xs leading-relaxed">
                    La facture sera établie au nom de votre entreprise. Ces informations apparaîtront sur la facture remise par le praticien.
                  </p>

                  <div className="space-y-1">
                    <label className="text-axe-muted text-xs">Raison sociale *</label>
                    <input type="text" className="input" placeholder="Acme SAS"
                      value={companyName} onChange={(e) => setCompanyName(e.target.value)} required={invoiceTo === "company"} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-axe-muted text-xs">SIRET</label>
                      <input type="text" className="input" placeholder="123 456 789 00010"
                        value={companySiret} onChange={(e) => setCompanySiret(e.target.value)}
                        maxLength={17} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-axe-muted text-xs">N° TVA intracommunautaire</label>
                      <input type="text" className="input" placeholder="FR12 345678901"
                        value={companyVatNumber} onChange={(e) => setCompanyVatNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-axe-muted text-xs">Adresse de facturation</label>
                    <input type="text" className="input" placeholder="12 rue de la Paix, 75001 Paris"
                      value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                  </div>

                  <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl px-3 py-2">
                    <span className="text-blue-400 text-xs mt-0.5">ℹ</span>
                    <p className="text-blue-400 text-xs leading-relaxed">
                      Transaction B2B — soumise à la réforme de facturation électronique à partir de 2026–2028 selon la taille de votre entreprise.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Détails séance */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Détails de la séance</p>

              <div className="space-y-2">
                <label className="text-axe-muted text-xs">Type de séance *</label>
                <div className="space-y-2">
                  {services.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedIndex(i)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors ${
                        selectedIndex === i
                          ? "border-axe-accent bg-axe-accent/5 text-axe-white"
                          : "border-white/10 bg-axe-black/40 text-axe-muted hover:border-white/20"
                      }`}
                    >
                      <span className="font-semibold">{s.name}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-axe-muted text-xs">{s.durationMinutes} min</span>
                        <span className={`font-bold ${selectedIndex === i ? "text-axe-accent" : "text-axe-muted"}`}>
                          {s.priceEuros} €
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-axe-muted text-xs" htmlFor="sessionDate">Date souhaitée *</label>
                <input id="sessionDate" type="date" className="input" min={today}
                  value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required />
              </div>

              {/* Récap prix */}
              <div className="bg-axe-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-axe-muted text-xs">Montant total</p>
                  <p className="text-axe-white font-bold text-lg">{amount} €</p>
                </div>
                <div className="text-right">
                  <p className="text-axe-muted text-xs">Reversé au praticien</p>
                  <p className="text-axe-accent font-bold text-lg">{proAmount} €</p>
                </div>
              </div>
              <p className="text-axe-muted text-xs text-center">15% de commission AXE inclus dans le montant total.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Redirection vers le paiement…" : `Payer ${amount} € →`}
            </button>

            <p className="text-axe-muted text-xs text-center">
              Paiement sécurisé via Stripe. Votre séance sera confirmée après le paiement.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
