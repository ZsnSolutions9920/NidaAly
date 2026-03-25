"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface CollectionProduct {
  position: number;
  product: {
    id: string;
    title: string;
    slug: string;
    status: string;
    images: { url: string }[];
  };
}

interface CollectionData {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  isVisible: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: string | null;
  products: CollectionProduct[];
}

interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  status: string;
  images: { url: string }[];
}

export default function AdminCollectionEditPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    isVisible: true,
    seoTitle: "",
    seoDescription: "",
    sortOrder: "MANUAL",
  });

  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/collections/${collectionId}`);
      if (!res.ok) throw new Error("Collection not found");
      const data: CollectionData = await res.json();

      setForm({
        title: data.title,
        description: data.description ?? "",
        imageUrl: data.imageUrl ?? "",
        isVisible: data.isVisible,
        seoTitle: data.seoTitle ?? "",
        seoDescription: data.seoDescription ?? "",
        sortOrder: data.sortOrder ?? "MANUAL",
      });
      setProducts(data.products);
    } catch {
      setError("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("files", files[0]);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((p) => ({ ...p, imageUrl: data.files[0].url }));
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      const existingIds = new Set(products.map((p) => p.product.id));
      setSearchResults((data.items ?? []).filter((p: SearchProduct) => !existingIds.has(p.id)));
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const addProduct = (product: SearchProduct) => {
    setProducts((prev) => [
      ...prev,
      {
        position: prev.length,
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          status: product.status,
          images: product.images,
        },
      },
    ]);
    setSearchResults((prev) => prev.filter((p) => p.id !== product.id));
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.product.id !== productId));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          isVisible: form.isVisible,
          seoTitle: form.seoTitle || undefined,
          seoDescription: form.seoDescription || undefined,
          sortOrder: form.sortOrder,
          productIds: products.map((p) => p.product.id),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this collection? Products won't be deleted.")) return;
    try {
      await fetch(`/api/admin/collections/${collectionId}`, { method: "DELETE" });
      router.push("/admin/collections");
    } catch {
      setError("Failed to delete collection");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-48 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/collections")}
            className="text-sm text-medium-gray hover:text-charcoal mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collections
          </button>
          <h1 className="text-2xl font-semibold">Edit Collection</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-4 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
            Delete
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-charcoal text-white px-6 py-2 text-sm hover:bg-gold transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm rounded">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-sm rounded">Collection saved successfully!</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold">Collection Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full border border-gray-200 p-2.5 text-sm h-24 resize-none focus:border-charcoal focus:outline-none rounded"
              />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold">Products ({products.length})</h2>

            {/* Search to add */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                placeholder="Search products to add..."
                className="flex-1 border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded"
              />
              <button
                onClick={searchProducts}
                disabled={searching}
                className="px-4 py-2 bg-charcoal text-white text-sm hover:bg-gold transition-colors disabled:opacity-50 rounded"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                          <Image src={p.images[0].url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-sm">{p.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.status}
                      </span>
                    </div>
                    <button
                      onClick={() => addProduct(p)}
                      className="text-xs text-gold hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Current products */}
            {products.length === 0 ? (
              <p className="text-sm text-medium-gray py-4 text-center">No products in this collection. Search above to add products.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {products.map((cp) => (
                  <div key={cp.product.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {cp.product.images[0] ? (
                          <Image src={cp.product.images[0].url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cp.product.title}</p>
                        <p className="text-xs text-medium-gray">/{cp.product.slug}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProduct(cp.product.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold">SEO</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input type="text" value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm h-16 resize-none focus:border-charcoal focus:outline-none rounded" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Visibility */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold">Visibility</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => update("isVisible", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Visible on storefront</span>
            </label>
          </div>

          {/* Collection Image */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold">Collection Image</h2>
            {form.imageUrl ? (
              <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
                <Image src={form.imageUrl} alt="Collection" fill className="object-cover" sizes="300px" />
                <button
                  onClick={() => update("imageUrl", "")}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className={`block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-charcoal transition-colors ${uploading ? "opacity-50" : ""}`}>
                <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-medium-gray">{uploading ? "Uploading..." : "Click to upload"}</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Sort Order */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold">Sort Order</h2>
            <select
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", e.target.value)}
              className="w-full border border-gray-200 p-2.5 text-sm bg-white focus:border-charcoal focus:outline-none rounded"
            >
              <option value="MANUAL">Manual</option>
              <option value="BEST_SELLING">Best Selling</option>
              <option value="TITLE_ASC">Title (A-Z)</option>
              <option value="TITLE_DESC">Title (Z-A)</option>
              <option value="PRICE_ASC">Price (Low to High)</option>
              <option value="PRICE_DESC">Price (High to Low)</option>
              <option value="CREATED_DESC">Newest First</option>
              <option value="CREATED_ASC">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
