"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

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
  collections?: { collection: { id: string; title: string } }[];
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
          className="bg-charcoal text-white px-6 py-2 text-sm tracking-wider hover:bg-gold transition-colors rounded-lg"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm w-64 focus:border-charcoal focus:outline-none rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm bg-white focus:border-charcoal focus:outline-none rounded"
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
              className="text-sm px-3 py-1 border border-green-500 text-green-700 hover:bg-green-50 rounded"
            >
              Activate
            </button>
            <button
              onClick={() => bulkAction("ARCHIVED")}
              className="text-sm px-3 py-1 border border-red-500 text-red-700 hover:bg-red-50 rounded"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-medium-gray">No products found</p>
            <Link href="/admin/products/new" className="text-sm text-gold hover:underline mt-2 inline-block">
              Create your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
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
                <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">
                  Inventory
                </th>
                <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left p-4 font-medium text-medium-gray text-xs uppercase tracking-wider">
                  Actions
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
                const hasImage = product.images.length > 0;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          {hasImage ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium hover:text-gold transition-colors"
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs text-medium-gray mt-0.5">{product.productType ?? "No type"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : product.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.status === "ACTIVE" ? "bg-emerald-500" : product.status === "DRAFT" ? "bg-amber-500" : "bg-gray-400"
                        }`} />
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {product.collections && product.collections.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.collections.map((c) => (
                            <span key={c.collection.id} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">
                              {c.collection.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-medium-gray text-xs">Uncategorized</span>
                      )}
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
                    <td className="p-4 font-medium">
                      ₨{(price / 100).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-charcoal text-white rounded hover:bg-gold transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
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
