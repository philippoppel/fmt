"use server";

import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import crypto from "crypto";

export type RegisterResult =
  | { success: true; userId: string; verificationToken?: string }
  | { success: false; error: string };

export async function register(formData: FormData): Promise<RegisterResult> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    acceptTerms: formData.get("terms") === "on",
  };

  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Invalid input";
    return { success: false, error: firstError };
  }

  const { name, email, password } = validatedFields.data;

  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "Email already registered" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user with therapist profile in transaction
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      therapistProfile: {
        create: {
          // Create empty profile - therapist fills in settings later
        },
      },
    },
    include: {
      therapistProfile: true,
    },
  });

  // In development, log the verification link
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] Verification link: /auth/verify?token=${verificationToken}`);
  }

  // Auto sign-in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Sign-in failed but user was created
      return {
        success: true,
        userId: user.id,
        // Only return token in development mode
        verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined,
      };
    }
    throw error;
  }

  return {
    success: true,
    userId: user.id,
    // Only return token in development mode
    verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined,
  };
}

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function login(formData: FormData): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong" };
      }
    }
    throw error;
  }
}

// ============================================
// EMAIL VERIFICATION
// ============================================

export type VerifyEmailResult =
  | { success: true; email: string }
  | { success: false; error: string };

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  if (!token || typeof token !== "string") {
    return { success: false, error: "Invalid verification token" };
  }

  // Find user with this token
  const user = await db.user.findUnique({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired verification token" };
  }

  // Check if token has expired
  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    return { success: false, error: "Verification token has expired. Please request a new one." };
  }

  // Verify the email
  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  return { success: true, email: user.email };
}

export type ResendVerificationResult =
  | { success: true; verificationToken?: string }
  | { success: false; error: string };

export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if email exists or not
    return { success: true };
  }

  if (user.emailVerified) {
    return { success: false, error: "Email is already verified" };
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

  // In development, log the verification link
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] New verification link: /auth/verify?token=${verificationToken}`);
  }

  return {
    success: true,
    verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined,
  };
}
