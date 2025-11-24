// src/app/api/stripe/connect/onboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server"; // Assure-toi que cette importation pointe vers ta config Stripe

export const config = {
  api: {
    bodyParser: false, // ne pas utiliser le bodyParser Next.js
  },
};

export async function POST(req: NextRequest) {
  try {
    // Créer un compte Stripe Express
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR", // ou le pays de l'utilisateur
      business_type: "individual", // pour un compte vendeur personnel
    });

    // Créer un lien d'onboarding Stripe
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
      type: "account_onboarding",
    });

    // Retourner l'URL pour l'onboarding
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Erreur lors de la création du compte vendeur :", error);
    return new NextResponse("Erreur lors de l'activation du compte vendeur", { status: 500 });
  }
}
