import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { getBookingById, updateBookingStatus } from "@/lib/firestore";
import { updateDoc, doc, getFirestore } from "firebase/firestore";
import Stripe from "stripe";
import { emailBookingConfirmedClient, emailBookingConfirmedPro } from "@/lib/email";

export async function POST(request: NextRequest): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await updateBookingStatus(bookingId, "paid", {
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? undefined),
          paidAt: new Date(),
        });

        const booking = await getBookingById(bookingId);
        if (booking) {
          const emailData = {
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            proEmail: booking.proEmail,
            sessionType: booking.sessionType,
            sessionDate: booking.sessionDate,
            slotTime: booking.slotTime,
            sessionLocation: booking.sessionLocation,
            amountEuros: booking.amountEuros,
            proPayoutEuros: Math.round(booking.proPayoutCents) / 100,
          };
          await Promise.all([
            emailBookingConfirmedClient(emailData),
            emailBookingConfirmedPro(emailData),
          ]);
        }
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const db = getFirestore();
      const snap = await (await import("firebase/firestore")).getDocs(
        (await import("firebase/firestore")).query(
          (await import("firebase/firestore")).collection(db, "professionals"),
          (await import("firebase/firestore")).where("stripeAccountId", "==", account.id)
        )
      );

      if (!snap.empty) {
        const proDoc = snap.docs[0];
        const isActive =
          account.charges_enabled &&
          account.payouts_enabled &&
          account.details_submitted;

        const stripeAccountStatus: "pending" | "active" | "restricted" = isActive
          ? "active"
          : account.requirements?.disabled_reason
          ? "restricted"
          : "pending";

        await updateDoc(doc(db, "professionals", proDoc.id), { stripeAccountStatus });
      }
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
