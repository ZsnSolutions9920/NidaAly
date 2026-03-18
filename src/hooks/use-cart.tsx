"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useLocale } from "./use-locale";

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant: {
    id: string;
    title: string;
    sku: string | null;
    option1: string | null;
    option2: string | null;
    pricePKR: number;
    priceAED: number | null;
    priceUSD: number | null;
    inventoryQty: number;
    product: {
      title: string;
      slug: string;
      images: { url: string; altText: string | null }[];
    };
    image: { url: string; altText: string | null } | null;
  };
}

interface CartContext {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isUpdating: boolean;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`/api/cart?locale=${locale}`);
      const data = await res.json();
      setItems(data.lineItems ?? []);
      setItemCount(data.itemCount ?? 0);
      setSubtotal(data.subtotal ?? 0);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsUpdating(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity, locale }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to add to cart");
        }
        const data = await res.json();
        setItems(data.lineItems ?? []);
        setItemCount(data.itemCount ?? 0);
        setSubtotal(data.subtotal ?? 0);
      } finally {
        setIsUpdating(false);
      }
    },
    [locale]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      setIsUpdating(true);
      try {
        await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity }),
        });
        await fetchCart();
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchCart]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      setIsUpdating(true);
      try {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId }),
        });
        await fetchCart();
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchCart]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        isUpdating,
        addToCart,
        updateQuantity,
        removeItem,
        refresh: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
