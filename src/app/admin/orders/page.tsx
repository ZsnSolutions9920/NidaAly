"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  grandTotal: number;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: { quantity: number }[];
  user: { firstName: string; lastName: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [financialFilter, setFinancialFilter] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (financialFilter) params.set("financialStatus", financialFilter);
    if (fulfillmentFilter) params.set("fulfillmentStatus", fulfillmentFilter);

    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.items ?? []);
    setLoading(false);
  }, [search, financialFilter, fulfillmentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const currencySymbol = (c: string) =>
    c === "PKR" ? "₨" : c === "AED" ? "د.إ" : "$";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by order # or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm w-64 focus:border-charcoal focus:outline-none"
        />
        <select
          value={financialFilter}
          onChange={(e) => setFinancialFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm bg-white"
        >
          <option value="">All Payments</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select
          value={fulfillmentFilter}
          onChange={(e) => setFulfillmentFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm bg-white"
        >
          <option value="">All Fulfillment</option>
          <option value="UNFULFILLED">Unfulfilled</option>
          <option value="PARTIALLY_FULFILLED">Partial</option>
          <option value="FULFILLED">Fulfilled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-medium-gray">
            No orders found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-4 font-medium text-medium-gray">Order</th>
                <th className="text-left p-4 font-medium text-medium-gray">Date</th>
                <th className="text-left p-4 font-medium text-medium-gray">Customer</th>
                <th className="text-left p-4 font-medium text-medium-gray">Total</th>
                <th className="text-left p-4 font-medium text-medium-gray">Payment</th>
                <th className="text-left p-4 font-medium text-medium-gray">Fulfillment</th>
                <th className="text-left p-4 font-medium text-medium-gray">Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="p-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-charcoal hover:text-gold"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-medium-gray">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : order.email}
                  </td>
                  <td className="p-4 font-medium">
                    {currencySymbol(order.currency)}
                    {(order.grandTotal / 100).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.financialStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : order.financialStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.financialStatus === "REFUNDED"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.financialStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.fulfillmentStatus === "FULFILLED"
                          ? "bg-green-100 text-green-700"
                          : order.fulfillmentStatus === "PARTIALLY_FULFILLED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-medium-gray">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items
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
