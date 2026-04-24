import { Invoice } from "@/lib/types";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const formatDateFR = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  return (
    <div className="bg-white text-gray-900 rounded-xl p-8 text-sm font-sans space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">FACTURE</p>
          <p className="text-gray-500 text-xs mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 text-lg">AXE</p>
          <p className="text-gray-500 text-xs">Plateforme de mise en relation</p>
          <p className="text-gray-500 text-xs">contact@axe.fr</p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 text-xs">
        <div>
          <p className="text-gray-400 uppercase tracking-wider mb-1">Date d&apos;émission</p>
          <p className="font-medium text-gray-800">{formatDateFR(invoice.issuedAt)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider mb-1">Date d&apos;échéance</p>
          <p className="font-medium text-gray-800">{formatDateFR(invoice.dueAt)}</p>
        </div>
      </div>

      {/* Émetteur / Destinataire */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Émetteur</p>
          <p className="font-bold text-gray-900">{invoice.proFirstName} {invoice.proLastName}</p>
          {invoice.proLegalStatus && <p className="text-gray-600 text-xs">{invoice.proLegalStatus}</p>}
          <p className="text-gray-600 text-xs">{invoice.proEmail}</p>
          <p className="text-gray-600 text-xs">{invoice.proPhone}</p>
          <p className="text-gray-600 text-xs">{invoice.proCity}</p>
          {invoice.proSiret && (
            <p className="text-gray-600 text-xs mt-1">SIRET : {invoice.proSiret}</p>
          )}
          {invoice.proVatNumber && (
            <p className="text-gray-600 text-xs">TVA : {invoice.proVatNumber}</p>
          )}
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Destinataire</p>
          <p className="font-bold text-gray-900">{invoice.clientFirstName} {invoice.clientLastName}</p>
          <p className="text-gray-600 text-xs">{invoice.clientEmail}</p>
          <p className="text-gray-600 text-xs">{invoice.clientCity}</p>
        </div>
      </div>

      {/* Tableau prestation */}
      <div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-400 uppercase tracking-wider font-medium">Description</th>
              <th className="text-center py-2 text-gray-400 uppercase tracking-wider font-medium">Qté</th>
              <th className="text-right py-2 text-gray-400 uppercase tracking-wider font-medium">PU HT</th>
              <th className="text-right py-2 text-gray-400 uppercase tracking-wider font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-gray-800 pr-4">{invoice.description}</td>
              <td className="py-3 text-center text-gray-600">{invoice.quantity}</td>
              <td className="py-3 text-right text-gray-600">{formatCurrency(invoice.unitPrice)}</td>
              <td className="py-3 text-right text-gray-800 font-medium">{formatCurrency(invoice.totalHT)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="w-56 space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total HT</span>
            <span>{formatCurrency(invoice.totalHT)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>TVA ({invoice.vatRate}%)</span>
            <span>{formatCurrency(invoice.vatAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-sm">
            <span>Total TTC</span>
            <span>{formatCurrency(invoice.totalTTC)}</span>
          </div>
        </div>
      </div>

      {/* Mentions légales */}
      <div className="border-t border-gray-100 pt-4 space-y-1">
        {invoice.proVatExempt && (
          <p className="text-xs text-gray-400">TVA non applicable, art. 293 B du CGI.</p>
        )}
        <p className="text-xs text-gray-400">
          En cas de retard de paiement, des pénalités de 3 fois le taux légal seront appliquées,
          ainsi qu&apos;une indemnité forfaitaire de recouvrement de 40 €.
        </p>
        <p className="text-xs text-gray-400">
          Règlement par virement bancaire sous {Math.round((new Date(invoice.dueAt).getTime() - new Date(invoice.issuedAt).getTime()) / (1000 * 60 * 60 * 24))} jours.
        </p>
      </div>

      {/* Badge V2 Pennylane */}
      <div className="border border-dashed border-gray-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-400">
          V2 — Cette facture sera transmise automatiquement via{" "}
          <span className="font-semibold text-gray-600">Pennylane</span> (PDP agréée DGFiP)
          pour conformité à la facturation électronique obligatoire.
        </p>
      </div>
    </div>
  );
}
