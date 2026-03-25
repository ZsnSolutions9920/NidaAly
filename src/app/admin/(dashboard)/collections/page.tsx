"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Collection {
  id: string;
  title: string;
  slug: string;
  isVisible: boolean;
  position: number;
  imageUrl: string | null;
  _count: { products: number };
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/collections");
    const data = await res.json();
    setCollections(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    });
    setNewTitle("");
    setNewDescription("");
    setShowCreate(false);
    setCreating(false);
    fetchCollections();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection? Products won't be deleted.")) return;
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    fetchCollections();
  };

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    await fetch(`/api/admin/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !isVisible }),
    });
    fetchCollections();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-charcoal text-white px-6 py-2 text-sm tracking-wider hover:bg-gold transition-colors"
        >
          {showCreate ? "Cancel" : "Create Collection"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none"
              placeholder="e.g., Summer Collection 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none h-20 resize-none"
              placeholder="Optional description..."
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim() || creating}
            className="bg-charcoal text-white px-6 py-2 text-sm hover:bg-gold transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {/* Collections List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-medium-gray">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-medium-gray">No collections yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-4 font-medium text-medium-gray">Collection</th>
                <th className="text-left p-4 font-medium text-medium-gray">Products</th>
                <th className="text-left p-4 font-medium text-medium-gray">Visibility</th>
                <th className="text-left p-4 font-medium text-medium-gray">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/admin/collections/${col.id}`} className="font-medium hover:text-gold">
                      {col.title}
                    </Link>
                    <p className="text-xs text-medium-gray mt-0.5">/{col.slug}</p>
                  </td>
                  <td className="p-4">{col._count.products} products</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleVisibility(col.id, col.isVisible)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        col.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {col.isVisible ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
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
