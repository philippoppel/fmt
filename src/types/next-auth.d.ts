import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      twoFactorEnabled?: boolean;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    twoFactorEnabled?: boolean;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    twoFactorEnabled?: boolean;
    role?: UserRole;
  }
}
