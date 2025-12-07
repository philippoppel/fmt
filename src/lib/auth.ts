import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

// Adapter wird aktiviert sobald Datenbank eingerichtet ist:
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "@/lib/db";
// adapter: PrismaAdapter(db),

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
});
