"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CollectionOption {
  id: string;
  title: string;
}

export default function AdminProductNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    productType: "",
    vendor: "NidaAly",
    tags: "",
    status: "DRAFT" as "DRAFT" | "ACTIVE",
    pricePKR: "",
    priceAED: "",
    priceUSD: "",
    compareAtPKR: "",
    seoTitle: "",
    seoDescription: "",
  });

  const [images, setImages] = useState<{ url: string; altText: string }[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<CollectionOption[]>([]);

  const [variants, setVariants] = useState([
    { title: "Default", sku: "", pricePKR: "", priceAED: "", priceUSD: "", inventoryQty: "0", option1: "" },
  ]);

  const [options, setOptions] = useState<{ name: string; values: string }[]>([]);

  // Fetch collections for selector
  useEffect(() => {
    fetch("/api/admin/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data.items ?? []))
      .catch(() => {});
  }, []);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImages((prev) => [
        ...prev,
        ...data.files.map((f: { url: string; name: string }) => ({ url: f.url, altText: f.name })),
      ]);
    } catch {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addOption = () => setOptions((p) => [...p, { name: "", values: "" }]);
  const removeOption = (i: number) => setOptions((p) => p.filter((_, idx) => idx !== i));

  const addVariant = () => setVariants((p) => [...p, { title: "", sku: "", pricePKR: "", priceAED: "", priceUSD: "", inventoryQty: "0", option1: "" }]);
  const removeVariant = (i: number) => setVariants((p) => p.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: string) => {
    setVariants((p) => p.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError(null);

    const basePricePKR = parseInt(form.pricePKR) || 0;

    const body = {
      title: form.title,
      description: form.description || undefined,
      productType: form.productType || undefined,
      vendor: form.vendor || undefined,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: form.status,
      pricePKR: basePricePKR,
      priceAED: parseInt(form.priceAED) || undefined,
      priceUSD: parseInt(form.priceUSD) || undefined,
      compareAtPKR: parseInt(form.compareAtPKR) || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      images: images.map((img, i) => ({ url: img.url, altText: img.altText, position: i })),
      collectionIds: Array.from(selectedCollections),
      options: options.filter((o) => o.name && o.values).map((o, i) => ({
        name: o.name,
        values: o.values.split(",").map((v) => v.trim()).filter(Boolean),
        position: i,
      })),
      variants: variants.filter((v) => v.title).map((v, i) => ({
        title: v.title,
        sku: v.sku || undefined,
        pricePKR: parseInt(v.pricePKR) || basePricePKR,
        priceAED: parseInt(v.priceAED) || undefined,
        priceUSD: parseInt(v.priceUSD) || undefined,
        inventoryQty: parseInt(v.inventoryQty) || 0,
        option1: v.option1 || v.title,
        position: i,
      })),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create");
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/admin/products")} className="text-sm text-medium-gray hover:text-charcoal mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
          <h1 className="text-2xl font-semibold">New Product</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/admin/products")} className="px-4 py-2 text-sm text-medium-gray hover:text-charcoal">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-charcoal text-white px-6 py-2 text-sm hover:bg-gold transition-colors disabled:opacity-50 rounded-lg">
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm rounded">{error}</div>}

      {/* Images */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Images</h2>
          <label className={`text-sm cursor-pointer ${uploading ? "text-medium-gray" : "text-gold hover:underline"}`}>
            {uploading ? "Uploading..." : "+ Upload Images"}
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
        {images.length === 0 ? (
          <label className="block border-2 border-dashed border-gray-200 rounded-lg p-10 text-center cursor-pointer hover:border-charcoal transition-colors">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-medium-gray">{uploading ? "Uploading..." : "Click to upload product images"}</p>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <Image src={img.url} alt={img.altText} fill className="object-cover" sizes="200px" />
                {i === 0 && <span className="absolute top-2 left-2 bg-charcoal text-white text-[10px] px-2 py-0.5 rounded">Primary</span>}
                <button onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm h-24 resize-none focus:border-charcoal focus:outline-none rounded" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <input type="text" value={form.productType} onChange={(e) => update("productType", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" placeholder="e.g., Bridal Lehenga" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input type="text" value={form.vendor} onChange={(e) => update("vendor", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm bg-white focus:border-charcoal focus:outline-none rounded">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" placeholder="bridal, lehenga, red" />
        </div>
      </div>

      {/* Categories / Collections */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold">Categories</h2>
        <p className="text-xs text-medium-gray">Select which categories this product belongs to</p>
        {collections.length === 0 ? (
          <p className="text-sm text-medium-gray">No categories yet. Create them in the Collections page.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {collections.map((col) => (
              <label
                key={col.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedCollections.has(col.id)
                    ? "border-charcoal bg-charcoal/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.has(col.id)}
                  onChange={() => toggleCollection(col.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">{col.title}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold">Pricing</h2>
        <div className="grid grid-cols-4 gap-4">
          <div><label className="block text-xs text-medium-gray mb-1">Price PKR</label><input type="number" value={form.pricePKR} onChange={(e) => update("pricePKR", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
          <div><label className="block text-xs text-medium-gray mb-1">Price AED</label><input type="number" value={form.priceAED} onChange={(e) => update("priceAED", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
          <div><label className="block text-xs text-medium-gray mb-1">Price USD</label><input type="number" value={form.priceUSD} onChange={(e) => update("priceUSD", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
          <div><label className="block text-xs text-medium-gray mb-1">Compare At PKR</label><input type="number" value={form.compareAtPKR} onChange={(e) => update("compareAtPKR", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Options (Size, Color, etc.)</h2>
          <button onClick={addOption} className="text-sm text-gold hover:underline">+ Add Option</button>
        </div>
        {options.map((opt, i) => (
          <div key={i} className="grid grid-cols-5 gap-3 items-end">
            <div className="col-span-2"><label className="block text-xs text-medium-gray mb-1">Name</label><input type="text" value={opt.name} onChange={(e) => setOptions((p) => p.map((o, idx) => idx === i ? { ...o, name: e.target.value } : o))} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" placeholder="e.g., Size" /></div>
            <div className="col-span-2"><label className="block text-xs text-medium-gray mb-1">Values (comma separated)</label><input type="text" value={opt.values} onChange={(e) => setOptions((p) => p.map((o, idx) => idx === i ? { ...o, values: e.target.value } : o))} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" placeholder="XS, S, M, L, XL" /></div>
            <button onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 text-sm pb-2">Remove</button>
          </div>
        ))}
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Variants</h2>
          <button onClick={addVariant} className="text-sm text-gold hover:underline">+ Add Variant</button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-6 gap-3 items-end border-b border-gray-50 pb-3 last:border-0">
            <div><label className="block text-xs text-medium-gray mb-1">Title</label><input type="text" value={v.title} onChange={(e) => updateVariant(i, "title", e.target.value)} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
            <div><label className="block text-xs text-medium-gray mb-1">SKU</label><input type="text" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
            <div><label className="block text-xs text-medium-gray mb-1">Price PKR</label><input type="number" value={v.pricePKR} onChange={(e) => updateVariant(i, "pricePKR", e.target.value)} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
            <div><label className="block text-xs text-medium-gray mb-1">Price AED</label><input type="number" value={v.priceAED} onChange={(e) => updateVariant(i, "priceAED", e.target.value)} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
            <div><label className="block text-xs text-medium-gray mb-1">Stock</label><input type="number" value={v.inventoryQty} onChange={(e) => updateVariant(i, "inventoryQty", e.target.value)} className="w-full border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
            <button onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 text-sm pb-2" disabled={variants.length === 1}>Remove</button>
          </div>
        ))}
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold">SEO</h2>
        <div><label className="block text-sm font-medium mb-1">Page Title</label><input type="text" value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none rounded" /></div>
        <div><label className="block text-sm font-medium mb-1">Meta Description</label><textarea value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} className="w-full border border-gray-200 p-2.5 text-sm h-16 resize-none focus:border-charcoal focus:outline-none rounded" /></div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="bg-charcoal text-white px-8 py-3 text-sm tracking-wider hover:bg-gold transition-colors disabled:opacity-50 rounded-lg">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}
