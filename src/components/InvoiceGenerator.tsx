"use client";

import { useState } from "react";
import { ClientRequest, Professional, Invoice, LEGAL_STATUS_LABELS } from "@/lib/types";
import { createInvoice, generateInvoiceNumber } from "@/lib/firestore";
import InvoicePreview from "./InvoicePreview";

interface Props {
  request: ClientRequest;
  pro: Professional;
  onClose: () => void;
}

export default function InvoiceGenerator({ request, pro, onClose }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState(
    `Prestation de ${pro.profession === "coach" ? "coaching sportif" : pro.profession} — ${request.goal}`
  );
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  const vatRate = pro.vatExempt ? 0 : 20;
  const totalHT = quantity * unitPrice;
  const vatAmount = Math.round(totalHT * (vatRate / 100) * 100) / 100;
  const totalTTC = totalHT + vatAmount;

  const handlePreview = () => {
    if (!description || unitPrice <= 0) {
      setError("Veuillez renseigner la description et le montant.");
      return;
    }
    setError("");
    setInvoice({
      invoiceNumber: "AXE-XXXX",
      requestId: request.id!,
      professionalId: pro.id!,
      proFirstName: pro.firstName,
      proLastName: pro.lastName,
      proEmail: pro.email,
      proPhone: pro.phone,
      proCity: pro.city,
      proSiret: pro.siret,
      proLegalStatus: pro.legalStatus ? LEGAL_STATUS_LABELS[pro.legalStatus] : undefined,
      proVatNumber: pro.vatNumber,
      proVatExempt: pro.vatExempt,
      clientFirstName: request.firstName,
      clientLastName: request.lastName,
      clientEmail: request.email,
      clientCity: request.city,
      description,
      quantity,
      unitPrice,
      vatRate,
      vatAmount,
      totalHT,
      totalTTC,
      status: "draft",
      issuedAt: new Date().toISOString().split("T")[0],
      dueAt: dueDate,
      createdAt: new Date(),
    });
    setStep("preview");
  };

  const handleSave = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      const number = await generateInvoiceNumber();
      const final = { ...invoice, invoiceNumber: number };
      await createInvoice(final);
      setInvoice(final);
      setSaving(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-axe-dark border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-axe-white font-bold text-lg">Générer une facture</h2>
            <p className="text-axe-muted text-xs mt-0.5">
              {pro.firstName} {pro.lastName} → {request.firstName} {request.lastName}
            </p>
          </div>
          <button onClick={onClose} className="text-axe-muted hover:text-axe-white text-xl transition-colors">×</button>
        </div>

        {step === "form" && (
          <div className="p-6 space-y-5">
            {/* Infos pro */}
            <div className="grid grid-cols-2 gap-4 bg-axe-charcoal rounded-xl p-4 text-sm">
              <div>
                <p className="text-xs text-axe-muted mb-1">Émetteur</p>
                <p className="text-axe-white font-medium">{pro.firstName} {pro.lastName}</p>
                <p className="text-axe-muted text-xs">{pro.email}</p>
                {pro.siret && <p className="text-axe-muted text-xs">SIRET : {pro.siret}</p>}
                {!pro.siret && (
                  <p className="text-yellow-400 text-xs mt-1">⚠ SIRET manquant sur le profil</p>
                )}
              </div>
              <div>
                <p className="text-xs text-axe-muted mb-1">Destinataire</p>
                <p className="text-axe-white font-medium">{request.firstName} {request.lastName}</p>
                <p className="text-axe-muted text-xs">{request.email}</p>
                <p className="text-axe-muted text-xs">{request.city}</p>
              </div>
            </div>

            {/* Prestation */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-axe-muted font-medium">Description de la prestation *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="Séance de coaching sportif, bilan initial…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-axe-muted font-medium">Quantité</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-axe-muted font-medium">Prix unitaire HT (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-axe-muted font-medium">Date d&apos;échéance</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="bg-axe-charcoal rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-axe-muted">
                <span>Total HT</span>
                <span>{totalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-axe-muted">
                <span>TVA ({vatRate}%)</span>
                <span>{vatAmount.toFixed(2)} €</span>
              </div>
              {pro.vatExempt && (
                <p className="text-xs text-axe-muted/60">TVA non applicable, art. 293 B du CGI</p>
              )}
              <div className="flex justify-between text-axe-white font-bold pt-2 border-t border-white/10">
                <span>Total TTC</span>
                <span>{totalTTC.toFixed(2)} €</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn-secondary text-sm py-3">
                Annuler
              </button>
              <button onClick={handlePreview} className="flex-1 btn-primary text-sm py-3">
                Prévisualiser
              </button>
            </div>
          </div>
        )}

        {step === "preview" && invoice && (
          <div className="p-6 space-y-5">
            <InvoicePreview invoice={invoice} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep("form")} className="flex-1 btn-secondary text-sm py-3">
                Modifier
              </button>
              <button
                onClick={handleSave}
                disabled={saving || invoice.invoiceNumber !== "AXE-XXXX"}
                className="flex-1 btn-primary text-sm py-3 disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : invoice.invoiceNumber !== "AXE-XXXX" ? "✓ Facture enregistrée" : "Enregistrer la facture"}
              </button>
            </div>
            {invoice.invoiceNumber !== "AXE-XXXX" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <p className="text-green-400 text-sm font-medium">
                  Facture {invoice.invoiceNumber} enregistrée
                </p>
                <p className="text-green-400/70 text-xs mt-1">
                  V2 : envoi automatique via Pennylane + notification email au client et au professionnel.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
