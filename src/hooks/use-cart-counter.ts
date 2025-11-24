"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const GUEST_CART_STORAGE_KEY = "elan_guest_cart_v1";
const CART_EVENT_NAME = "elan:cart-changed";

type CartChangedDetail = { listingId: string; next: boolean };

function readGuestCartFromStorage(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.sessionStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((id) => typeof id === "string");
    } catch {
        return [];
    }
}

export function useCartCounter(userId?: string) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            // 🧳 Invité → lecture depuis sessionStorage
            if (!userId) {
                const ids = readGuestCartFromStorage();
                if (!cancelled) setCount(ids.length);
                return;
            }

            // 👤 Utilisateur connecté → on compte les items du panier "open"
            const { data: cart, error: cartError } = await supabase
                .from("carts")
                .select("id")
                .eq("user_id", userId)
                .eq("status", "open")
                .maybeSingle();

            if (cancelled) return;

            if (cartError || !cart) {
                if (cartError) {
                    console.error("Erreur chargement compteur panier :", cartError);
                }
                setCount(0);
                return;
            }

            const { count, error: itemsError } = await supabase
                .from("cart_items")
                .select("id", { count: "exact", head: true })
                .eq("cart_id", cart.id);

            if (cancelled) return;

            if (itemsError) {
                console.error("Erreur comptage items panier :", itemsError);
                setCount(0);
                return;
            }

            setCount(count ?? 0);
        };

        void load();

        // 🔔 Mise à jour live via événement global
        const handler = (event: Event) => {
            const custom = event as CustomEvent<CartChangedDetail>;
            if (!custom.detail) return;

            const { next } = custom.detail;

            setCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
        };

        if (typeof window !== "undefined") {
            window.addEventListener(CART_EVENT_NAME, handler as EventListener);
        }

        return () => {
            cancelled = true;
            if (typeof window !== "undefined") {
                window.removeEventListener(
                    CART_EVENT_NAME,
                    handler as EventListener,
                );
            }
        };
    }, [userId]);

    return count;
}