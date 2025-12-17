import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Configure WebSocket for Node.js environment (required for Vercel serverless)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // In production on Vercel, use Neon serverless driver
  if (process.env.VERCEL) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // During build time, DATABASE_URL might not be available
      // Return a placeholder that will be replaced at runtime
      console.warn("[db] DATABASE_URL not set, using placeholder client");
      return new PrismaClient();
    }
    // PrismaNeon takes a PoolConfig, not a Pool instance
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({
      adapter,
      log: ["error"],
    });
  }

  // In development, use standard Prisma client
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Lazy initialization to avoid build-time errors
let _db: PrismaClient | undefined;
let _dbHasConnection = false;

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    // In production, always check if we have a proper connection
    // This handles the case where DATABASE_URL wasn't available during build
    if (process.env.VERCEL && !_dbHasConnection && process.env.DATABASE_URL) {
      _db = undefined; // Force recreation with proper connection
      globalForPrisma.prisma = undefined;
    }

    if (!_db) {
      _db = globalForPrisma.prisma ?? createPrismaClient();
      _dbHasConnection = !!process.env.DATABASE_URL;
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = _db;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_db as any)[prop];
  },
});
