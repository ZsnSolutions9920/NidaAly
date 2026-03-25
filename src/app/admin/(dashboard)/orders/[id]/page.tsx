"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  currency: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  financialStatus: string;
  fulfillmentStatus: string;
  orderStatus: string;
  discountCode: string | null;
  note: string | null;
  internalNote: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string } | null;
  shippingAddress: { firstName: string; lastName: string; address1: string; city: string; province: string | null; postalCode: string | null; country: string } | null;
  items: { id: string; productTitle: string; variantTitle: string | null; sku: string | null; quantity: number; unitPrice: number; totalPrice: number; productImageUrl: string | null; fulfillmentId: string | null }[];
  fulfillments: { id: string; status: string; trackingNumber: string | null; trackingCompany: string | null; createdAt: string }[];
  refunds: { id: string; amount: number; reason: string | null; createdAt: string }[];
  timeline: { id: string; type: string; message: string; createdAt: string }[];
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCompany, setTrackingCompany] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const fetchOrder = () => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setInternalNote(data.internalNote ?? ""); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const doAction = async (action: string, body: Record<string, unknown> = {}) => {
    setActionLoading(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    setActionLoading(false);
    fetchOrder();
  };

  if (loading) return <div className="p-8 text-medium-gray">Loading...</div>;
  if (!order) return <div className="p-8 text-medium-gray">Order not found</div>;

  const sym = order.currency === "PKR" ? "₨" : order.currency === "AED" ? "د.إ" : "$";
  const fmt = (v: number) => `${sym}${(v / 100).toLocaleString()}`;
  const unfulfilledItems = order.items.filter((i) => !i.fulfillmentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-medium-gray hover:text-charcoal">&larr;</Link>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.financialStatus === "PAID" ? "bg-green-100 text-green-700" : order.financialStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
            {order.financialStatus}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.fulfillmentStatus === "FULFILLED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {order.fulfillmentStatus}
          </span>
        </div>
        {order.orderStatus === "OPEN" && (
          <button onClick={() => { if (confirm("Cancel this order?")) doAction("cancel"); }} disabled={actionLoading} className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50">
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Fulfillment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h2 className="font-semibold">Items</h2></div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  {item.productImageUrl && <img src={item.productImageUrl} alt="" className="w-12 h-14 object-cover bg-light-gray" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.productTitle}</p>
                    {item.variantTitle && <p className="text-xs text-medium-gray">{item.variantTitle}</p>}
                    {item.sku && <p className="text-xs text-medium-gray">SKU: {item.sku}</p>}
                  </div>
                  <p className="text-sm text-medium-gray">x{item.quantity}</p>
                  <p className="text-sm font-medium w-24 text-right">{fmt(item.totalPrice)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.fulfillmentId ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {item.fulfillmentId ? "Fulfilled" : "Unfulfilled"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfill */}
          {unfulfilledItems.length > 0 && order.orderStatus !== "CANCELLED" && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
              <h2 className="font-semibold">Fulfill Items ({unfulfilledItems.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none" />
                <input type="text" placeholder="Carrier (e.g., TCS, Leopards)" value={trackingCompany} onChange={(e) => setTrackingCompany(e.target.value)} className="border border-gray-200 p-2 text-sm focus:border-charcoal focus:outline-none" />
              </div>
              <button
                onClick={() => doAction("fulfill", { itemIds: unfulfilledItems.map((i) => i.id), trackingNumber: trackingNumber || undefined, trackingCompany: trackingCompany || undefined })}
                disabled={actionLoading}
                className="bg-charcoal text-white px-4 py-2 text-sm hover:bg-gold transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Mark as Fulfilled"}
              </button>
            </div>
          )}

          {/* Refund */}
          {order.financialStatus === "PAID" && order.orderStatus !== "CANCELLED" && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
              <h2 className="font-semibold">Issue Refund</h2>
              <div className="flex gap-3">
                <input type="number" placeholder={`Amount (max ${order.grandTotal / 100})`} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="border border-gray-200 p-2 text-sm flex-1 focus:border-charcoal focus:outline-none" />
                <button
                  onClick={() => { if (confirm(`Refund ${sym}${refundAmount}?`)) doAction("refund", { amount: parseInt(refundAmount) * 100, reason: "requested_by_customer" }); }}
                  disabled={actionLoading || !refundAmount}
                  className="bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Refund
                </button>
              </div>
            </div>
          )}

          {/* Existing Fulfillments */}
          {order.fulfillments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2">
              <h2 className="font-semibold">Fulfillments</h2>
              {order.fulfillments.map((f) => (
                <div key={f.id} className="flex justify-between text-sm border-b border-gray-50 py-2 last:border-0">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-xs mr-2 ${f.status === "DELIVERED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{f.status}</span>
                    {f.trackingNumber && <span className="text-medium-gray">{f.trackingCompany}: {f.trackingNumber}</span>}
                  </div>
                  <span className="text-medium-gray">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Refunds */}
          {order.refunds.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2">
              <h2 className="font-semibold">Refunds</h2>
              {order.refunds.map((r) => (
                <div key={r.id} className="flex justify-between text-sm border-b border-gray-50 py-2 last:border-0">
                  <span>{fmt(r.amount)} — {r.reason ?? "No reason"}</span>
                  <span className="text-medium-gray">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2 text-sm">
            <h2 className="font-semibold mb-3">Summary</h2>
            <div className="flex justify-between"><span className="text-medium-gray">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-medium-gray">Shipping</span><span>{fmt(order.shippingTotal)}</span></div>
            <div className="flex justify-between"><span className="text-medium-gray">Tax</span><span>{fmt(order.taxTotal)}</span></div>
            {order.discountTotal > 0 && <div className="flex justify-between"><span className="text-medium-gray">Discount ({order.discountCode})</span><span className="text-green-600">-{fmt(order.discountTotal)}</span></div>}
            <hr className="border-gray-100" />
            <div className="flex justify-between font-semibold"><span>Total</span><span>{fmt(order.grandTotal)}</span></div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 text-sm">
            <h2 className="font-semibold mb-3">Customer</h2>
            {order.user ? (
              <Link href={`/admin/customers/${order.user.email}`} className="text-gold hover:underline">
                {order.user.firstName} {order.user.lastName}
              </Link>
            ) : (
              <span className="text-medium-gray">Guest</span>
            )}
            <p className="text-medium-gray mt-1">{order.email}</p>
            {order.phone && <p className="text-medium-gray">{order.phone}</p>}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 text-sm">
              <h2 className="font-semibold mb-3">Shipping Address</h2>
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p className="text-medium-gray">{order.shippingAddress.address1}</p>
              <p className="text-medium-gray">{order.shippingAddress.city}{order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ""} {order.shippingAddress.postalCode}</p>
              <p className="text-medium-gray">{order.shippingAddress.country}</p>
            </div>
          )}

          {/* Internal Note */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 text-sm space-y-2">
            <h2 className="font-semibold">Internal Note</h2>
            <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} className="w-full border border-gray-200 p-2 text-sm h-20 resize-none focus:border-charcoal focus:outline-none" placeholder="Add a note..." />
            <button onClick={() => doAction("add_note", { note: internalNote })} disabled={actionLoading} className="text-xs bg-charcoal text-white px-3 py-1.5 hover:bg-gold transition-colors disabled:opacity-50">
              Save Note
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 text-sm">
            <h2 className="font-semibold mb-3">Timeline</h2>
            <div className="space-y-3">
              {order.timeline.map((e) => (
                <div key={e.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-medium-gray">{e.message}</p>
                    <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
