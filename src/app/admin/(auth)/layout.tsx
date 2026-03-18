/**
 * Auth route group layout — renders without the admin sidebar/auth check.
 * Pages: /admin/login
 */
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
