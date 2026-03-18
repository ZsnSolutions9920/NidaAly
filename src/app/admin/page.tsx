"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  revenue: number;
  totalOrders: number;
  paidOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  customerCount: number;
  topProducts: { productTitle: string; _sum: { quantity: number; totalPrice: number } }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    email: string;
    grandTotal: number;
    currency: string;
    financialStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
  }[];
  lowStock: {
    id: string;
    inventoryQty: number;
    product: { title: string; slug: string };
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p>Failed to load dashboard data.</p>;

  const stats = [
    { label: "Total Revenue", value: `₨${(data.revenue / 100).toLocaleString()}` },
    { label: "Orders", value: data.totalOrders.toString() },
    { label: "Conversion Rate", value: `${data.conversionRate}%` },
    { label: "Customers", value: data.customerCount.toString() },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
          >
            <p className="text-sm text-medium-gray">{stat.label}</p>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-medium-gray">Order</th>
                <th className="text-left p-4 font-medium text-medium-gray">Customer</th>
                <th className="text-left p-4 font-medium text-medium-gray">Total</th>
                <th className="text-left p-4 font-medium text-medium-gray">Payment</th>
                <th className="text-left p-4 font-medium text-medium-gray">Fulfillment</th>
                <th className="text-left p-4 font-medium text-medium-gray">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium">{order.orderNumber}</td>
                  <td className="p-4">{order.email}</td>
                  <td className="p-4">
                    {order.currency === "PKR" ? "₨" : order.currency === "AED" ? "د.إ" : "$"}
                    {(order.grandTotal / 100).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.financialStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : order.financialStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
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
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-medium-gray">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column: Top Products + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm">{p.productTitle}</span>
                <span className="text-sm text-medium-gray">
                  {p._sum.quantity} sold
                </span>
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <p className="text-sm text-medium-gray">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="p-6 space-y-4">
            {data.lowStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-sm">{item.product.title}</span>
                <span className="text-sm text-red-600 font-medium">
                  {item.inventoryQty} left
                </span>
              </div>
            ))}
            {data.lowStock.length === 0 && (
              <p className="text-sm text-medium-gray">All stock levels healthy</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
