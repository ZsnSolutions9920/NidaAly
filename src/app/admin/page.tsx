"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

function StatIcon({ type }: { type: string }) {
  const cls = "w-5 h-5";
  switch (type) {
    case "revenue":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "orders":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "rate":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "customers":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return null;
  }
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
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return <p>Failed to load dashboard data.</p>;

  const stats = [
    {
      label: "Total Revenue",
      value: `₨${(data.revenue / 100).toLocaleString()}`,
      icon: "revenue",
      color: "bg-emerald-50 text-emerald-600",
      change: `${data.paidOrders} paid orders`,
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toString(),
      icon: "orders",
      color: "bg-blue-50 text-blue-600",
      change: `₨${(data.avgOrderValue / 100).toLocaleString()} avg`,
    },
    {
      label: "Conversion Rate",
      value: `${data.conversionRate}%`,
      icon: "rate",
      color: "bg-amber-50 text-amber-600",
      change: "Paid / Total",
    },
    {
      label: "Customers",
      value: data.customerCount.toString(),
      icon: "customers",
      color: "bg-purple-50 text-purple-600",
      change: "Registered accounts",
    },
  ];

  const maxSold = Math.max(...data.topProducts.map((p) => p._sum.quantity), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-medium-gray mt-1">Welcome back. Here&apos;s your store overview.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="bg-charcoal text-white px-5 py-2.5 text-sm tracking-wider hover:bg-gold transition-colors rounded-lg"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <StatIcon type={stat.icon} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-sm text-medium-gray mt-1">{stat.label}</p>
            <p className="text-xs text-medium-gray/70 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-gold hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          {data.recentOrders.length === 0 ? (
            <div className="p-12 text-center text-medium-gray">
              <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">Order</th>
                  <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">Payment</th>
                  <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">Fulfillment</th>
                  <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-charcoal hover:text-gold transition-colors">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-medium-gray">{order.email}</td>
                    <td className="p-4 font-medium">
                      {order.currency === "PKR" ? "₨" : order.currency === "AED" ? "د.إ" : "$"}
                      {(order.grandTotal / 100).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.financialStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.financialStatus === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.financialStatus === "PAID"
                            ? "bg-emerald-500"
                            : order.financialStatus === "PENDING"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`} />
                        {order.financialStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.fulfillmentStatus === "FULFILLED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.fulfillmentStatus === "FULFILLED" ? "bg-emerald-500" : "bg-gray-400"
                        }`} />
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-medium-gray">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Two-column: Top Products + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products with visual bars */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-gold hover:underline">View All</Link>
          </div>
          <div className="p-6 space-y-5">
            {data.topProducts.map((p, i) => {
              const pct = (p._sum.quantity / maxSold) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium truncate mr-4">{p.productTitle}</span>
                    <span className="text-sm text-medium-gray whitespace-nowrap">
                      {p._sum.quantity} sold
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-charcoal to-gold h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.topProducts.length === 0 && (
              <div className="text-center py-6">
                <svg className="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-medium-gray">No sales data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="text-sm text-gold hover:underline">Manage</Link>
          </div>
          <div className="p-6 space-y-3">
            {data.lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{item.product.title}</span>
                </div>
                <span className="text-sm text-red-600 font-bold">
                  {item.inventoryQty} left
                </span>
              </div>
            ))}
            {data.lowStock.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-medium-gray">All stock levels healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Add Product", href: "/admin/products/new", icon: "M12 4v16m8-8H4" },
            { label: "View Orders", href: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "Manage Inventory", href: "/admin/inventory", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
            { label: "Create Discount", href: "/admin/discounts", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-charcoal hover:bg-gray-50 transition-all group"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-charcoal group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                </svg>
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
