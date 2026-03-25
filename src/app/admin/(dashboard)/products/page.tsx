"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  slug: string;
  status: string;
  productType: string | null;
  pricePKR: number | null;
  inventoryTotal?: number;
  images: { url: string }[];
  variants: { inventoryQty: number; pricePKR: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.items ?? []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkAction = async (status: string) => {
    if (selected.size === 0) return;
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        ids: Array.from(selected),
        status,
      }),
    });
    setSelected(new Set());
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-charcoal text-white px-6 py-2 text-sm tracking-wider hover:bg-gold transition-colors"
        >
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm w-64 focus:border-charcoal focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm bg-white focus:border-charcoal focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {selected.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <span className="text-sm text-medium-gray self-center">
              {selected.size} selected
            </span>
            <button
              onClick={() => bulkAction("ACTIVE")}
              className="text-sm px-3 py-1 border border-green-500 text-green-700 hover:bg-green-50"
            >
              Activate
            </button>
            <button
              onClick={() => bulkAction("ARCHIVED")}
              className="text-sm px-3 py-1 border border-red-500 text-red-700 hover:bg-red-50"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-medium-gray">
            No products found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(new Set(products.map((p) => p.id)));
                      } else {
                        setSelected(new Set());
                      }
                    }}
                  />
                </th>
                <th className="text-left p-4 font-medium text-medium-gray">
                  Product
                </th>
                <th className="text-left p-4 font-medium text-medium-gray">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-medium-gray">
                  Inventory
                </th>
                <th className="text-left p-4 font-medium text-medium-gray">
                  Type
                </th>
                <th className="text-left p-4 font-medium text-medium-gray">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalInventory = product.variants.reduce(
                  (sum, v) => sum + v.inventoryQty,
                  0
                );
                const price = product.variants[0]?.pricePKR ?? product.pricePKR ?? 0;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium hover:text-gold"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : product.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          totalInventory <= 5 ? "text-red-600 font-medium" : ""
                        }
                      >
                        {totalInventory} in stock
                      </span>
                    </td>
                    <td className="p-4 text-medium-gray">
                      {product.productType ?? "-"}
                    </td>
                    <td className="p-4">
                      ₨{(price / 100).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
