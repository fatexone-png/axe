"use client";

import { useEffect, useState, useRef } from "react";
import { Professional, Invoice, InvoiceLine, InvoiceStatus, LEGAL_STATUS_LABELS } from "@/lib/types";
import { createInvoice, generateInvoiceNumber, getInvoicesByPro, updateInvoiceStatus } from "@/lib/firestore";
import InvoicePreview from "./InvoicePreview";

interface Props {
  pro: Professional;
}

type Step = "list" | "form" | "preview";

// ── Labels statut ─────────────────────────────────────────────────────────────

const STATUS_INVOICE_LABELS: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  cancelled: "Annulée",
};

const STATUS_INVOICE_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-white/5 text-axe-muted",
  sent: "bg-blue-500/10 text-blue-400",
  paid: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

// ── Templates par profession ──────────────────────────────────────────────────

const PROFESSION_TEMPLATES: Record<string, {
  types: string[];
  groupTypes: string[];
  defaultDesc: string;
}> = {
  coach: {
    types: ["Séance individuelle", "Cours collectif", "Forfait mensuel", "Bilan initial", "Préparation physique", "Déplacement", "Autre"],
    groupTypes: ["Cours collectif"],
    defaultDesc: "Séance de coaching sportif",
  },
  physical_trainer: {
    types: ["Séance individuelle", "Séance collective", "Bilan de performance", "Forfait préparation", "Déplacement", "Autre"],
    groupTypes: ["Séance collective"],
    defaultDesc: "Séance de préparation physique",
  },
  kine: {
    types: ["Séance hors nomenclature", "Bilan kinésithérapique", "Programme de rééducation personnalisé", "Séance de rééducation post-op", "Renforcement musculaire", "Déplacement à domicile", "Autre"],
    groupTypes: [],
    defaultDesc: "Séance de kinésithérapie hors nomenclature",
  },
  osteo: {
    types: ["Consultation ostéopathique", "Bilan ostéopathique", "Consultation de suivi", "Autre"],
    groupTypes: [],
    defaultDesc: "Consultation ostéopathique",
  },
  sports_doctor: {
    types: ["Consultation", "Certificat médical", "Bilan d'aptitude sportive", "Bilan de reprise", "Visite médicale", "Autre"],
    groupTypes: [],
    defaultDesc: "Consultation médecine du sport",
  },
  mental_coach: {
    types: ["Séance individuelle", "Bilan mental initial", "Préparation compétition", "Gestion du stress", "Visualisation", "Suivi mental", "Forfait mensuel", "Autre"],
    groupTypes: [],
    defaultDesc: "Séance de préparation mentale",
  },
  recovery: {
    types: ["Séance de récupération", "Massage sportif", "Bilan mobilité", "Programme personnalisé", "Cryothérapie", "Autre"],
    groupTypes: [],
    defaultDesc: "Séance de récupération sportive",
  },
};

const DEFAULT_TEMPLATE = {
  types: ["Prestation de service", "Forfait", "Déplacement", "Autre"],
  groupTypes: [] as string[],
  defaultDesc: "Prestation",
};

function getTemplate(profession: string) {
  return PROFESSION_TEMPLATES[profession] ?? DEFAULT_TEMPLATE;
}

