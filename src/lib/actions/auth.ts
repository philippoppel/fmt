"use server";

import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type RegisterResult =
  | { success: true; userId: string }
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

  // Create user with therapist profile in transaction
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
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
      return { success: true, userId: user.id };
    }
    throw error;
  }

  return { success: true, userId: user.id };
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
