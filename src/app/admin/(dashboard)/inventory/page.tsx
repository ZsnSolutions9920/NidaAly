"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface InventoryItem {
  id: string;
  title: string;
  sku: string | null;
  inventoryQty: number;
  option1: string | null;
  option2: string | null;
  product: { id: string; title: string; slug: string; status: string };
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editedQty, setEditedQty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (lowStockOnly) params.set("lowStock", "true");
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/inventory?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [lowStockOnly, search]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleQtyChange = (variantId: string, value: string) => {
    setEditedQty((prev) => ({ ...prev, [variantId]: value }));
  };

  const saveChanges = async () => {
    const updates = Object.entries(editedQty)
      .filter(([, val]) => val !== "")
      .map(([variantId, quantity]) => ({ variantId, quantity: parseInt(quantity) || 0 }));

    if (updates.length === 0) return;

    setSaving(true);
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setEditedQty({});
    setSaving(false);
    fetchInventory();
  };

  const hasChanges = Object.keys(editedQty).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        {hasChanges && (
          <button
            onClick={saveChanges}
            disabled={saving}
            className="bg-charcoal text-white px-6 py-2 text-sm tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : `Save Changes (${Object.keys(editedQty).length})`}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search by product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm w-64 focus:border-charcoal focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="accent-charcoal"
          />
          Low stock only (≤ 5)
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading inventory...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-medium-gray">No items found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-4 font-medium text-medium-gray">Product</th>
                <th className="text-left p-4 font-medium text-medium-gray">Variant</th>
                <th className="text-left p-4 font-medium text-medium-gray">SKU</th>
                <th className="text-left p-4 font-medium text-medium-gray">Status</th>
                <th className="text-left p-4 font-medium text-medium-gray w-32">Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const currentQty = editedQty[item.id] !== undefined
                  ? parseInt(editedQty[item.id]) || 0
                  : item.inventoryQty;
                const isEdited = editedQty[item.id] !== undefined;

                return (
                  <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${isEdited ? "bg-yellow-50" : ""}`}>
                    <td className="p-4">
                      <Link href={`/products/${item.product.slug}`} className="hover:text-gold" target="_blank">
                        {item.product.title}
                      </Link>
                    </td>
                    <td className="p-4 text-medium-gray">
                      {item.title}
                      {item.option1 && item.title !== item.option1 ? ` (${item.option1})` : ""}
                    </td>
                    <td className="p-4 font-mono text-medium-gray text-xs">{item.sku ?? "-"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        currentQty === 0 ? "bg-red-100 text-red-700"
                          : currentQty <= 5 ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {currentQty === 0 ? "Out of stock" : currentQty <= 5 ? "Low" : "In stock"}
                      </span>
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editedQty[item.id] ?? item.inventoryQty}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        min={0}
                        className={`w-24 border p-1.5 text-sm text-center focus:border-charcoal focus:outline-none ${
                          isEdited ? "border-gold bg-yellow-50" : "border-gray-200"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div className="flex gap-6 text-sm text-medium-gray">
          <span>Total variants: {items.length}</span>
          <span>Out of stock: {items.filter((i) => i.inventoryQty === 0).length}</span>
          <span>Low stock: {items.filter((i) => i.inventoryQty > 0 && i.inventoryQty <= 5).length}</span>
        </div>
      )}
    </div>
  );
}
