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
      individual: {
        first_name: "John", // Exemple
        last_name: "Doe",  // Exemple
        email: "email@example.com", // Exemple
        dob: { day: 1, month: 1, year: 1990 }, // Exemple
        address: {
          line1: "123 Rue de Paris", // Adresse
          postal_code: "75000", // Code postal
          city: "Paris", // Ville
          country: "FR", // Pays
        },
      },
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
  } catch (error: unknown) { // Déclare explicitement le type de l'erreur comme 'unknown'
    console.error("Erreur lors de la création du compte vendeur :", error);

    // Vérifie que 'error' est bien une instance de Error
    if (error instanceof Error) {
      // Renvoie une erreur sous forme de JSON valide
      return NextResponse.json(
        { error: "Erreur lors de l'activation du compte vendeur", details: error.message },
        { status: 500 }
      );
    } else {
      // Si l'erreur n'est pas une instance de Error, renvoie un message générique
      return NextResponse.json(
        { error: "Erreur inconnue lors de l'activation du compte vendeur" },
        { status: 500 }
      );
    }
  }
}
