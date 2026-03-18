"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  locale: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/customers?${params}`);
    const data = await res.json();
    setCustomers(data.items ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-200 px-4 py-2 text-sm w-64 focus:border-charcoal focus:outline-none"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-medium-gray">No customers found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-4 font-medium text-medium-gray">Customer</th>
                <th className="text-left p-4 font-medium text-medium-gray">Email</th>
                <th className="text-left p-4 font-medium text-medium-gray">Orders</th>
                <th className="text-left p-4 font-medium text-medium-gray">Region</th>
                <th className="text-left p-4 font-medium text-medium-gray">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-gold">
                      {c.firstName ?? ""} {c.lastName ?? ""}
                    </Link>
                  </td>
                  <td className="p-4 text-medium-gray">{c.email}</td>
                  <td className="p-4">{c._count.orders}</td>
                  <td className="p-4 uppercase text-medium-gray">{c.locale}</td>
                  <td className="p-4 text-medium-gray">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
