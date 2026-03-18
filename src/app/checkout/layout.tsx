import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | NidaAly",
};

/**
 * Checkout uses a minimal layout without the standard header/footer.
 * The root layout's header/footer still renders unless we override.
 * For a truly minimal checkout, wrap children without extra nav.
 */
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
