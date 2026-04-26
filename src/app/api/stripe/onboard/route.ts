import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProfessionalById } from "@/lib/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function requireDb() {
  if (!db) throw new Error("Firebase not initialised");
  return db;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as {
      proId: string;
      email: string;
      name: string;
    };

    const { proId, email, name } = body;

    if (!proId || !email || !name) {
      return Response.json({ error: "proId, email et name sont requis." }, { status: 400 });
    }

    const pro = await getProfessionalById(proId);

    let stripeAccountId: string;

    if (pro?.stripeAccountId) {
      stripeAccountId = pro.stripeAccountId;
    } else {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        business_profile: { name },
        country: "FR",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      await updateDoc(doc(requireDb(), "professionals", proId), {
        stripeAccountId,
        stripeAccountStatus: "pending",
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${BASE_URL}/dashboard?stripe=refresh`,
      return_url: `${BASE_URL}/dashboard?stripe=success`,
      type: "account_onboarding",
    });

    return Response.json({ url: accountLink.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne.";
    console.error("[stripe/onboard]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
