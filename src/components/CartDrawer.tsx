"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { useLocale } from "@/hooks/use-locale";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, itemCount, subtotal, isUpdating, updateQuantity, removeItem } =
    useCart();
  const { formatPrice } = useLocale();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold tracking-wide">
            YOUR BAG ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-charcoal hover:text-gold transition-colors"
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-medium-gray mb-4">Your bag is empty</p>
              <button
                onClick={onClose}
                className="text-sm underline text-charcoal hover:text-gold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imageUrl =
                item.variant.image?.url ??
                item.variant.product.images[0]?.url ??
                "/placeholder.jpg";

              return (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-light-gray flex-shrink-0 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={item.variant.product.title}
                      width={80}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.variant.product.title}
                    </p>
                    {item.variant.title !== "Default" && (
                      <p className="text-xs text-medium-gray mt-0.5">
                        {item.variant.title}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(item.unitPrice)}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={isUpdating}
                        className="w-7 h-7 border border-gray-200 flex items-center justify-center text-sm hover:border-charcoal disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isUpdating}
                        className="w-7 h-7 border border-gray-200 flex items-center justify-center text-sm hover:border-charcoal disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium">
                      {formatPrice(item.lineTotal)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isUpdating}
                      className="text-xs text-medium-gray hover:text-red-500 mt-auto disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-medium-gray">Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-medium-gray">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-charcoal text-white text-center py-3 text-sm tracking-wider hover:bg-gold transition-colors"
            >
              CHECKOUT
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
