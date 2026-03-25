import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { neon } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please configure it in your .env.local file or Vercel environment variables."
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

// Lazy singleton: only create on first access
const handler: ProxyHandler<PrismaClient> = {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  },
};

export const db = new Proxy({} as PrismaClient, handler);

/**
 * For one-off serverless queries outside Prisma (e.g., raw analytics),
 * use Neon's HTTP sql tagged template directly:
 *
 *   import { neonSql } from "@/lib/db";
 *   const rows = await neonSql`SELECT count(*) FROM orders`;
 */
export const neonSql = (() => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
})();
