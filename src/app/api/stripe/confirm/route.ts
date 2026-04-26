import { NextRequest } from "next/server";
import { updateBookingStatus } from "@/lib/firestore";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Booking } from "@/lib/types";
import { emailPaymentReleasedPro } from "@/lib/email";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as { bookingId: string };
  const { bookingId } = body;

  if (!bookingId) {
    return Response.json({ error: "bookingId is required" }, { status: 400 });
  }

  const db = getFirestore();
  const snap = await getDoc(doc(db, "bookings", bookingId));

  if (!snap.exists()) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = { id: snap.id, ...snap.data() } as Booking;

  if (booking.status !== "paid") {
    return Response.json(
      { error: `Cannot confirm booking with status "${booking.status}"` },
      { status: 409 }
    );
  }

  await updateBookingStatus(bookingId, "released", { confirmedAt: new Date() });

  await emailPaymentReleasedPro({
    proEmail: booking.proEmail,
    clientName: booking.clientName,
    sessionType: booking.sessionType,
    sessionDate: booking.sessionDate,
    proPayoutEuros: Math.round(booking.proPayoutCents) / 100,
  });

  return Response.json({ success: true });
}
