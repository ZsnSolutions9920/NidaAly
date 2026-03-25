"use client";

import { useEffect, useState } from "react";

interface Analytics {
  revenue: number;
  totalOrders: number;
  paidOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  customerCount: number;
  topProducts: { productTitle: string; _sum: { quantity: number; totalPrice: number } }[];
  recentOrders: { id: string; orderNumber: string; email: string; grandTotal: number; currency: string; financialStatus: string; createdAt: string }[];
  ordersByStatus: { financialStatus: string; _count: number }[];
  lowStock: { id: string; inventoryQty: number; product: { title: string } }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);
    const res = await fetch(`/api/admin/analytics?${params}`);
    setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="p-8 text-medium-gray">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-medium-gray">Failed to load.</div>;

  const stats = [
    { label: "Total Revenue", value: `₨${(data.revenue / 100).toLocaleString()}`, sub: "from paid orders" },
    { label: "Total Orders", value: data.totalOrders.toString(), sub: `${data.paidOrders} paid` },
    { label: "Conversion Rate", value: `${data.conversionRate}%`, sub: "paid / total" },
    { label: "Avg Order Value", value: `₨${(data.avgOrderValue / 100).toLocaleString()}`, sub: "per paid order" },
    { label: "Customers", value: data.customerCount.toString(), sub: "registered" },
    { label: "Low Stock Items", value: data.lowStock.length.toString(), sub: "≤ 5 units" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex gap-3 items-center">
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))} className="border border-gray-200 px-3 py-1.5 text-sm focus:border-charcoal focus:outline-none" />
          <span className="text-medium-gray">to</span>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))} className="border border-gray-200 px-3 py-1.5 text-sm focus:border-charcoal focus:outline-none" />
          <button onClick={fetchData} className="bg-charcoal text-white px-4 py-1.5 text-sm hover:bg-gold transition-colors">Apply</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-5 border border-gray-100">
            <p className="text-xs text-medium-gray">{s.label}</p>
            <p className="text-2xl font-semibold mt-1">{s.value}</p>
            <p className="text-[11px] text-medium-gray mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="font-semibold mb-4">Orders by Payment Status</h2>
        <div className="flex gap-6">
          {data.ordersByStatus.map((s) => (
            <div key={s.financialStatus} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${s.financialStatus === "PAID" ? "bg-green-500" : s.financialStatus === "PENDING" ? "bg-yellow-500" : s.financialStatus === "REFUNDED" ? "bg-purple-500" : "bg-red-500"}`} />
              <span className="text-sm">{s.financialStatus}: <strong>{s._count}</strong></span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100"><h2 className="font-semibold">Top Selling Products</h2></div>
          <div className="p-4">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-medium-gray">No sales data yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-medium-gray text-left"><th className="pb-2">Product</th><th className="pb-2">Qty Sold</th><th className="pb-2">Revenue</th></tr></thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="py-2">{p.productTitle}</td>
                      <td className="py-2">{p._sum.quantity}</td>
                      <td className="py-2">₨{((p._sum.totalPrice ?? 0) / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100"><h2 className="font-semibold">Low Stock Alerts</h2></div>
          <div className="p-4">
            {data.lowStock.length === 0 ? (
              <p className="text-sm text-medium-gray">All stock levels healthy</p>
            ) : (
              <div className="space-y-3">
                {data.lowStock.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>{item.product.title}</span>
                    <span className={`font-medium ${item.inventoryQty === 0 ? "text-red-600" : "text-yellow-600"}`}>
                      {item.inventoryQty === 0 ? "OUT OF STOCK" : `${item.inventoryQty} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
