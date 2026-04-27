import { NextRequest } from "next/server";
import { updateBookingStatus, createNotification } from "@/lib/firestore";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Booking } from "@/lib/types";
import { emailPaymentReleasedPro } from "@/lib/email";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as { bookingId: string; clientEmail: string };
  const { bookingId, clientEmail } = body;

  if (!bookingId || !clientEmail) {
    return Response.json({ error: "bookingId et clientEmail sont requis." }, { status: 400 });
  }

  const db = getFirestore();
  const snap = await getDoc(doc(db, "bookings", bookingId));

  if (!snap.exists()) {
    return Response.json({ error: "Réservation introuvable." }, { status: 404 });
  }

  const booking = { id: snap.id, ...snap.data() } as Booking;

  if (booking.clientEmail.toLowerCase() !== clientEmail.toLowerCase()) {
    return Response.json({ error: "Non autorisé." }, { status: 403 });
  }

  if (booking.status !== "paid") {
    return Response.json(
      { error: `Impossible de confirmer une réservation avec le statut "${booking.status}".` },
      { status: 409 }
    );
  }

  await updateBookingStatus(bookingId, "released", { confirmedAt: new Date() });

  await Promise.all([
    emailPaymentReleasedPro({
      proEmail: booking.proEmail,
      clientName: booking.clientName,
      sessionType: booking.sessionType,
      sessionDate: booking.sessionDate,
      proPayoutEuros: Math.round(booking.proPayoutCents) / 100,
    }),
    createNotification({
      userId: booking.proEmail,
      type: "payment_released",
      title: "Paiement débloqué",
      body: `Le paiement de ${Math.round(booking.proPayoutCents) / 100} € pour la séance "${booking.sessionType}" avec ${booking.clientName} a été libéré.`,
      read: false,
      link: `/dashboard`,
    }),
  ]);

  return Response.json({ success: true });
}
