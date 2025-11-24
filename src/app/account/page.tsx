// src/app/account/page.tsx
"use client"; // Ajoute cette ligne au tout début du fichier

import { AccountPageClient } from "@/components/account/account-page-client";
import { AccountHeader } from "@/components/account/account-header";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { useState } from "react";

const handleActivateSellerAccount = async () => {
    try {
        const response = await fetch("/api/stripe/connect/onboard", {
            method: "POST",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Une erreur est survenue");
        }

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url; // Redirige l'utilisateur vers la page d'onboarding Stripe
        } else {
            alert("Une erreur est survenue lors de l'activation du compte vendeur.");
        }
    } catch (error: unknown) {
        console.error("Erreur lors de l'activation du compte vendeur : ", error);

        // Vérifie que 'error' est bien une instance de Error
        if (error instanceof Error) {
            alert(`Erreur lors de l'activation du compte vendeur : ${error.message}`);
        } else {
            alert("Erreur lors de l'activation du compte vendeur : Un problème est survenu.");
        }
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

            {isSellerActivated && (
                <p className="text-green-500">Votre compte vendeur est activé !</p>
            )}

            <AccountSidebar stats={{ listings: 5, sales: 10, purchases: 2 }} ratingAvg={4.5} reviewsCount={12} reviews={[]} />
        </div>
    );
}
