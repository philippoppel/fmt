"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { createLabellerSchema, updateUserRoleSchema } from "@/lib/validations/labelling";
import type { ActionResult } from "@/types/labelling";
import { UserRole } from "@prisma/client";

/**
 * Check if user is admin
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Nicht authentifiziert", user: null };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Admin-Berechtigung erforderlich", user: null };
  }
  return { error: null, user: session.user };
}

/**
 * Create a new labeller account
 */
export async function createLabeller(input: {
  email: string;
  name: string;
  password: string;
  role?: "LABELLER" | "ADMIN";
}): Promise<ActionResult<{ id: string; email: string }>> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  const validation = createLabellerSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  const { email, name, password, role } = validation.data;

  try {
    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "E-Mail bereits registriert" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "LABELLER",
        isActive: true,
      },
    });

    revalidatePath("/labelling/admin/users");

    return {
      success: true,
      data: { id: newUser.id, email: newUser.email },
    };
  } catch (err) {
    console.error("Create labeller error:", err);
    return { success: false, error: "Fehler beim Erstellen des Kontos" };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  const validation = updateUserRoleSchema.safeParse({ userId, role });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Ungültige Eingabe",
    };
  }

  // Prevent self-demotion
  if (userId === user.id && role !== "ADMIN") {
    return { success: false, error: "Eigene Rolle kann nicht herabgestuft werden" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/labelling/admin/users");

    return { success: true };
  } catch (err) {
    console.error("Update user role error:", err);
    return { success: false, error: "Fehler beim Aktualisieren der Rolle" };
  }
}

/**
 * Delete labeller account (only if they have no labels)
 */
export async function deleteLabeller(userId: string): Promise<ActionResult> {
  const { error, user } = await requireAdmin();
  if (error || !user) {
    return { success: false, error: error || "Admin-Berechtigung erforderlich" };
  }

  // Prevent self-deletion
  if (userId === user.id) {
    return { success: false, error: "Eigenes Konto kann nicht gelöscht werden" };
  }

  try {
    // Check if user has labels
    const labelCount = await db.label.count({
      where: { raterId: userId },
    });

    if (labelCount > 0) {
      return {
        success: false,
        error: `Benutzer hat ${labelCount} Labels und kann nicht gelöscht werden`,
      };
    }

    await db.user.delete({
      where: { id: userId },
    });

    revalidatePath("/labelling/admin/users");

    return { success: true };
  } catch (err) {
    console.error("Delete labeller error:", err);
    return { success: false, error: "Fehler beim Löschen des Kontos" };
  }
}
