import { Invoice } from "@/lib/types";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const formatDateFR = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
};

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const vatExempt = invoice.proVatExempt;
  const paymentDays = Math.max(
    1,
    Math.round((new Date(invoice.dueAt).getTime() - new Date(invoice.issuedAt).getTime()) / 86400000)
  );
  const isB2B = invoice.invoiceType === "B2B";

  return (
    <div style={{
      background: "#fff",
      color: "#111",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      fontSize: "13px",
      lineHeight: "1.5",
      padding: "48px",
      maxWidth: "720px",
      margin: "0 auto",
      boxSizing: "border-box",
    }}>

      {/* ── En-tête ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", color: "#111" }}>FACTURE</div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>N° {invoice.invoiceNumber}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#111" }}>{invoice.proFirstName} {invoice.proLastName}</div>
          {invoice.proLegalStatus && <div style={{ color: "#888", fontSize: "12px" }}>{invoice.proLegalStatus}</div>}
          {invoice.proCity && <div style={{ color: "#888", fontSize: "12px" }}>{invoice.proCity}</div>}
        </div>
      </div>

      {/* ── Dates ── */}
      <div style={{ display: "flex", gap: "24px", background: "#f7f7f7", borderRadius: "8px", padding: "14px 20px", marginBottom: "28px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Date d&apos;émission</div>
          <div style={{ fontWeight: 600, color: "#111" }}>{formatDateFR(invoice.issuedAt)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Date d&apos;échéance</div>
          <div style={{ fontWeight: 600, color: "#111" }}>{formatDateFR(invoice.dueAt)}</div>
        </div>
      </div>

      {/* ── Émetteur / Destinataire ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Émetteur</div>
          <div style={{ fontWeight: 700, color: "#111", marginBottom: "3px" }}>{invoice.proFirstName} {invoice.proLastName}</div>
          {invoice.proLegalStatus && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.proLegalStatus}</div>}
          {invoice.proEmail && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.proEmail}</div>}
          {invoice.proPhone && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.proPhone}</div>}
          {invoice.proAddress && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.proAddress}</div>}
          {invoice.proCity && !invoice.proAddress && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.proCity}</div>}
          {invoice.proSiret
            ? <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>SIRET : {invoice.proSiret}</div>
            : <div style={{ color: "#e05", fontSize: "12px", marginTop: "4px" }}>SIRET manquant</div>
          }
          {!vatExempt && invoice.proVatNumber && (
            <div style={{ color: "#666", fontSize: "12px" }}>N° TVA : {invoice.proVatNumber}</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Destinataire</div>
          {isB2B && invoice.clientCompanyName ? (
            <>
              <div style={{ fontWeight: 700, color: "#111", marginBottom: "3px" }}>{invoice.clientCompanyName}</div>
              {invoice.clientSiret && <div style={{ color: "#666", fontSize: "12px" }}>SIRET : {invoice.clientSiret}</div>}
              {invoice.clientVatNumber && <div style={{ color: "#666", fontSize: "12px" }}>N° TVA : {invoice.clientVatNumber}</div>}
              {(invoice.clientFirstName || invoice.clientLastName) && (
                <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                  Contact : {invoice.clientFirstName} {invoice.clientLastName}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontWeight: 700, color: "#111", marginBottom: "3px" }}>
              {invoice.clientFirstName} {invoice.clientLastName}
            </div>
          )}
          {invoice.clientEmail && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.clientEmail}</div>}
          {invoice.clientAddress && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.clientAddress}</div>}
          {invoice.clientCity && !invoice.clientAddress && <div style={{ color: "#666", fontSize: "12px" }}>{invoice.clientCity}</div>}
        </div>
      </div>

      {/* ── Tableau prestation ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <thead>
          <tr style={{ background: "#111" }}>
            <th style={{ textAlign: "left", padding: "10px 14px", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em" }}>Description</th>
            <th style={{ textAlign: "center", padding: "10px 14px", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Qté</th>
            <th style={{ textAlign: "right", padding: "10px 14px", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
              {vatExempt ? "Prix unitaire" : "PU HT"}
            </th>
            <th style={{ textAlign: "right", padding: "10px 14px", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
              {vatExempt ? "Montant" : "Total HT"}
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines && invoice.lines.length > 0 ? (
            invoice.lines.map((line, i) => (
              <tr key={line.id ?? i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "14px", color: "#222", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 500 }}>{line.type}</div>
                  {line.description && line.description !== line.type && (
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>{line.description}</div>
                  )}
                  {line.date && (
                    <div style={{ color: "#999", fontSize: "11px", marginTop: "2px" }}>
                      {formatDateFR(line.date)}
                    </div>
                  )}
                  {line.participants != null && (
                    <div style={{ color: "#999", fontSize: "11px", marginTop: "2px" }}>
                      {line.participants} participant{line.participants > 1 ? "s" : ""}
                    </div>
                  )}
                </td>
                <td style={{ padding: "14px", textAlign: "center", color: "#555", verticalAlign: "top" }}>{line.quantity}</td>
                <td style={{ padding: "14px", textAlign: "right", color: "#555", whiteSpace: "nowrap", verticalAlign: "top" }}>{formatCurrency(line.unitPrice)}</td>
                <td style={{ padding: "14px", textAlign: "right", fontWeight: 600, color: "#111", whiteSpace: "nowrap", verticalAlign: "top" }}>{formatCurrency(line.totalLine)}</td>
              </tr>
            ))
          ) : (
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "14px", color: "#222", verticalAlign: "top" }}>{invoice.description}</td>
              <td style={{ padding: "14px", textAlign: "center", color: "#555" }}>{invoice.quantity}</td>
              <td style={{ padding: "14px", textAlign: "right", color: "#555", whiteSpace: "nowrap" }}>{formatCurrency(invoice.unitPrice)}</td>
              <td style={{ padding: "14px", textAlign: "right", fontWeight: 600, color: "#111", whiteSpace: "nowrap" }}>{formatCurrency(invoice.totalHT)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Totaux ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
        <div style={{ width: "260px" }}>
          {vatExempt ? (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid #111", fontWeight: 700, fontSize: "15px" }}>
              <span>Total</span>
              <span>{formatCurrency(invoice.totalHT)}</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", color: "#888", fontSize: "12px" }}>
                <span>Total HT</span><span>{formatCurrency(invoice.totalHT)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", color: "#888", fontSize: "12px" }}>
                <span>TVA ({invoice.vatRate}%)</span><span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid #111", fontWeight: 700, fontSize: "15px" }}>
                <span>Total TTC</span><span>{formatCurrency(invoice.totalTTC)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Coordonnées bancaires ── */}
      {(invoice.iban || invoice.bic) && (
        <div style={{ background: "#f7f7f7", borderRadius: "8px", padding: "14px 20px", marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            Coordonnées bancaires — Règlement par virement
          </div>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            {invoice.iban && (
              <div>
                <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "2px" }}>IBAN</div>
                <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 600, color: "#111", letterSpacing: "0.03em" }}>
                  {invoice.iban}
                </div>
              </div>
            )}
            {invoice.bic && (
              <div>
                <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "2px" }}>BIC / SWIFT</div>
                <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 600, color: "#111", letterSpacing: "0.03em" }}>
                  {invoice.bic}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mentions légales ── */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: "20px", fontSize: "11px", color: "#999", lineHeight: "1.7" }}>
        {vatExempt && (
          <div style={{ color: "#555", fontWeight: 600, marginBottom: "6px" }}>
            TVA non applicable, art. 293 B du CGI.
          </div>
        )}
        {invoice.showLatePaymentClause !== false && (
          <div>
            En cas de retard de paiement, des pénalités de 3 fois le taux d&apos;intérêt légal seront exigibles,
            ainsi qu&apos;une indemnité forfaitaire de recouvrement de 40 €.
          </div>
        )}
        <div style={{ marginTop: invoice.showLatePaymentClause !== false ? "4px" : "0" }}>
          Règlement {invoice.iban ? "par virement bancaire " : ""}sous {paymentDays} jour{paymentDays > 1 ? "s" : ""} à compter de la date d&apos;émission.
        </div>
        <div style={{ marginTop: "12px", color: "#ccc", fontSize: "10px" }}>
          Facture émise via GetAxe · getaxe.fr — Dématérialisation obligatoire 2027 (TPE/auto-entrepreneurs) · Intégration Pennylane à venir.
        </div>
      </div>
    </div>
  );
}
