"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, MouseEvent } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCartCounter } from "@/hooks/use-cart-counter";
import { useFavoritesCounter } from "@/hooks/use-favorites-counter";
import { useCartPreview } from "@/hooks/use-cart-preview";
import { useFavoritesPreview } from "@/hooks/use-favorites-preview";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export function FloatingActions() {
    const { user, checking } = useCurrentUser();
    const userId = user?.id;
    const router = useRouter();
    const pathname = usePathname();

    const [cartOpen, setCartOpen] = useState(false);
    const [favoritesOpen, setFavoritesOpen] = useState(false);

    const cartCount = useCartCounter(userId);
    const favoritesCount = useFavoritesCounter(userId);

    const { items: cartItems, loading: cartLoading } = useCartPreview(userId);
    const {
        items: favoritesItems,
        loading: favoritesLoading,
    } = useFavoritesPreview(userId);

    // 🔹 On récupère aussi isInCart / isFavorite pour gérer l’état des icônes
    const { toggleCart, isInCart } = useCart(userId);
    const { toggleFavorite, isFavorite } = useFavorites(userId);

    const hideOnRoutes = ["/login", "/register", "/logout"];
    if (hideOnRoutes.includes(pathname)) {
        return null;
    }

    if (checking) {
        return null;
    }

    const handleGoToCart = () => {
        setCartOpen(false);
        setFavoritesOpen(false);
        router.push("/cart");
    };

    const handleGoToFavorites = () => {
        setFavoritesOpen(false);
        router.push("/favorites");
    };

    const handleRemoveFromCart = async (
        e: MouseEvent<HTMLButtonElement>,
        listingId: string,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleCart(listingId, false);
    };

    const handleRemoveFromFavorites = async (
        e: MouseEvent<HTMLButtonElement>,
        listingId: string,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userId) return;
        await toggleFavorite(listingId, false);
    };

    const handleToggleFavoriteFromCart = async (
        e: MouseEvent<HTMLButtonElement>,
        listingId: string,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userId) return;
        const current = isFavorite(listingId);
        await toggleFavorite(listingId, !current);
    };

    const handleToggleCartFromFavorites = async (
        e: MouseEvent<HTMLButtonElement>,
        listingId: string,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        const current = isInCart(listingId);
        await toggleCart(listingId, !current);
    };

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
            {/* ❤️ Favoris (si connecté) */}
            {user && (
                <DropdownMenu
                    open={favoritesOpen}
                    onOpenChange={setFavoritesOpen}
                >
                    <DropdownMenuTrigger asChild>
                        <div className="pointer-events-auto relative">
                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-12 w-12 rounded-full shadow-lg"
                                aria-label="Mes favoris"
                            >
                                <Heart className="h-5 w-5" />
                            </Button>

                            {favoritesCount > 0 && (
                                <span
                                    className="
                    absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center
                    rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground
                    shadow
                  "
                                >
                  {favoritesCount}
                </span>
                            )}
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="top"
                        align="end"
                        className="w-80 rounded-2xl border bg-popover p-3 shadow-lg"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Mes favoris</p>
                                {favoritesCount > 0 && (
                                    <span className="text-xs text-muted-foreground">
                    {favoritesCount} article
                                        {favoritesCount > 1 ? "s" : ""}
                  </span>
                                )}
                            </div>

                            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                {favoritesLoading ? (
                                    <p className="text-xs text-muted-foreground">
                                        Chargement des favoris…
                                    </p>
                                ) : favoritesItems.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        Vous n’avez pas encore de favoris.
                                    </p>
                                ) : (
                                    favoritesItems.map((item) => {
                                        const inCart = isInCart(item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-xs"
                                            >
                                                <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                    {item.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                                            Photo
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex min-w-0 flex-1 flex-col">
                                                    <p className="line-clamp-2 text-[11px] font-medium">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                        {(item.price / 100).toFixed(2)} €
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            void handleToggleCartFromFavorites(e, item.id)
                                                        }
                                                        className={[
                                                            "inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground transition",
                                                            inCart
                                                                ? "border-primary/60 bg-primary/10 text-primary"
                                                                : "hover:text-primary",
                                                        ].join(" ")}
                                                        aria-label={
                                                            inCart ? "Retirer du panier" : "Ajouter au panier"
                                                        }
                                                    >
                                                        <ShoppingCart
                                                            className={[
                                                                "h-3 w-3",
                                                                inCart ? "fill-current" : "",
                                                            ].join(" ")}
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            void handleRemoveFromFavorites(e, item.id)
                                                        }
                                                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground transition hover:text-destructive"
                                                        aria-label="Retirer des favoris"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                                <button
                                type="button"
                                onClick={handleGoToFavorites}
                                className="w-full rounded-full border bg-background px-3 py-1.5 text-center text-xs font-medium hover:bg-accent"
                            >
                                Voir tous les favoris
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* 🛒 Panier */}
            <DropdownMenu open={cartOpen} onOpenChange={setCartOpen}>
                <DropdownMenuTrigger asChild>
                    <div className="pointer-events-auto relative">
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-12 w-12 rounded-full shadow-lg"
                            aria-label="Mon panier"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </Button>

                        {cartCount > 0 && (
                            <span
                                className="
                  absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center
                  rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground
                  shadow
                "
                            >
                {cartCount}
              </span>
                        )}
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="top"
                    align="end"
                    className="w-80 rounded-2xl border bg-popover p-3 shadow-lg"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Mon panier</p>
                            {cartCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                  {cartCount} article{cartCount > 1 ? "s" : ""}
                </span>
                            )}
                        </div>

                        {/* max d’éléments + scroll */}
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {cartLoading ? (
                                <p className="text-xs text-muted-foreground">
                                    Chargement du panier…
                                </p>
                            ) : cartItems.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Votre panier est vide.
                                </p>
                            ) : (
                                cartItems.map((item) => {
                                    const favActive = user ? isFavorite(item.id) : false;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-xs"
                                        >
                                            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                {item.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                                        Photo
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <p className="line-clamp-2 text-[11px] font-medium">
                                                    {item.title}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {(item.price / 100).toFixed(2)} €
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                {user && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            void handleToggleFavoriteFromCart(e, item.id)
                                                        }
                                                        className={[
                                                            "inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground transition",
                                                            favActive
                                                                ? "border-primary/60 bg-primary/10 text-primary"
                                                                : "hover:text-primary",
                                                        ].join(" ")}
                                                        aria-label={
                                                            favActive
                                                                ? "Retirer des favoris"
                                                                : "Ajouter aux favoris"
                                                        }
                                                    >
                                                        <Heart
                                                            className={[
                                                                "h-3 w-3",
                                                                favActive ? "fill-current" : "",
                                                            ].join(" ")}
                                                        />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        void handleRemoveFromCart(e, item.id)
                                                    }
                                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground transition hover:text-destructive"
                                                    aria-label="Retirer du panier"
                                                >
                                                    <Trash2 className="h-3 w-3"/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleGoToCart}
                                className="w-full rounded-full border bg-background px-3 py-1.5 text-center text-xs font-medium hover:bg-accent"
                            >
                                Voir le panier
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToCart}
                                className="w-full rounded-full border bg-background px-3 py-1.5 text-center text-xs font-medium hover:bg-accent"
                            >
                                Commander
                            </button>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}