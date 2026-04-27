import { NextRequest } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { updateBookingStatus } from "@/lib/firestore";
import { emailPaymentReleasedPro } from "@/lib/email";
import { Booking } from "@/lib/types";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!db) {
    return Response.json({ error: "Firebase non configuré." }, { status: 500 });
  }
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString().split("T")[0];

  const snap = await getDocs(
    query(collection(db, "bookings"), where("status", "==", "paid"))
  );

  const toRelease = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Booking))
    .filter((b) => b.sessionDate <= sevenDaysAgoISO);

  let released = 0;
  for (const booking of toRelease) {
    try {
      await updateBookingStatus(booking.id!, "released", { confirmedAt: new Date() });
      await emailPaymentReleasedPro({
        proEmail: booking.proEmail,
        clientName: booking.clientName,
        sessionType: booking.sessionType,
        sessionDate: booking.sessionDate,
        proPayoutEuros: Math.round(booking.proPayoutCents) / 100,
      });
      released++;
    } catch (err) {
      console.error(`[cron] Erreur libération booking ${booking.id}:`, err);
    }
  }

  console.log(`[cron/release-payments] ${released}/${toRelease.length} paiements libérés.`);
  return Response.json({ released, checked: snap.size });
}
