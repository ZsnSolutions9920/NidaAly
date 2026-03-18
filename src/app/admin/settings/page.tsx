"use client";

import { useEffect, useState } from "react";

interface ShippingRate {
  id: string;
  name: string;
  pricePKR: number;
  priceAED: number;
  priceUSD: number;
  estimatedDays: string | null;
  isActive: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

interface TaxRate {
  id: string;
  name: string;
  country: string;
  province: string | null;
  rate: number;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setShippingZones(data.shippingZones ?? []);
    setTaxRates(data.taxRates ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateShippingRate = async (id: string, updates: Partial<ShippingRate>) => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateShippingRate", id, ...updates }),
    });
    setSaving(false);
    fetchSettings();
  };

  const updateTaxRate = async (id: string, rate: number, isActive: boolean) => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTaxRate", id, rate, isActive }),
    });
    setSaving(false);
    fetchSettings();
  };

  if (loading) return <div className="p-8 text-medium-gray">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Shipping Zones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping Zones & Rates</h2>
        {shippingZones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-4 bg-light-gray border-b border-gray-100">
              <h3 className="font-medium">{zone.name}</h3>
              <p className="text-xs text-medium-gray">Countries: {zone.countries.join(", ")}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-medium-gray">Rate Name</th>
                  <th className="text-left p-3 font-medium text-medium-gray">PKR (paisa)</th>
                  <th className="text-left p-3 font-medium text-medium-gray">AED (fils)</th>
                  <th className="text-left p-3 font-medium text-medium-gray">USD (cents)</th>
                  <th className="text-left p-3 font-medium text-medium-gray">Est. Days</th>
                  <th className="text-left p-3 font-medium text-medium-gray">Status</th>
                </tr>
              </thead>
              <tbody>
                {zone.rates.map((rate) => (
                  <tr key={rate.id} className="border-b border-gray-50">
                    <td className="p-3">{rate.name}</td>
                    <td className="p-3">
                      <input type="number" defaultValue={rate.pricePKR} onBlur={(e) => updateShippingRate(rate.id, { pricePKR: parseInt(e.target.value) || 0 })} className="w-20 border border-gray-200 p-1 text-sm focus:border-charcoal focus:outline-none" />
                    </td>
                    <td className="p-3">
                      <input type="number" defaultValue={rate.priceAED} onBlur={(e) => updateShippingRate(rate.id, { priceAED: parseInt(e.target.value) || 0 })} className="w-20 border border-gray-200 p-1 text-sm focus:border-charcoal focus:outline-none" />
                    </td>
                    <td className="p-3">
                      <input type="number" defaultValue={rate.priceUSD} onBlur={(e) => updateShippingRate(rate.id, { priceUSD: parseInt(e.target.value) || 0 })} className="w-20 border border-gray-200 p-1 text-sm focus:border-charcoal focus:outline-none" />
                    </td>
                    <td className="p-3 text-medium-gray">{rate.estimatedDays ?? "-"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => updateShippingRate(rate.id, { isActive: !rate.isActive })}
                        disabled={saving}
                        className={`px-2 py-0.5 rounded-full text-xs ${rate.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {rate.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Tax Rates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tax Rates</h2>
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-light-gray">
                <th className="text-left p-3 font-medium text-medium-gray">Name</th>
                <th className="text-left p-3 font-medium text-medium-gray">Country</th>
                <th className="text-left p-3 font-medium text-medium-gray">Rate (%)</th>
                <th className="text-left p-3 font-medium text-medium-gray">Status</th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map((tax) => (
                <tr key={tax.id} className="border-b border-gray-50">
                  <td className="p-3">{tax.name}</td>
                  <td className="p-3">{tax.country}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={tax.rate * 100}
                      onBlur={(e) => updateTaxRate(tax.id, parseFloat(e.target.value) / 100 || 0, tax.isActive)}
                      className="w-20 border border-gray-200 p-1 text-sm focus:border-charcoal focus:outline-none"
                    />
                    <span className="text-medium-gray ml-1">%</span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateTaxRate(tax.id, tax.rate, !tax.isActive)}
                      disabled={saving}
                      className={`px-2 py-0.5 rounded-full text-xs ${tax.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {tax.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Store Information</h2>
        <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Store Name</label><input type="text" defaultValue="NidaAly" className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Contact Email</label><input type="email" defaultValue="info@nidaaly.pk" className="w-full border border-gray-200 p-2.5 text-sm focus:border-charcoal focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Currency (PK)</label><input type="text" defaultValue="PKR" disabled className="w-full border border-gray-200 p-2.5 text-sm bg-light-gray" /></div>
            <div><label className="block text-sm font-medium mb-1">Currency (AE)</label><input type="text" defaultValue="AED" disabled className="w-full border border-gray-200 p-2.5 text-sm bg-light-gray" /></div>
            <div><label className="block text-sm font-medium mb-1">Currency (US)</label><input type="text" defaultValue="USD" disabled className="w-full border border-gray-200 p-2.5 text-sm bg-light-gray" /></div>
          </div>
          <p className="text-xs text-medium-gray">Multi-region subdomains: pk.nidaaly.com | ae.nidaaly.com | us.nidaaly.com</p>
        </div>
      </div>
    </div>
  );
}
