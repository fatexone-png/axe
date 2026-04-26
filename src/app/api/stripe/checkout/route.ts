import { NextRequest } from "next/server";
import { stripe, computeFee } from "@/lib/stripe";
import { createBooking } from "@/lib/firestore";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as {
    proId: string;
    proEmail?: string;
    proStripeAccountId: string;
    amountCents: number;
    sessionType: string;
    sessionDate: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    // B2B
    invoiceTo?: "personal" | "company";
    companyName?: string;
    companySiret?: string;
    companyVatNumber?: string;
    companyAddress?: string;
  };

  const {
    proId,
    proEmail,
    proStripeAccountId,
    amountCents,
    sessionType,
    sessionDate,
    clientName,
    clientEmail,
    clientPhone,
    invoiceTo,
    companyName,
    companySiret,
    companyVatNumber,
    companyAddress,
  } = body;

  if (!proId || !proStripeAccountId || !amountCents || !sessionType || !sessionDate || !clientEmail) {
    return Response.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const { proAmount, platformFee } = computeFee(amountCents);
  const amountEuros = amountCents / 100;

  const bookingId = await createBooking({
    proId,
    proEmail: proEmail ?? "",
    proStripeAccountId,
    clientName,
    clientEmail,
    clientPhone,
    sessionType,
    sessionDate,
    amountEuros,
    amountCents,
    platformFeeCents: platformFee,
    proPayoutCents: proAmount,
    status: "pending_payment",
    // B2B
    ...(invoiceTo && { invoiceTo }),
    ...(invoiceTo === "company" && {
      companyName,
      companySiret,
      companyVatNumber,
      companyAddress,
    }),
  });

  const isB2B = invoiceTo === "company" && companyName;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: sessionType,
            description: isB2B
              ? `Séance du ${sessionDate} — Facturé à ${companyName}`
              : `Séance du ${sessionDate} avec ${clientName}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: { destination: proStripeAccountId },
    },
    customer_email: clientEmail,
    allow_promotion_codes: true,
    success_url: `${BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/pro/${proId}`,
    metadata: {
      bookingId,
      invoiceTo: invoiceTo ?? "personal",
      ...(isB2B && { companyName: companyName ?? "" }),
    },
  });

  return Response.json({ url: session.url });
}
