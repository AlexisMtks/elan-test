// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export const config = {
  api: {
    bodyParser: false, // pour gérer le raw body (utile surtout en pages dir)
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Webhook signature missing", { status: 400 });
  }

  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 🎯 Ici tu gèreras les différents événements :
  switch (event.type) {
    case "payment_intent.succeeded":
      // TODO: marquer la commande comme payée, etc.
      break;
    case "checkout.session.completed":
      // TODO
      break;
    case "account.updated":
      // TODO: suivre l’état KYC des vendeurs
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse("ok", { status: 200 });
}
