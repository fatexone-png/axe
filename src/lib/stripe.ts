import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

export const PLATFORM_FEE_PERCENT = 15;

export function computeFee(amountCents: number): {
  proAmount: number;
  platformFee: number;
} {
  const platformFee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  const proAmount = amountCents - platformFee;
  return { proAmount, platformFee };
}
