import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { getBookingById, getProfessionalById, updateBookingStatus } from "@/lib/firestore";
import { CancellationRule } from "@/lib/types";
import { emailCancellationClient, emailCancellationPro } from "@/lib/email";

function computeClientRefundPercent(
  rules: CancellationRule[],
  sessionDate: string,
  slotTime?: string
): number {
  const time = slotTime ?? "09:00";
  const sessionAt = new Date(`${sessionDate}T${time}:00`);
  const hoursUntil = (sessionAt.getTime() - Date.now()) / (1000 * 60 * 60);

  // rules triées par hoursBeforeSession décroissant — on prend la première qui matche
  const sorted = [...rules].sort((a, b) => b.hoursBeforeSession - a.hoursBeforeSession);
  for (const rule of sorted) {
    if (hoursUntil >= rule.hoursBeforeSession) return rule.refundPercent;
  }
  return 0;
}

export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json()) as {
    bookingId: string;
    cancelledBy: "client" | "pro";
    proWaivedFees?: boolean; // le praticien exonère manuellement les frais côté client
  };

  const { bookingId, cancelledBy, proWaivedFees } = body;

  if (!bookingId || !cancelledBy) {
    return Response.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const booking = await getBookingById(bookingId);
  if (!booking) return Response.json({ error: "Réservation introuvable." }, { status: 404 });
  if (booking.status === "cancelled") return Response.json({ error: "Déjà annulée." }, { status: 400 });
  if (!booking.stripePaymentIntentId) {
    return Response.json({ error: "Aucun paiement associé à cette réservation." }, { status: 400 });
  }

  const pro = await getProfessionalById(booking.proId);
  const policy = pro?.cancellationPolicy;

  let refundPercent = 0;
  let promoCode: string | undefined;

  if (cancelledBy === "pro") {
    // Praticien annule → remboursement intégral systématique
    refundPercent = 100;

    // Générer un code promo Stripe si configuré
    const compensationPct = policy?.proCompensationPercent ?? 0;
    if (compensationPct > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: compensationPct,
        duration: "once",
        name: `Compensation annulation — ${compensationPct}%`,
        max_redemptions: 1,
      });
      const promoObj = await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: coupon.id },
        max_redemptions: 1,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
      });
      promoCode = promoObj.code;
    }
  } else {
    // Client annule → calcul selon la politique du praticien
    if (proWaivedFees) {
      refundPercent = 100;
    } else if (policy) {
      refundPercent = computeClientRefundPercent(
        policy.rules,
        booking.sessionDate,
        booking.slotTime
      );
    } else {
      refundPercent = 100; // pas de politique → remboursement intégral par défaut
    }
  }

  const refundAmountCents = Math.round(booking.amountCents * (refundPercent / 100));

  // Remboursement Stripe
  if (refundAmountCents > 0) {
    await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: refundAmountCents,
      reverse_transfer: true,
      refund_application_fee: refundPercent === 100,
    });
  }

  // Mise à jour Firestore
  await updateBookingStatus(bookingId, "cancelled", {
    cancelledAt: new Date(),
    cancelledBy,
    refundPercent,
    refundAmountCents,
    proWaivedFees: proWaivedFees ?? false,
    ...(promoCode ? { promoCodeForClient: promoCode } : {}),
  });

  const refundEuros = refundAmountCents / 100;

  await Promise.all([
    emailCancellationClient({
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      sessionType: booking.sessionType,
      sessionDate: booking.sessionDate,
      refundEuros,
      cancelledBy,
      promoCode,
    }),
    cancelledBy === "client"
      ? emailCancellationPro({
          proEmail: booking.proEmail,
          clientName: booking.clientName,
          sessionType: booking.sessionType,
          sessionDate: booking.sessionDate,
          refundEuros,
        })
      : Promise.resolve(),
  ]);

  return Response.json({
    refundAmountEuros: refundEuros,
    refundPercent,
    promoCode,
  });
}