function newLine(profession: string, id?: string): InvoiceLine {
  const tpl = getTemplate(profession);
  return {
    id: id ?? Date.now().toString(),
    type: tpl.types[0],
    description: tpl.defaultDesc,
    quantity: 1,
    unitPrice: 0,
    totalLine: 0,
  };
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function DashboardFacturation({ pro }: Props) {
  const [step, setStep] = useState<Step>("list");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const expandedPrintRef = useRef<HTMLDivElement>(null);
  const tpl = getTemplate(pro.profession);

  // ── Liste ─────────────────────────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // ── Émetteur ─────────────────────────────────────────────────────────────────
  const [proAddress, setProAddress] = useState("");
  const [proSiretOverride, setProSiretOverride] = useState(pro.siret ?? "");
  const [isVatExempt, setIsVatExempt] = useState(pro.vatExempt ?? false);
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");

  // ── Client ────────────────────────────────────────────────────────────────────
  const [clientType, setClientType] = useState<"particulier" | "entreprise">("particulier");
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientSiret, setClientSiret] = useState("");
  const [clientVatNumber, setClientVatNumber] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");

  // ── Mentions ──────────────────────────────────────────────────────────────────
  const [showLatePaymentClause, setShowLatePaymentClause] = useState(true);

  // ── Lignes & dates ────────────────────────────────────────────────────────────
  const [lines, setLines] = useState<InvoiceLine[]>([newLine(pro.profession, "1")]);
  const [issuedAt, setIssuedAt] = useState(todayISO());
  const [dueDate, setDueDate] = useState(defaultDueDate());

  const vatRate = isVatExempt ? 0 : 20;
  const totalHT = lines.reduce((sum, l) => sum + l.totalLine, 0);
  const vatAmount = isVatExempt ? 0 : Math.round(totalHT * 0.2 * 100) / 100;
  const totalTTC = totalHT + vatAmount;

  // ── Bug fix: saved ne doit pas être vrai quand currentInvoice est null ────────
  const saved = currentInvoice !== null && currentInvoice.invoiceNumber !== "GETAXE-XXXX";

  useEffect(() => {
    if (!pro.id) return;
    getInvoicesByPro(pro.id)
      .then(setInvoices)
      .catch(() => setInvoices([]))
      .finally(() => setLoadingInvoices(false));
  }, [pro.id]);

  // ── Gestion des lignes ────────────────────────────────────────────────────────

  function addLine() {
    setLines((prev) => [...prev, newLine(pro.profession, Date.now().toString())]);
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLine(id: string, patch: Partial<InvoiceLine>) {
    setLines((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, ...patch };
      updated.totalLine = updated.quantity * updated.unitPrice;
      if (patch.type && !patch.description) {
        updated.description = patch.type === "Autre" ? "" : patch.type;
      }
      return updated;
    }));
  }

  // ── Statut factures existantes ────────────────────────────────────────────────

  async function handleStatusUpdate(invoiceId: string, newStatus: InvoiceStatus) {
    setUpdatingStatus(invoiceId);
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      setInvoices((prev) => prev.map((inv) => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
      if (newStatus === "cancelled") setExpandedId(null);
    } catch {
      // silent — l'UI restera cohérente
    } finally {
      setUpdatingStatus(null);
    }
  }

  // ── Print facture existante ───────────────────────────────────────────────────

  function handlePrintExisting() {
    if (!expandedPrintRef.current) return;
    const inv = invoices.find((i) => i.id === expandedId);
    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<title>Facture ${inv?.invoiceNumber ?? ""}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;}</style>
</head><body>${expandedPrintRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────

  function resetForm() {
    setProAddress("");
    setProSiretOverride(pro.siret ?? "");
    setIsVatExempt(pro.vatExempt ?? false);
    setIban("");
    setBic("");
    setShowLatePaymentClause(true);
    setClientType("particulier");
    setClientFirstName("");
    setClientLastName("");
    setClientCompanyName("");
    setClientSiret("");
    setClientVatNumber("");
    setClientEmail("");
    setClientAddress("");
    setClientCity("");
    setLines([newLine(pro.profession, "1")]);
    setIssuedAt(todayISO());
    setDueDate(defaultDueDate());
    setError("");
    setCurrentInvoice(null);
  }

  // ── Preview ───────────────────────────────────────────────────────────────────

  function handlePreview() {
    const isB2B = clientType === "entreprise";
    if (isB2B && !clientCompanyName.trim()) { setError("La raison sociale est obligatoire."); return; }
    if (!isB2B && !clientLastName.trim()) { setError("Le nom du client est obligatoire."); return; }
    if (lines.length === 0) { setError("Ajoutez au moins une prestation."); return; }
    if (lines.some((l) => l.unitPrice <= 0)) { setError("Tous les prix doivent être supérieurs à 0."); return; }
    setError("");

    setCurrentInvoice({
      invoiceNumber: "GETAXE-XXXX",
      requestId: "manual",
      professionalId: pro.id!,
      proFirstName: pro.firstName,
      proLastName: pro.lastName,
      proEmail: pro.email,
      proPhone: pro.phone,
      proAddress: proAddress.trim() || undefined,
      proCity: pro.city,
      proSiret: proSiretOverride.trim() || undefined,
      proLegalStatus: pro.legalStatus ? LEGAL_STATUS_LABELS[pro.legalStatus] : undefined,
      proVatNumber: isVatExempt ? undefined : pro.vatNumber,
      proVatExempt: isVatExempt,
      invoiceType: isB2B ? "B2B" : "B2C",
      clientFirstName,
      clientLastName,
      clientCompanyName: isB2B ? clientCompanyName.trim() : undefined,
      clientSiret: isB2B && clientSiret.trim() ? clientSiret.trim() : undefined,
      clientVatNumber: isB2B && clientVatNumber.trim() ? clientVatNumber.trim() : undefined,
      clientEmail,
      clientAddress: clientAddress.trim() || undefined,
      clientCity,
      iban: iban.trim() || undefined,
      bic: bic.trim() || undefined,
      showLatePaymentClause: isB2B ? true : showLatePaymentClause,
      lines,
      description: lines[0].description,
      quantity: lines[0].quantity,
      unitPrice: lines[0].unitPrice,
      vatRate,
      vatAmount,
      totalHT,
      totalTTC,
      status: "draft",
      issuedAt,
      dueAt: dueDate,
      createdAt: new Date(),
    });
    setStep("preview");
  }

  // ── Save — capture l'ID Firestore retourné ────────────────────────────────────

  async function handleSave() {
    if (!currentInvoice) return;
    setSaving(true);
    try {
      const number = await generateInvoiceNumber();
      const final = { ...currentInvoice, invoiceNumber: number };
      const id = await createInvoice(final);
      const withId = { ...final, id };
      setCurrentInvoice(withId);
      setInvoices((prev) => [withId, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  // ── Envoyer par email ─────────────────────────────────────────────────────────

  async function handleSendEmail() {
    if (!currentInvoice?.id) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/invoice/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: currentInvoice }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Erreur lors de l'envoi.");
        return;
      }
      setEmailSent(true);
    } catch {
      setError("Erreur réseau lors de l'envoi de l'email.");
    } finally {
      setSendingEmail(false);
    }
  }

  // ── Print (nouvelle facture) ──────────────────────────────────────────────────

  function handlePrint() {
    if (!printRef.current) return;
    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<title>Facture ${currentInvoice?.invoiceNumber ?? ""}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;}</style>
</head><body>${printRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LISTE
  // ════════════════════════════════════════════════════════════════════════════

  if (step === "list") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider">Mes factures</h2>
          <button onClick={() => { resetForm(); setStep("form"); }} className="btn-primary text-sm">
            + Nouvelle facture
          </button>
        </div>

        {loadingInvoices ? (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-axe-muted text-sm">Chargement…</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-10 text-center space-y-2">
            <p className="text-axe-muted text-sm">Aucune facture émise pour l&apos;instant.</p>
            <p className="text-axe-muted/50 text-xs">Facturation électronique obligatoire en 2027 pour les TPE/auto-entrepreneurs — GetAxe vous y prépare dès aujourd&apos;hui.</p>
          </div>
        ) : (
          <div className="bg-axe-charcoal border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
            {invoices.map((inv, i) => {
              const isExpanded = expandedId === inv.id;
              const isUpdating = updatingStatus === inv.id;
              return (
                <div key={inv.id ?? i}>
                  {/* Ligne principale */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : (inv.id ?? null))}
                    className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                  >
                    <div className="min-w-0">
                      <p className="text-axe-white text-sm font-semibold truncate">
                        {inv.clientCompanyName ?? `${inv.clientFirstName} ${inv.clientLastName}`.trim()}
                      </p>
                      <p className="text-axe-muted text-xs mt-0.5">{inv.invoiceNumber} · {formatDate(inv.issuedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-axe-accent font-bold text-sm">{inv.totalTTC.toFixed(2)} €</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_INVOICE_COLORS[inv.status]}`}>
                        {STATUS_INVOICE_LABELS[inv.status]}
                      </span>
                      <span className={`text-axe-muted/40 text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▾</span>
                    </div>
                  </div>

                  {/* Panneau déroulant */}
                  {isExpanded && (
                    <div className="border-t border-white/5 bg-axe-black/20">
                      {/* Boutons de statut */}
                      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-white/5">
                        {inv.status === "draft" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inv.id!, "sent"); }}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? "…" : "Marquer comme envoyée"}
                          </button>
                        )}
                        {(inv.status === "draft" || inv.status === "sent") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inv.id!, "paid"); }}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? "…" : "Marquer comme payée"}
                          </button>
                        )}
                        {(inv.status === "draft" || inv.status === "sent") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inv.id!, "cancelled"); }}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? "…" : "Annuler"}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrintExisting(); }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-axe-muted text-xs font-medium hover:bg-white/10 hover:text-axe-white transition-colors ml-auto"
                        >
                          Imprimer / PDF
                        </button>
                      </div>
                      {/* Aperçu de la facture */}
                      <div ref={expandedPrintRef} className="p-4 overflow-x-auto">
                        <InvoicePreview invoice={inv} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FORMULAIRE
  // ════════════════════════════════════════════════════════════════════════════

  if (step === "form") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("list")} className="text-axe-muted hover:text-axe-white text-sm transition-colors">← Retour</button>
          <h2 className="text-sm font-semibold text-axe-white">Nouvelle facture</h2>
        </div>

        {/* ── Avertissement professions de santé conventionnées ── */}
        {(pro.profession === "kine" || pro.profession === "sports_doctor") && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <span className="text-amber-400 text-lg shrink-0">⚠</span>
            <div className="space-y-1">
              <p className="text-amber-300 text-sm font-semibold">Actes hors nomenclature uniquement</p>
              <p className="text-amber-300/70 text-xs leading-relaxed">
                Cet outil est réservé aux <strong className="text-amber-300">actes non remboursables par l&apos;Assurance Maladie</strong> (bilans personnalisés, programmes de renforcement, actes hors NGAP{pro.profession === "sports_doctor" ? "/CCAM" : ""}).
                Pour les actes conventionnés, utilisez votre logiciel <strong className="text-amber-300">SESAM-Vitale</strong> {pro.profession === "kine" ? "(HelloDoc, Ordoscope, Pyxvital…)" : "(Doctolib, HelloDoc…)"}.
              </p>
            </div>
          </div>
        )}

        {/* ── Émetteur ── */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Émetteur (vous)</p>
          <div className="text-sm text-axe-muted">
            <span className="text-axe-white font-medium">{pro.firstName} {pro.lastName}</span>
            {pro.legalStatus && <span className="ml-2 text-xs">· {LEGAL_STATUS_LABELS[pro.legalStatus]}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-axe-muted">Adresse postale</label>
              <input type="text" className="input w-full text-sm" placeholder="12 rue de la Paix, 75001 Paris" value={proAddress} onChange={(e) => setProAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-axe-muted">
                SIRET {!pro.siret && <span className="text-axe-amber">⚠ manquant</span>}
              </label>
              <input type="text" className="input w-full text-sm font-mono" placeholder="123 456 789 00012" value={proSiretOverride} onChange={(e) => setProSiretOverride(e.target.value)} />
            </div>
          </div>
          <div onClick={() => setIsVatExempt((v) => !v)} className="flex items-start gap-3 bg-axe-black/40 rounded-xl px-4 py-3 cursor-pointer hover:bg-axe-black/60 transition-colors">
            <div className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isVatExempt ? "bg-axe-accent border-axe-accent" : "border-white/20"}`}>
              {isVatExempt && <span className="text-axe-black text-xs font-bold">✓</span>}
            </div>
            <div>
              <p className="text-axe-white text-sm font-medium">Non assujetti à la TVA</p>
              <p className="text-axe-muted text-xs mt-0.5">Mention <strong className="text-axe-white">&ldquo;TVA non applicable, art. 293 B du CGI&rdquo;</strong> sur la facture.</p>
            </div>
          </div>

          {/* Coordonnées bancaires */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <p className="text-xs text-axe-muted font-medium">Coordonnées bancaires <span className="text-axe-muted/50">(optionnel — affichées sur la facture)</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-axe-muted">IBAN</label>
                <input type="text" className="input w-full text-sm font-mono" placeholder="FR76 3000 4000 0100 0000 0000 145" value={iban} onChange={(e) => setIban(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-axe-muted">BIC / SWIFT</label>
                <input type="text" className="input w-full text-sm font-mono" placeholder="BNPAFRPPXXX" value={bic} onChange={(e) => setBic(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Client ── */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Client</p>
            <div className="flex rounded-xl overflow-hidden border border-white/10 text-xs">
              <button type="button" onClick={() => setClientType("particulier")} className={`px-4 py-1.5 font-medium transition-colors ${clientType === "particulier" ? "bg-axe-accent text-axe-black" : "text-axe-muted hover:text-axe-white"}`}>Particulier</button>
              <button type="button" onClick={() => setClientType("entreprise")} className={`px-4 py-1.5 font-medium transition-colors ${clientType === "entreprise" ? "bg-axe-accent text-axe-black" : "text-axe-muted hover:text-axe-white"}`}>Entreprise</button>
            </div>
          </div>

          {clientType === "particulier" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-axe-muted">Prénom</label>
                <input type="text" className="input w-full text-sm" placeholder="Jean" value={clientFirstName} onChange={(e) => setClientFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-axe-muted">Nom *</label>
                <input type="text" className="input w-full text-sm" placeholder="Dupont" value={clientLastName} onChange={(e) => setClientLastName(e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs text-axe-muted">Raison sociale *</label>
                <input type="text" className="input w-full text-sm" placeholder="Acme SAS" value={clientCompanyName} onChange={(e) => setClientCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-axe-muted">SIRET</label>
                  <input type="text" className="input w-full text-sm font-mono" placeholder="123 456 789 00012" value={clientSiret} onChange={(e) => setClientSiret(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-axe-muted">N° TVA intracommunautaire</label>
                  <input type="text" className="input w-full text-sm font-mono" placeholder="FR 12 345678901" value={clientVatNumber} onChange={(e) => setClientVatNumber(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-axe-muted">Prénom contact</label>
                  <input type="text" className="input w-full text-sm" placeholder="Jean" value={clientFirstName} onChange={(e) => setClientFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-axe-muted">Nom contact</label>
                  <input type="text" className="input w-full text-sm" placeholder="Dupont" value={clientLastName} onChange={(e) => setClientLastName(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-axe-muted">Adresse postale</label>
            <input type="text" className="input w-full text-sm" placeholder="5 avenue Victor Hugo, 75016 Paris" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-axe-muted">Ville</label>
              <input type="text" className="input w-full text-sm" placeholder="Paris" value={clientCity} onChange={(e) => setClientCity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-axe-muted">Email</label>
              <input type="email" className="input w-full text-sm" placeholder="jean@email.fr" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Lignes de prestation ── */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Prestations</p>

          {lines.map((line, idx) => {
            const isGroup = tpl.groupTypes.includes(line.type);
            return (
              <div key={line.id} className="bg-axe-black/40 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-axe-accent">Ligne {idx + 1}</span>
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(line.id)} className="text-xs text-axe-muted hover:text-red-400 transition-colors">Supprimer</button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-axe-muted">Type de prestation</label>
                    <select className="input w-full text-sm" value={line.type} onChange={(e) => updateLine(line.id, { type: e.target.value })}>
                      {tpl.types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-axe-muted">Date de séance (optionnel)</label>
                    <input type="date" className="input w-full text-sm" value={line.date ?? ""} onChange={(e) => updateLine(line.id, { date: e.target.value || undefined })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-axe-muted">Description</label>
                  <input type="text" className="input w-full text-sm" placeholder="Détails de la prestation…" value={line.description} onChange={(e) => updateLine(line.id, { description: e.target.value })} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-axe-muted">Quantité</label>
                    <input type="number" min={1} className="input w-full text-sm" value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: Math.max(1, Number(e.target.value)) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-axe-muted">{isVatExempt ? "Prix unitaire (€)" : "Prix HT (€)"}</label>
                    <input type="number" min={0} step={0.01} className="input w-full text-sm" placeholder="0.00" value={line.unitPrice || ""} onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) })} />
                  </div>
                  {isGroup ? (
                    <div className="space-y-1">
                      <label className="text-xs text-axe-muted">Participants</label>
                      <input type="number" min={1} className="input w-full text-sm" placeholder="ex: 10" value={line.participants ?? ""} onChange={(e) => updateLine(line.id, { participants: Number(e.target.value) || undefined })} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs text-axe-muted">Sous-total</label>
                      <div className="input w-full text-sm text-axe-accent font-semibold bg-axe-black/20 cursor-default">
                        {line.totalLine.toFixed(2)} €
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button onClick={addLine} className="w-full border border-dashed border-white/10 rounded-xl py-3 text-axe-muted text-sm hover:border-axe-accent/40 hover:text-axe-accent transition-colors">
            + Ajouter une ligne
          </button>

          {/* Total */}
          <div className="bg-axe-black/40 rounded-xl p-4 space-y-2 text-sm border-t border-white/5">
            {isVatExempt ? (
              <>
                <div className="flex justify-between font-bold text-axe-white">
                  <span>Total</span><span>{totalHT.toFixed(2)} €</span>
                </div>
                <p className="text-axe-muted/60 text-xs">TVA non applicable, art. 293 B du CGI.</p>
              </>
            ) : (
              <>
                <div className="flex justify-between text-axe-muted">
                  <span>Total HT</span><span>{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-axe-muted">
                  <span>TVA (20%)</span><span>{vatAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-axe-white pt-2 border-t border-white/10">
                  <span>Total TTC</span><span>{totalTTC.toFixed(2)} €</span>
                </div>
              </>
            )}
          </div>

          {/* Dates d'émission et d'échéance */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs text-axe-muted">Date d&apos;émission</label>
              <input type="date" className="input w-full text-sm" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-axe-muted">Date d&apos;échéance</label>
              <input type="date" className="input w-full text-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Clause pénalités (particuliers uniquement) ── */}
        {clientType === "particulier" && (
          <div onClick={() => setShowLatePaymentClause((v) => !v)} className="flex items-start gap-3 bg-axe-charcoal border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:bg-axe-charcoal/80 transition-colors">
            <div className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${showLatePaymentClause ? "bg-axe-accent border-axe-accent" : "border-white/20"}`}>
              {showLatePaymentClause && <span className="text-axe-black text-xs font-bold">✓</span>}
            </div>
            <div>
              <p className="text-axe-white text-sm font-medium">Clause de pénalités de retard</p>
              <p className="text-axe-muted text-xs mt-0.5">Affiche la mention légale sur la facture. <span className="text-axe-muted/60">Obligatoire en B2B, optionnel pour les particuliers.</span></p>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button onClick={() => setStep("list")} className="flex-1 bg-axe-charcoal border border-white/10 text-axe-muted text-sm py-3 rounded-xl hover:text-axe-white transition-colors">Annuler</button>
          <button onClick={handlePreview} className="flex-1 btn-primary text-sm py-3">Prévisualiser →</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRÉVISUALISATION
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep("form")} className="text-axe-muted hover:text-axe-white text-sm transition-colors">← Modifier</button>
        <h2 className="text-sm font-semibold text-axe-white">Prévisualisation</h2>
      </div>

      <div ref={printRef}>
        {currentInvoice && <InvoicePreview invoice={currentInvoice} />}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {saved && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-green-400 text-sm font-semibold">Facture {currentInvoice?.invoiceNumber} enregistrée</p>
          <p className="text-green-400/70 text-xs mt-1">Dématérialisation obligatoire 2027 — Intégration Pennylane à venir.</p>
        </div>
      )}

      {emailSent && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-blue-400 text-sm font-medium">Email envoyé à {currentInvoice?.clientEmail}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!saved ? (
          <>
            <button onClick={() => setStep("form")} className="flex-1 bg-axe-charcoal border border-white/10 text-axe-muted text-sm py-3 rounded-xl hover:text-axe-white transition-colors">Modifier</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary text-sm py-3 disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer la facture"}</button>
          </>
        ) : (
          <>
            <button onClick={handlePrint} className="flex-1 btn-primary text-sm py-3">Imprimer / PDF</button>
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || emailSent}
              className="flex-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm py-3 rounded-xl hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              {sendingEmail ? "Envoi…" : emailSent ? "✓ Email envoyé" : "Envoyer par email"}
            </button>
            <button onClick={() => { resetForm(); setStep("list"); }} className="bg-axe-charcoal border border-white/10 text-axe-muted text-sm py-3 px-4 rounded-xl hover:text-axe-white transition-colors">Nouvelle</button>
          </>
        )}
      </div>
    </div>
  );
}
