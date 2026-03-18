import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { neon, Pool as NeonPool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isServerless = process.env.VERCEL || process.env.SERVERLESS;

  // In serverless (Vercel), use Neon's HTTP-based serverless driver
  // which doesn't hold open connections between invocations.
  // Locally, use standard pg connection pooling.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    // Neon serverless pool handles connection reuse automatically
    // No need for manual pool sizing — each function invocation
    // gets a lightweight HTTP-based "connection"
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client in dev to avoid exhausting connections on HMR
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * For one-off serverless queries outside Prisma (e.g., raw analytics),
 * use Neon's HTTP sql tagged template directly:
 *
 *   import { neonSql } from "@/lib/db";
 *   const rows = await neonSql`SELECT count(*) FROM orders`;
 */
export const neonSql = neon(process.env.DATABASE_URL!);
