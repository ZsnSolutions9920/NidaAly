"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useLocale } from "@/hooks/use-locale";
import { LOCALES } from "@/lib/locale";

type Step = "info" | "payment" | "confirmation";
type PaymentMethod = "cod" | "stripe";

export default function CheckoutPage() {
  const { items, itemCount, subtotal, isLoading: cartLoading } = useCart();
  const { locale, config, formatPrice } = useLocale();
  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    clientSecret: string;
  } | null>(null);

  // Form state
  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    country: config.countryCode,
    discountCode: "",
    note: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const taxRate = config.taxRate;
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;

  const isFormValid =
    form.email && form.firstName && form.lastName && form.address1 && form.city;

  const handleProceedToPayment = () => {
    if (!isFormValid) return;
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            address1: form.address1,
            address2: form.address2,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone,
          },
          discountCode: form.discountCode || undefined,
          note: form.note || undefined,
          locale,
          currency: config.currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : Array.isArray(data.error)
              ? data.error.map((e: { message: string }) => e.message).join(", ")
              : "Checkout failed. Please try again."
        );
      }

      setOrderResult({
        orderNumber: data.orderNumber,
        clientSecret: data.clientSecret,
      });

      if (paymentMethod === "cod") {
        // COD — order is placed, go straight to confirmation
        setStep("confirmation");
      } else {
        // Stripe — would mount Stripe Elements here in production
        // For now, go to confirmation as well
        setStep("confirmation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while cart is fetching
  if (cartLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-medium-gray">Loading your bag...</p>
      </div>
    );
  }

  if (itemCount === 0 && step !== "confirmation") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-4">Your bag is empty</h1>
        <a href="/" className="text-sm underline text-charcoal hover:text-gold">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {(["info", "payment", "confirmation"] as Step[]).map((s, i) => {
          const labels = { info: "Information", payment: "Payment", confirmation: "Confirmation" };
          const currentIdx = ["info", "payment", "confirmation"].indexOf(step);
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step === s
                    ? "bg-charcoal text-white"
                    : i < currentIdx
                      ? "bg-gold text-white"
                      : "bg-gray-200 text-medium-gray"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-sm hidden sm:inline">{labels[s]}</span>
              {i < 2 && <div className="w-12 h-px bg-gray-200 hidden sm:block" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Customer Info + Shipping Address */}
          {step === "info" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Contact Information</h2>

              <div>
                <label className="block text-sm text-medium-gray mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-medium-gray mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  placeholder="+92 300 1234567"
                />
              </div>

              <h2 className="text-xl font-semibold pt-4">Shipping Address</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-medium-gray mb-1">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-medium-gray mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-medium-gray mb-1">Address</label>
                <input
                  type="text"
                  value={form.address1}
                  onChange={(e) => updateForm("address1", e.target.value)}
                  className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-medium-gray mb-1">Apartment, suite, etc. (optional)</label>
                <input
                  type="text"
                  value={form.address2}
                  onChange={(e) => updateForm("address2", e.target.value)}
                  className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-medium-gray mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-medium-gray mb-1">Province/State</label>
                  <input
                    type="text"
                    value={form.province}
                    onChange={(e) => updateForm("province", e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-medium-gray mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateForm("postalCode", e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-medium-gray mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => updateForm("country", e.target.value)}
                  className="w-full border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none bg-white"
                >
                  {Object.values(LOCALES).map((l) => (
                    <option key={l.countryCode} value={l.countryCode}>
                      {l.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount Code */}
              <div>
                <label className="block text-sm text-medium-gray mb-1">Discount Code (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.discountCode}
                    onChange={(e) => updateForm("discountCode", e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-200 p-3 text-sm focus:border-charcoal focus:outline-none"
                    placeholder="Enter code"
                  />
                  <button className="px-6 border border-charcoal text-sm hover:bg-charcoal hover:text-white transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isFormValid}
                className="w-full bg-charcoal text-white py-3 text-sm tracking-wider hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONTINUE TO PAYMENT
              </button>
            </div>
          )}

          {/* Step 2: Payment Method Selection */}
          {step === "payment" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Payment Method</h2>

              <div className="space-y-3">
                {/* COD Option */}
                <label
                  className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === "cod"
                      ? "border-charcoal bg-light-gray"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-charcoal"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-medium-gray mt-0.5">
                      Pay when your order is delivered to your doorstep
                    </p>
                  </div>
                  <span className="text-lg">💵</span>
                </label>

                {/* Stripe Option */}
                <label
                  className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === "stripe"
                      ? "border-charcoal bg-light-gray"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                    className="accent-charcoal"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-medium-gray mt-0.5">
                      Pay securely with Visa, Mastercard, or other cards
                    </p>
                  </div>
                  <span className="text-lg">💳</span>
                </label>
              </div>

              {/* Stripe card form placeholder (shows only when stripe selected) */}
              {paymentMethod === "stripe" && (
                <div className="border border-gray-200 rounded p-6 bg-light-gray">
                  <p className="text-xs text-medium-gray mb-3 uppercase tracking-wider">Card Details</p>
                  {/*
                    In production, mount Stripe Elements here:
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentElement />
                    </Elements>
                  */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card number"
                      className="w-full border border-gray-200 bg-white p-3 text-sm focus:border-charcoal focus:outline-none"
                      disabled
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="border border-gray-200 bg-white p-3 text-sm focus:border-charcoal focus:outline-none"
                        disabled
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="border border-gray-200 bg-white p-3 text-sm focus:border-charcoal focus:outline-none"
                        disabled
                      />
                    </div>
                    <p className="text-[11px] text-medium-gray">
                      Stripe payment will be enabled once API keys are configured.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("info")}
                  className="px-6 py-3 text-sm text-medium-gray hover:text-charcoal transition-colors"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-charcoal text-white py-3 text-sm tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
                >
                  {isSubmitting
                    ? "PLACING ORDER..."
                    : paymentMethod === "cod"
                      ? "PLACE ORDER (COD)"
                      : "PAY NOW"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirmation" && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Thank You!</h2>
              <p className="text-medium-gray">
                Your order <strong>{orderResult?.orderNumber ?? ""}</strong> has been placed successfully.
              </p>
              {paymentMethod === "cod" && (
                <p className="text-sm text-medium-gray">
                  Payment will be collected at the time of delivery.
                </p>
              )}
              <p className="text-sm text-medium-gray">
                A confirmation email will be sent to <strong>{form.email}</strong>
              </p>
              <a
                href="/"
                className="inline-block mt-6 bg-charcoal text-white px-8 py-3 text-sm tracking-wider hover:bg-gold transition-colors"
              >
                CONTINUE SHOPPING
              </a>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        {step !== "confirmation" && (
          <div className="lg:col-span-2">
            <div className="bg-light-gray p-6 sticky top-24 space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.variant.product.title}
                      {item.variant.title !== "Default" ? ` - ${item.variant.title}` : ""}
                      {" "}
                      <span className="text-medium-gray">x{item.quantity}</span>
                    </span>
                    <span>{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-medium-gray">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-medium-gray">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-medium-gray">
                    {config.taxLabel} ({(taxRate * 100).toFixed(0)}%)
                  </span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {paymentMethod === "cod" && step === "payment" && (
                <p className="text-xs text-medium-gray border-t border-gray-200 pt-3">
                  Cash on Delivery — pay when you receive your order.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
