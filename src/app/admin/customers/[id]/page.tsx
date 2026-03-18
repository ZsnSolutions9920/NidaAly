"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CustomerDetail {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  locale: string;
  currency: string;
  createdAt: string;
  lifetimeValue: number;
  _count: { orders: number; wishlist: number; reviews: number };
  addresses: { id: string; address1: string; city: string; country: string }[];
  orders: {
    id: string;
    orderNumber: string;
    grandTotal: number;
    currency: string;
    financialStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
  }[];
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then(setCustomer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-medium-gray">Loading...</div>;
  if (!customer) return <div className="p-8 text-medium-gray">Customer not found</div>;

  const sym = customer.currency === "PKR" ? "₨" : customer.currency === "AED" ? "د.إ" : "$";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="text-medium-gray hover:text-charcoal">&larr;</Link>
        <h1 className="text-2xl font-semibold">
          {customer.firstName} {customer.lastName}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Lifetime Value", value: `${sym}${(customer.lifetimeValue / 100).toLocaleString()}` },
          { label: "Orders", value: customer._count.orders.toString() },
          { label: "Wishlist Items", value: customer._count.wishlist.toString() },
          { label: "Reviews", value: customer._count.reviews.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-xs text-medium-gray">{s.label}</p>
            <p className="text-xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="font-semibold mb-4">Contact</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-medium-gray">Email:</span> {customer.email}</div>
          <div><span className="text-medium-gray">Phone:</span> {customer.phone ?? "N/A"}</div>
          <div><span className="text-medium-gray">Region:</span> {customer.locale.toUpperCase()}</div>
          <div><span className="text-medium-gray">Joined:</span> {new Date(customer.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h2 className="font-semibold">Orders</h2></div>
        {customer.orders.length === 0 ? (
          <div className="p-6 text-sm text-medium-gray">No orders yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-3 font-medium text-medium-gray">Order</th>
                <th className="text-left p-3 font-medium text-medium-gray">Date</th>
                <th className="text-left p-3 font-medium text-medium-gray">Total</th>
                <th className="text-left p-3 font-medium text-medium-gray">Payment</th>
                <th className="text-left p-3 font-medium text-medium-gray">Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-gold">{o.orderNumber}</Link>
                  </td>
                  <td className="p-3 text-medium-gray">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{sym}{(o.grandTotal / 100).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${o.financialStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {o.financialStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${o.fulfillmentStatus === "FULFILLED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {o.fulfillmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
