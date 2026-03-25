"use client";

import { useEffect, useState, useCallback } from "react";

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  currency: string | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  appliesToAll: boolean;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
    value: 0,
    minOrderAmount: "",
    maxUses: "",
    endsAt: "",
  });

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discounts");
    const data = await res.json();
    setDiscounts(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const handleCreate = async () => {
    if (!form.code.trim() || form.value <= 0) return;
    setCreating(true);
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.value,
        minOrderAmount: form.minOrderAmount ? parseInt(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        endsAt: form.endsAt || undefined,
      }),
    });
    if (res.ok) {
      setForm({ code: "", type: "PERCENTAGE", value: 0, minOrderAmount: "", maxUses: "", endsAt: "" });
      setShowCreate(false);
    }
    setCreating(false);
    fetchDiscounts();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount code?")) return;
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    fetchDiscounts();
  };

  const formatValue = (d: Discount) => {
    if (d.type === "PERCENTAGE") return `${d.value}%`;
    if (d.type === "FREE_SHIPPING") return "Free Shipping";
    return `${d.value} ${d.currency ?? "PKR"}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Discount Codes</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-charcoal text-white px-6 py-2 text-sm tracking-wider hover:bg-gold transition-colors"
        >
          {showCreate ? "Cancel" : "Create Discount"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none uppercase"
                placeholder="e.g., SUMMER20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as typeof form.type }))}
                className="w-full border border-gray-200 p-2.5 text-sm bg-white focus:border-charcoal focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Value {form.type === "PERCENTAGE" ? "(%)" : form.type === "FIXED" ? "(amount)" : ""}
              </label>
              <input
                type="number"
                value={form.value || ""}
                onChange={(e) => setForm((p) => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none"
                disabled={form.type === "FREE_SHIPPING"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order Amount (optional, in paisa)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
                className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses (optional)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expires (optional)</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!form.code.trim() || creating}
            className="bg-charcoal text-white px-6 py-2 text-sm hover:bg-gold transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Discount"}
          </button>
        </div>
      )}

      {/* Discounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading...</div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center text-medium-gray">No discount codes yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-4 font-medium text-medium-gray">Code</th>
                <th className="text-left p-4 font-medium text-medium-gray">Type</th>
                <th className="text-left p-4 font-medium text-medium-gray">Value</th>
                <th className="text-left p-4 font-medium text-medium-gray">Used</th>
                <th className="text-left p-4 font-medium text-medium-gray">Status</th>
                <th className="text-left p-4 font-medium text-medium-gray">Expires</th>
                <th className="text-left p-4 font-medium text-medium-gray">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-mono font-medium">{d.code}</td>
                  <td className="p-4 text-medium-gray">{d.type.replace("_", " ")}</td>
                  <td className="p-4">{formatValue(d)}</td>
                  <td className="p-4">
                    {d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ""}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(d.id, d.isActive)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {d.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-medium-gray">
                    {d.endsAt ? new Date(d.endsAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(d.id)} className="text-xs text-red-500 hover:text-red-700">
                      Delete
                    </button>
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
