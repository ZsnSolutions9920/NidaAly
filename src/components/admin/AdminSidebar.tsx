"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Products", href: "/admin/products", icon: "🏷️" },
  { label: "Inventory", href: "/admin/inventory", icon: "📋" },
  { label: "Collections", href: "/admin/collections", icon: "📁" },
  { label: "Customers", href: "/admin/customers", icon: "👥" },
  { label: "Discounts", href: "/admin/discounts", icon: "🎫" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-charcoal text-white flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="text-xl font-semibold tracking-wider">
          NidaAly Admin
        </Link>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-r-2 border-gold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <Link
          href="/"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          View Store &rarr;
        </Link>
      </div>
    </aside>
  );
}
