// src/app/account/page.tsx
import { AccountPageClient } from "@/components/account/account-page-client";
import { AccountHeader } from "@/components/account/account-header";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { useState } from "react";

export default function AccountPage() {
    const [isSellerActivated, setIsSellerActivated] = useState(false);

    // Logique pour activer le compte vendeur
    const handleActivateSellerAccount = async () => {
        // Ici, tu vas appeler ton API backend qui va créer le compte Stripe Express et renvoyer l'URL d'onboarding
        try {
            const response = await fetch("/api/stripe/connect/onboard", {
                method: "POST",
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url; // Redirige l'utilisateur vers la page d'onboarding Stripe
            } else {
                alert("Une erreur est survenue lors de l'activation du compte vendeur.");
            }
        } catch (error) {
            console.error("Erreur lors de l'activation du compte vendeur : ", error);
            alert("Erreur lors de l'activation du compte vendeur.");
        }
    };

    return (
        <div className="space-y-3">
            <AccountHeader />
            <AccountPageClient />
            
            {/* Ajouter le bouton pour activer le compte vendeur */}
            {!isSellerActivated && (
                <div className="mt-4">
                    <button
                        onClick={handleActivateSellerAccount}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Activer mon compte vendeur
                    </button>
                </div>
            )}

            {/* Si l'utilisateur a déjà un compte vendeur */}
            {isSellerActivated && (
                <p className="text-green-500">Votre compte vendeur est activé !</p>
            )}

            {/* Sidebar des informations du compte */}
            <AccountSidebar stats={{ listings: 5, sales: 10, purchases: 2 }} ratingAvg={4.5} reviewsCount={12} reviews={[]} />
        </div>
    );
}
