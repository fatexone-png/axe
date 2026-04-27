import { NextRequest } from "next/server";
import { emailInvoiceSentClient } from "@/lib/email";
import { Invoice } from "@/lib/types";

export async function POST(request: NextRequest): Promise<Response> {
  const { invoice } = (await request.json()) as { invoice: Invoice };

  if (!invoice?.id || invoice.invoiceNumber === "GETAXE-XXXX") {
    return Response.json({ error: "Facture invalide ou non enregistrée." }, { status: 400 });
  }

  await emailInvoiceSentClient({
    clientEmail: invoice.clientEmail,
    clientName: `${invoice.clientFirstName} ${invoice.clientLastName}`.trim(),
    proName: `${invoice.proFirstName} ${invoice.proLastName}`.trim(),
    invoiceNumber: invoice.invoiceNumber,
    totalTTC: invoice.totalTTC,
    issuedAt: invoice.issuedAt,
    dueAt: invoice.dueAt,
  });

  return Response.json({ success: true });
}
