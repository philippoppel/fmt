import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import authConfig from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  providers: [
    ...authConfig.providers.filter((p) => p.id !== "credentials"),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            image: true,
            twoFactorEnabled: true,
            isActive: true,
            failedLoginAttempts: true,
            lockedUntil: true,
            role: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        // Check if account is active
        if (!user.isActive) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          // Increment failed attempts
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
              lockedUntil:
                user.failedLoginAttempts >= 4
                  ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 min after 5 attempts
                  : null,
            },
          });
          return null;
        }

        // Reset failed attempts on successful login
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          twoFactorEnabled: user.twoFactorEnabled,
          role: user.role,
        };
      },
    }),
  ],
});
