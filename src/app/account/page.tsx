"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";

interface Order {
  id: string;
  orderNumber: string;
  grandTotal: number;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  items: { productTitle: string; quantity: number; productImageUrl: string | null }[];
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatPrice } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-[60vh] flex items-center justify-center text-medium-gray">Loading...</div>;
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl tracking-[0.15em] uppercase font-light">My Account</h1>
          <p className="text-sm text-medium-gray mt-1">{session?.user?.email}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/account/wishlist" className="text-sm underline hover:text-gold transition-colors">
            Wishlist
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-medium-gray hover:text-charcoal transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <h2 className="text-lg tracking-[0.1em] uppercase font-light mb-6 border-b border-gray-100 pb-4">
        Order History
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-light-gray animate-pulse rounded" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-medium-gray mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="inline-block border border-charcoal px-8 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-medium-gray">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatPrice(order.grandTotal)}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      order.financialStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.financialStatus}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      order.fulfillmentStatus === "FULFILLED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {order.fulfillmentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-medium-gray">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.productTitle} x{item.quantity}
                    {i < order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
