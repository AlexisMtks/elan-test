// src/hooks/use-favorites-counter.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FavoritesChangedDetail = { listingId: string; next: boolean };

const FAVORITES_EVENT_NAME = "elan:favorites-changed";

export function useFavoritesCounter(userId?: string) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!userId) {
                if (!cancelled) setCount(0);
                return;
            }

            const { count, error } = await supabase
                .from("favorites")
                .select("listing_id", { count: "exact", head: true })
                .eq("user_id", userId);

            if (cancelled) return;

            if (error) {
                console.error("Erreur chargement compteur favoris :", error);
                setCount(0);
                return;
            }

            setCount(count ?? 0);
        };

        void load();

        // 🔔 Mise à jour live
        const handler = (event: Event) => {
            const custom = event as CustomEvent<FavoritesChangedDetail>;
            if (!custom.detail) return;

            const { next } = custom.detail;

            setCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
        };

        if (typeof window !== "undefined") {
            window.addEventListener(
                FAVORITES_EVENT_NAME,
                handler as EventListener,
            );
        }

        return () => {
            cancelled = true;
            if (typeof window !== "undefined") {
                window.removeEventListener(
                    FAVORITES_EVENT_NAME,
                    handler as EventListener,
                );
            }
        };
    }, [userId]);

    return count;
}